import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, Lock, Play, RotateCcw, Target } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { LEVEL_BG, LEVEL_SHORT, isLevel, isSubject, pageHead, subjectUi, subjectVars } from "@/components/subject-ui";
import { yearsFor, examKey, SUBJECT_NAMES } from "@/data/catalog";
import { loadAttempts, type Attempt } from "@/lib/progress";
import { attemptPct, PRE_SIZE, preRound1 } from "@/lib/skill";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/bank/$level/$subject")({
  loader: ({ params }) => {
    if (!isLevel(params.level) || !isSubject(params.subject)) throw notFound();
    return { level: params.level, subject: params.subject };
  },
  head: ({ params }) => {
    const name = `${SUBJECT_NAMES[params.subject as "math"] ?? ""} ${LEVEL_SHORT[params.level as "p6"] ?? ""}`;
    return pageHead(`PRE O-NET ${name}`, `สอบ PRE O-NET ${name} ครั้งที่ 1 จำนวน ${PRE_SIZE} ข้อ เพื่อปลดล็อกข้อสอบรายปีและการวิเคราะห์ แล้วฝึกซ้ำได้ในครั้งที่ 2`);
  },
  component: BankPage,
});

function BankPage() {
  const { level, subject } = Route.useLoaderData();
  const s = subjectUi(subject);
  const [all, setAll] = useState<Attempt[] | null>(null);
  useEffect(() => setAll(loadAttempts()), []);
  const pre1 = all ? preRound1(all, level, subject) : undefined;
  const pre2 = (all ?? []).filter((a) => a.level === level && a.subject === subject && a.kind === "pre2").sort((a, b) => b.at - a.at);
  const unlocked = !!pre1;

  return (
    <div className={cn("min-h-dvh", LEVEL_BG[level])} style={subjectVars(subject)}>
      <SiteNav level={level} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-12 pt-4">
        <Link to={level === "p6" ? "/p6" : "/m3"} className="text-sm text-muted-foreground hover:underline">← กลับไปเลือกวิชา</Link>
        <header className={cn("rounded-3xl p-5 text-primary-foreground shadow-paper", s.color)}>
          <p className="text-sm font-semibold opacity-90">{s.name} {LEVEL_SHORT[level]}</p>
          <h1 className="font-display text-4xl">PRE O-NET</h1>
          <p className="mt-1 text-sm opacity-90">สอบครั้งที่ 1 ให้เสร็จก่อน เพื่อปลดล็อกข้อสอบรายปี การวิเคราะห์ และการสอบครั้งที่ 2</p>
        </header>

        <section className="rounded-3xl border-2 border-primary bg-card p-5 shadow-paper">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-2xl text-primary-foreground">1</span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl">PRE O-NET ครั้งที่ 1</h2>
              <p className="text-sm text-muted-foreground">{PRE_SIZE} ข้อ จากข้อสอบ O-NET จริง ไม่มีข้อที่ต่อเนื่องกัน · <b className="text-foreground">ทำได้ครั้งเดียว ตั้งใจทำจริง ๆ</b></p>
            </div>
          </div>
          {all === null ? null : pre1 ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 font-semibold text-success"><CheckCircle2 className="h-5 w-5" /> ทำแล้ว · ได้ {attemptPct(pre1)}%</span>
              <Link to="/result/$id" params={{ id: pre1.id }} className="font-semibold underline">ดูผลละเอียด</Link>
            </div>
          ) : (
            <Link to="/preonet/$level/$subject/$round" params={{ level, subject, round: "1" }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90">
              <Play className="h-5 w-5" /> เริ่มสอบครั้งที่ 1
            </Link>
          )}
        </section>

        <section className={cn("rounded-3xl border border-border bg-card p-5 shadow-paper", !unlocked && "opacity-70")}>
          <h2 className="flex items-center gap-2 font-display text-xl">{!unlocked && <Lock className="h-5 w-5" />} ทำเต็มชุดรายปี</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {yearsFor(level, subject).map((e) => unlocked ? (
              <Link key={e.year} to="/exam/$key" params={{ key: examKey(e) }} className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:opacity-90">
                <span className="block font-display text-lg leading-tight">ปี {e.year}</span>
                <span className="block text-xs opacity-90">{e.questions.length} ข้อ · {e.minutes} นาที</span>
              </Link>
            ) : (
              <span key={e.year} aria-disabled className="rounded-xl border border-dashed border-border bg-muted px-4 py-2 text-muted-foreground">
                <span className="block font-display text-lg leading-tight">ปี {e.year}</span>
                <span className="block text-xs">ล็อกอยู่</span>
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            <Link to="/analysis/$level/$subject" params={{ level, subject }} className="inline-flex items-center gap-2 hover:underline">
              <BarChart3 className="h-4 w-4" /> ดูว่าข้อสอบแต่ละปีออกเรื่องอะไร
            </Link>
            {unlocked && (
              <Link to="/develop/$level/$subject" params={{ level, subject }} className="inline-flex items-center gap-2 text-primary hover:underline">
                <Target className="h-4 w-4" /> วิเคราะห์และพัฒนา
              </Link>
            )}
          </div>
        </section>

        <section className={cn("rounded-3xl border border-border bg-card p-5 shadow-paper", !unlocked && "opacity-70")}>
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-primary font-display text-2xl text-primary">2</span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl">PRE O-NET ครั้งที่ 2</h2>
              <p className="text-sm text-muted-foreground">ลองผิดลองถูกได้ — ส่งแล้วเลือก "บันทึกผลเพื่อวิเคราะห์" หรือ "สอบใหม่" ก็ได้</p>
            </div>
          </div>
          {unlocked ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link to="/preonet/$level/$subject/$round" params={{ level, subject, round: "2" }}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-5 py-2.5 font-semibold text-primary hover:bg-secondary">
                {pre2.length ? <RotateCcw className="h-5 w-5" /> : <Play className="h-5 w-5" />} {pre2.length ? "สอบครั้งที่ 2 อีกรอบ" : "เริ่มสอบครั้งที่ 2"}
              </Link>
              {pre2[0] && <Link to="/result/$id" params={{ id: pre2[0].id }} className="text-sm font-semibold underline">ผลที่บันทึกล่าสุด {attemptPct(pre2[0])}% ({pre2.length} ครั้ง)</Link>}
            </div>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" /> ปลดล็อกหลังทำครั้งที่ 1</p>
          )}
        </section>
      </main>
    </div>
  );
}
