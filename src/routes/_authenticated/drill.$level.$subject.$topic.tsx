import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Target } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { LEVEL_SHORT, isLevel, isSubject, pageHead, subjectUi } from "@/components/subject-ui";
import { SUBJECT_NAMES } from "@/data/catalog";
import { analyzeSubject } from "@/data/analysis";
import type { Exam, Question } from "@/data/exam-types";
import { getDrillSet } from "@/lib/drill.functions";
import { useAccount } from "@/lib/session";
import { loadAttempts, saveAttempt } from "@/lib/progress";
import { topicSkill } from "@/lib/skill";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/drill/$level/$subject/$topic")({
  loader: ({ params }) => {
    if (!isLevel(params.level) || !isSubject(params.subject)) throw notFound();
    const t = analyzeSubject(params.level, params.subject).topics[Number(params.topic)];
    if (!t) throw notFound();
    return { level: params.level, subject: params.subject, topic: t.topic };
  },
  head: ({ loaderData }) => loaderData
    ? pageHead(`ข้อสอบย่อย: ${loaderData.topic} · PRE O-NET`, `ฝึก 20 ข้อเรื่อง ${loaderData.topic} ${SUBJECT_NAMES[loaderData.subject]} ${LEVEL_SHORT[loaderData.level]} แนว O-NET`)
    : pageHead("ข้อสอบย่อย · PRE O-NET", "ข้อสอบฝึกรายเรื่องแนว O-NET"),
  component: DrillPage,
});

function DrillPage() {
  const { level, subject, topic } = Route.useLoaderData();
  const { topic: idx } = Route.useParams();
  const s = subjectUi(subject);
  const acc = useAccount();
  const account = acc ?? null;
  const loading = acc === undefined;
  const fetchSet = useServerFn(getDrillSet);
  const [items, setItems] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: number; total: number; skill: number | null } | null>(null);
  const [round, setRound] = useState(0);

  const load = () => {
    setError(null); setItems(null);
    fetchSet({ data: { level, subject, topic } })
      .then((r) => (r.error ? setError(r.error) : setItems(r.items)))
      .catch(() => setError("โหลดข้อสอบไม่สำเร็จ ลองใหม่อีกครั้ง"));
  };
  useEffect(() => { if (account) load(); }, [account, level, subject, topic]); // eslint-disable-line react-hooks/exhaustive-deps

  const exam: Exam | null = useMemo(() => items && ({ level, subject, year: 0, title: `ข้อสอบย่อย: ${topic}`, code: "ฝึก", examDate: "", minutes: 40, questions: items }), [items, level, subject, topic]);
  const sid = `drill-${level}-${subject}-${idx}`;

  const onStatus = (sub: boolean, answers: Record<string, unknown>) => {
    if (!sub || !exam || result) return;
    const a = saveAttempt("drill", `${sid}-${Date.now()}`, exam, answers, `ข้อสอบย่อย: ${topic}`, { back: window.location.pathname });
    const correct = a.items.filter((i) => i.correct).length;
    setResult({ correct, total: a.items.length, skill: topicSkill(loadAttempts(), level, subject, topic).skill });
  };

  let body;
  if (loading) body = <Center><Loader2 className="h-6 w-6 animate-spin" /></Center>;
  else if (!account) body = <Center><p>ข้อสอบย่อยต้องเข้าสู่ระบบก่อน</p><Link to="/login" className={cn("rounded-xl px-4 py-2 font-semibold text-primary-foreground", s.color)}>เข้าสู่ระบบ</Link></Center>;
  else if (error) body = <Center><p>{error}</p><button onClick={load} className="rounded-xl border-2 border-foreground px-4 py-2 font-semibold">ลองใหม่</button></Center>;
  else if (!exam) body = <Center><Loader2 className="h-6 w-6 animate-spin" /><p>กำลังเตรียมข้อสอบ 20 ข้อ เรื่อง "{topic}"</p><p className="text-sm text-muted-foreground">ครั้งแรกของเรื่องนี้ระบบต้องแต่งข้อสอบใหม่ อาจใช้เวลาประมาณ 1 นาที</p></Center>;
  else body = (
    <>
      <div className="shrink-0 border-b border-border bg-secondary/60 px-3 py-1.5 text-center text-xs text-muted-foreground">ข้อฝึก (แต่งเพิ่ม) ไม่ใช่ข้อสอบทางการ · แนวเดียวกับ O-NET</div>
      {result && (
        <div className="shrink-0 border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-2 sm:px-4">
            <div className="min-w-48 flex-1">
              <div className="flex justify-between text-sm font-semibold"><span>คะแนน</span><span>{result.correct}/{result.total}</span></div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full", s.color)} style={{ width: `${(result.correct / Math.max(1, result.total)) * 100}%` }} /></div>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">สกิลเรื่องนี้ {result.skill ?? "–"}/100</span>
            <button onClick={() => { localStorage.removeItem(`exam-answers-${sid}-${round}`); setResult(null); setRound(round + 1); }} className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold">ทำใหม่</button>
            <Link to="/develop/$level/$subject" params={{ level, subject }} className={cn("inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-semibold text-primary-foreground", s.color)}><Target className="h-4 w-4" /> กลับหน้าวิเคราะห์</Link>
          </div>
        </div>
      )}
      <ExamRunner key={round} exam={exam} storageKey={`${sid}-${round}`} onStatus={onStatus} />
    </>
  );

  return <PageShell subject={subject} title={`ข้อสอบย่อย: ${topic}`} sub={`${s.name} ${LEVEL_SHORT[level]}`}>{body}</PageShell>;
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">{children}</div>;
}
