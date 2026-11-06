import { isPreUnlocked } from "@/lib/skill";
import { subjectVars } from "@/components/subject-ui";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { catalog } from "@/data/catalog";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { preloadExamImages } from "@/lib/preload-exam";
import { ExamIntro } from "@/components/exam/ExamIntro";
import { useEffect, useState } from "react";
import { Timer, Lock } from "lucide-react";
import { loadAttempts, saveAttempt } from "@/lib/progress";

export const Route = createFileRoute("/exam/$key")({
  loader: async ({ params }) => {
    if (!catalog[params.key]) throw notFound();
    // Don't block navigation on images: the intro page shows first, pictures keep downloading meanwhile.
    void preloadExamImages(params.key);
    return { key: params.key };
  },
  pendingMs: 0,
  head: ({ loaderData }) => {
    const exam = loaderData ? catalog[loaderData.key] : undefined;
    const title = exam ? `${exam.title} ปี ${exam.year} · PRE O-NET` : "ไม่พบชุดข้อสอบ";
    const description = exam
      ? `ฝึกทำข้อสอบ ${exam.title} ปีการศึกษา ${exam.year} ครบ ${exam.questions.length} ข้อ แบบโต้ตอบ พร้อมคำใบ้`
      : "ไม่พบชุดข้อสอบนี้";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ExamPage,
  pendingComponent: () => (
    <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-primary" />
      <p className="font-display text-primary">กำลังเตรียมข้อสอบ...</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center">
      ไม่พบชุดข้อสอบนี้ <Link to="/" className="underline">กลับหน้าแรก</Link>
    </div>
  ),
});

function ExamPage() {
  const { key } = Route.useLoaderData();
  const exam = catalog[key]!;
  const navigate = useNavigate();
  const sKey = `exam-time-${key}`;
  const [time, setTime] = useState<{ start: number; end?: number } | null>(null);
  const [started, setStarted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => setOpen(isPreUnlocked(loadAttempts(), exam.level, exam.subject)), [exam]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(sKey);
      setTime(raw ? JSON.parse(raw) : null);
    } catch { /* ignore */ }
    setStarted(false);
  }, [sKey]);
  const save = (t: { start: number; end?: number } | null) => {
    setTime(t);
    if (t) localStorage.setItem(sKey, JSON.stringify(t)); else localStorage.removeItem(sKey);
  };
  useEffect(() => {
    if (!started || !time || time.end) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started, time]);

  const start = () => {
    if (!time || time.end) save({ start: Date.now() });
    setNow(Date.now());
    setStarted(true);
  };
  const onStatus = (submitted: boolean, answers: Record<string, unknown>) => {
    if (submitted && time && !time.end) {
      save({ ...time, end: Date.now() });
      const id = `full-${key}-${time.start}`;
      saveAttempt("full", id, exam, answers, `${exam.title} ปี ${exam.year}`, { back: `/exam/${key}`, ms: Date.now() - time.start });
      void navigate({ to: "/result/$id", params: { id } });
    }
    if (!submitted && time?.end) save({ start: Date.now() });
  };
  const limit = exam.minutes * 60;
  const used = time ? Math.max(0, Math.floor(((time.end ?? now) - time.start) / 1000)) : 0;
  const remain = limit - used;
  const mmss = (n: number) => `${Math.floor(Math.abs(n) / 60)}:${String(Math.abs(n) % 60).padStart(2, "0")}`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background" style={subjectVars(exam.subject)}>
      <div className="shrink-0 border-b border-border bg-background [@media(max-height:500px)]:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4">
          <Link to="/" className="font-display text-lg text-primary">PRE O-NET<span className="text-highlight-strong">.</span></Link>
          {started && time && (
            <div className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 font-display tabular-nums ${time.end ? "bg-secondary" : remain <= 300 ? "bg-destructive text-destructive-foreground" : "bg-secondary"}`}
              title={time.end ? "เวลาที่ใช้" : "เวลาที่เหลือ"}>
              <Timer className="h-4 w-4" />
              {time.end ? `ใช้ ${mmss(used)}` : remain >= 0 ? mmss(remain) : `เกิน ${mmss(remain)}`}
            </div>
          )}
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-semibold leading-tight">{exam.title} · ปี {exam.year}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">{exam.code} · {exam.examDate}</p>
          </div>
        </div>
      </div>
      {open === false ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="font-display text-xl">ทำ PRE O-NET ครั้งที่ 1 ก่อน จึงจะทำข้อสอบรายปีได้</p>
          <Link to="/bank/$level/$subject" params={{ level: exam.level, subject: exam.subject }} className="font-semibold text-primary underline">ไปที่ PRE O-NET</Link>
        </div>
      ) : started ? (
        <ExamRunner exam={exam} storageKey={key} onStatus={onStatus} />
      ) : (
        <ExamIntro exam={exam} onStart={start} resumable={!!time && !time.end} />
      )}
    </div>
  );
}
