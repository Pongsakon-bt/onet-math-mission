import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BarChart3, Lock, Shuffle, Target } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { LEVEL_BG, LEVEL_SHORT, isLevel, isSubject, pageHead, subjectUi } from "@/components/subject-ui";
import { yearsFor, examKey, SUBJECT_NAMES } from "@/data/catalog";
import { loadAttempts } from "@/lib/progress";
import { answeredCount, UNLOCK_COUNT } from "@/lib/skill";
import { poolFor } from "@/data/pool";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bank/$level/$subject")({
  loader: ({ params }) => {
    if (!isLevel(params.level) || !isSubject(params.subject)) throw notFound();
    return { level: params.level, subject: params.subject };
  },
  head: ({ params }) => {
    const name = `${SUBJECT_NAMES[params.subject as "math"] ?? ""} ${LEVEL_SHORT[params.level as "p6"] ?? ""}`;
    return pageHead(`คลังข้อสอบ ${name} · PRE O-NET`, `ฝึกจากคลังข้อสอบ O-NET จริงทุกปี ${name} ทำครบ 40 ข้อเพื่อปลดล็อกการวิเคราะห์และพัฒนา`);
  },
  component: BankPage,
});

function BankPage() {
  const { level, subject } = Route.useLoaderData();
  const s = subjectUi(subject);
  const [done, setDone] = useState(0);
  useEffect(() => setDone(answeredCount(loadAttempts(), level, subject)), [level, subject]);
  const total = poolFor(level, subject).filter((q) => q.type !== "essay").length;
  const unlocked = done >= UNLOCK_COUNT;

  return (
    <div className={cn("min-h-dvh", LEVEL_BG[level])}>
      <SiteNav level={level} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-12 pt-4">
        <Link to={level === "p6" ? "/p6" : "/m3"} className="text-sm text-muted-foreground hover:underline">← กลับไปเลือกวิชา</Link>
        <section className="rounded-3xl border border-border bg-card p-5 shadow-paper">
          <p className={cn("text-sm font-semibold", s.text)}>{s.name} {LEVEL_SHORT[level]}</p>
          <h1 className="font-display text-3xl">เรียนรู้จากคลังข้อสอบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">ข้อสอบ O-NET จริงทุกปีรวม {total} ข้อ · ทำครบ {UNLOCK_COUNT} ข้อ (ไม่ซ้ำ) เพื่อปลดล็อก "วิเคราะห์และพัฒนา"</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm font-semibold"><span>ความคืบหน้า</span><span>{Math.min(done, UNLOCK_COUNT)}/{UNLOCK_COUNT} ข้อ</span></div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-secondary">
              <div className={cn("h-full transition-all", s.color)} style={{ width: `${Math.min(100, (done / UNLOCK_COUNT) * 100)}%` }} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/diagnostic/$level/$subject" params={{ level, subject }} search={{ strand: undefined }}
              className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-primary-foreground", s.color)}>
              <Shuffle className="h-5 w-5" /> ทำชุดถัดไป (สุ่มข้อที่ยังไม่เคยทำ)
            </Link>
            {unlocked ? (
              <Link to="/develop/$level/$subject" params={{ level, subject }} className="inline-flex items-center gap-2 rounded-xl border-2 border-foreground px-4 py-2.5 font-semibold">
                <Target className="h-5 w-5" /> วิเคราะห์และพัฒนา
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-muted-foreground"><Lock className="h-4 w-4" /> อีก {UNLOCK_COUNT - done} ข้อ</span>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-paper">
          <h2 className="font-display text-xl">ทำเต็มชุดรายปี</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {yearsFor(level, subject).map((e) => (
              <Link key={e.year} to="/exam/$key" params={{ key: examKey(e) }} className={cn("rounded-xl px-4 py-2 text-primary-foreground hover:opacity-90", s.color)}>
                <span className="block font-display text-lg leading-tight">ปี {e.year}</span>
                <span className="block text-xs opacity-90">{e.questions.length} ข้อ · {e.minutes} นาที</span>
              </Link>
            ))}
          </div>
          <Link to="/analysis/$level/$subject" params={{ level, subject }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <BarChart3 className="h-4 w-4" /> ดูว่าข้อสอบแต่ละปีออกเรื่องอะไร
          </Link>
        </section>
      </main>
    </div>
  );
}
