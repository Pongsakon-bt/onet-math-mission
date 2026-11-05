import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, Dumbbell, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { QuizSession } from "@/components/exam/QuizSession";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { strandsFor } from "@/data/strands";
import { poolFor } from "@/data/pool";
import { lessonFor } from "@/data/lessons";
import { baseTopic, topicFrequency } from "@/data/analysis";
import { markStudied } from "@/lib/progress";

const LEVEL_NAMES: Record<Level, string> = { p6: "ป.6", m3: "ม.3" };

export const Route = createFileRoute("/learn/$level/$subject/$strand")({
  loader: ({ params }) => {
    const subject = params.subject as Subject;
    const i = Number(params.strand);
    if (!(params.level in LEVEL_NAMES) || !(subject in SUBJECT_NAMES) || !strandsFor(subject)[i]) throw notFound();
    return { level: params.level as Level, subject, index: i, strand: strandsFor(subject)[i]! };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `เรียนรู้: ${loaderData.strand} · ${SUBJECT_NAMES[loaderData.subject]} ${LEVEL_NAMES[loaderData.level]}` : "เรียนรู้รายเรื่อง";
    const description = loaderData ? `สรุปความรู้และฝึกทำข้อสอบ O-NET เก่าเรื่อง${loaderData.strand}` : "สรุปความรู้และฝึกข้อสอบรายเรื่อง";
    return {
      meta: [
        { title }, { name: "description", content: description },
        { property: "og:title", content: title }, { property: "og:description", content: description },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: LearnPage,
});

function LearnPage() {
  const { level, subject, index, strand } = Route.useLoaderData();
  const [practice, setPractice] = useState(false);
  const lesson = lessonFor(level, subject, strand);
  const qs = useMemo(() => poolFor(level, subject).filter((q) => q.strand === strand), [level, subject, strand]);
  const topics = useMemo(() => {
    const f = topicFrequency(level, subject);
    return [...new Set(qs.map((q) => baseTopic(q.topic)))].map((t) => [t, f.get(t) ?? 0] as const).sort((a, b) => b[1] - a[1]);
  }, [qs, level, subject]);
  const name = `${SUBJECT_NAMES[subject]} ${LEVEL_NAMES[level]}`;

  useEffect(() => { markStudied(`${level}-${subject}-${strand}`); }, [level, subject, strand]);

  if (practice) {
    return (
      <PageShell title={`ฝึก: ${strand}`} sub={name}>
        <div className="shrink-0 border-b border-border">
          <div className="mx-auto max-w-6xl px-3 py-1 sm:px-4">
            <Button size="sm" variant="ghost" onClick={() => setPractice(false)}><ArrowLeft /> กลับไปสรุปความรู้</Button>
          </div>
        </div>
        <QuizSession sid={`practice-${level}-${subject}-${index}`} kind="practice" level={level} subject={subject} title={`ฝึก: ${strand}`} strand={strand} all />
      </PageShell>
    );
  }

  return (
    <PageShell title={`เรียนรู้: ${strand}`} sub={name}>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 px-3 py-4 sm:px-4 sm:py-6">
          <Link to="/dashboard" search={{ level, subject }} className="text-sm text-muted-foreground underline">← แดชบอร์ดของฉัน</Link>
          <h1 className="font-display text-2xl sm:text-3xl">{strand}</h1>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-xl"><BookOpen className="h-5 w-5" /> สรุปความรู้</h2>
            {lesson ? (
              <>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {lesson.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                {lesson.example && (
                  <div className="mt-4 rounded-xl bg-secondary/60 p-3">
                    <p className="text-sm font-semibold">ตัวอย่าง: {lesson.example.q}</p>
                    <ol className="mt-1 list-decimal pl-5 text-sm">{lesson.example.a.map((s) => <li key={s}>{s}</li>)}</ol>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-muted-foreground">กำลังเตรียมสรุปความรู้ของวิชานี้ ตอนนี้ฝึกจากข้อสอบเก่าได้เลย</p>
            )}
            <p className="mt-4 text-sm font-semibold">เรื่องในสาระนี้ที่เคยออกสอบ (เรียงจากออกบ่อย)</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {topics.map(([t, n]) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{t} · ออก {n} ปี</span>)}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" onClick={() => setPractice(true)} disabled={!qs.length}><Dumbbell /> ฝึกทำข้อสอบเก่า ({qs.length} ข้อ)</Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/diagnostic/$level/$subject" params={{ level, subject }} search={{ strand: index }}><RotateCcw /> ทดสอบหลังเรียน</Link>
            </Button>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
