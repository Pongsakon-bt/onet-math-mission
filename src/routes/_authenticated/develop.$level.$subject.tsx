import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, Lock, PencilLine, Sparkles, Trophy } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { LEVEL_BG, LEVEL_SHORT, isLevel, isSubject, pageHead, subjectUi } from "@/components/subject-ui";
import { SUBJECT_NAMES } from "@/data/catalog";
import { analyzeSubject } from "@/data/analysis";
import { loadAttempts, type Attempt } from "@/lib/progress";
import { isPassed, isPreUnlocked, subjectReady, topicSkill } from "@/lib/skill";
import { StatusPill } from "@/components/StatusPill";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/develop/$level/$subject")({
  loader: ({ params }) => {
    if (!isLevel(params.level) || !isSubject(params.subject)) throw notFound();
    return { level: params.level, subject: params.subject };
  },
  head: ({ params }) => {
    const name = `${SUBJECT_NAMES[params.subject as "math"] ?? ""} ${LEVEL_SHORT[params.level as "p6"] ?? ""}`;
    return pageHead(`วิเคราะห์และพัฒนา ${name} · PRE O-NET`, `สกิลรายเรื่อง 0–100 แบ่งตามโซนความรู้ ${name} พร้อมข้อสอบย่อยเรื่องละ 20 ข้อ`);
  },
  component: DevelopPage,
});

const skillTone = (v: number | null) => (v === null ? "bg-muted-foreground/40" : v < 50 ? "bg-destructive" : v < 75 ? "bg-highlight-strong" : "bg-subj-eng");

function DevelopPage() {
  const { level, subject } = Route.useLoaderData();
  const s = subjectUi(subject);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  useEffect(() => setAttempts(loadAttempts()), []);
  const [openZ, setOpenZ] = useState<Set<string> | null>(null);
  const an = useMemo(() => analyzeSubject(level, subject), [level, subject]);

  const rows = useMemo(() => an.topics.map((t, index) => {
    const sk = topicSkill(attempts ?? [], level, subject, t.topic);
    return { ...t, index, ...sk, need: t.years.length * (100 - (sk.skill ?? 0)) };
  }), [an, attempts, level, subject]);

  if (!attempts) return <div className={cn("min-h-dvh", LEVEL_BG[level])}><SiteNav level={level} /></div>;
  const unlocked = isPreUnlocked(attempts, level, subject);
  const top = [...rows].sort((a, b) => b.need - a.need).slice(0, 3);
  const scored = rows.filter((r) => r.skill !== null);
  const zoneOpen = (name: string) => openZ ? openZ.has(name) : rows.some((r) => r.strand === name && !isPassed(r.skill));
  const toggle = (name: string) => {
    const cur = new Set(an.strands.filter((z) => zoneOpen(z.name)).map((z) => z.name));
    if (cur.has(name)) cur.delete(name); else cur.add(name);
    setOpenZ(cur);
  };
  const passedAll = rows.filter((r) => isPassed(r.skill)).length;
  const ready = subjectReady(rows);
  const overall = scored.length ? Math.round(scored.reduce((x, r) => x + r.skill!, 0) / scored.length) : null;

  return (
    <div className={cn("min-h-dvh", LEVEL_BG[level])}>
      <SiteNav level={level} />
      <main className="mx-auto max-w-5xl space-y-4 px-4 pb-12 pt-4">
        <Link to={level === "p6" ? "/p6" : "/m3"} className="text-sm text-muted-foreground hover:underline">← กลับไปเลือกวิชา</Link>
        <section className="rounded-3xl border border-border bg-card p-5 shadow-paper">
          <p className={cn("text-sm font-semibold", s.text)}>{s.name} {LEVEL_SHORT[level]}</p>
          <h1 className="font-display text-3xl">วิเคราะห์และพัฒนา</h1>
          {!unlocked ? (
            <div className="mt-3 flex items-center gap-2 text-muted-foreground"><Lock className="h-5 w-5" /> ทำ PRE O-NET ครั้งที่ 1 ให้เสร็จเพื่อปลดล็อก
              <Link to="/bank/$level/$subject" params={{ level, subject }} className="ml-2 font-semibold text-foreground underline">ไปที่ PRE O-NET</Link></div>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="text-center">
                <p className="font-display text-5xl">{overall ?? "–"}</p>
                <p className="text-xs text-muted-foreground">สกิลเฉลี่ย /100</p>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1 text-sm font-semibold"><Sparkles className="h-4 w-4" /> ควรศึกษาเพิ่มก่อน (ออกบ่อย แต่สกิลยังต่ำ)</p>
                <div className="flex flex-wrap gap-2">
                  {top.map((t) => (
                    <Link key={t.topic} to="/drill/$level/$subject/$topic" params={{ level, subject, topic: String(t.index) }}
                      className={cn("rounded-full px-3 py-1 text-sm font-semibold text-primary-foreground", s.color)}>
                      {t.topic} · {t.skill ?? "ยังไม่มีผล"}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {unlocked && ready && (
          <section className="flex flex-wrap items-center gap-3 rounded-3xl border-2 border-primary bg-card p-5 shadow-paper">
            <Trophy className="h-8 w-8 text-primary" />
            <div className="flex-1"><p className="font-display text-xl">พร้อมสอบแล้ว!</p><p className="text-sm text-muted-foreground">ผ่านครบทุกเรื่อง (สกิล ≥ 75) ลองทำ PRE O-NET ครั้งที่ 2 เพื่อวัดผลจริง</p></div>
            <Link to="/bank/$level/$subject" params={{ level, subject }} className={cn("rounded-xl px-4 py-2 font-semibold text-primary-foreground", s.color)}>ไปทำ PRE O-NET ครั้งที่ 2</Link>
          </section>
        )}
        {unlocked && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">ผ่านแล้ว {passedAll}/{rows.length} เรื่อง <span className="font-normal text-muted-foreground">(ผ่าน = สกิล ≥ 75)</span></p>
            <div className="flex gap-2">
              <button onClick={() => setOpenZ(new Set(an.strands.map((z) => z.name)))} className="rounded-lg border border-border bg-card px-3 py-1 text-sm font-semibold hover:bg-secondary">ขยายทั้งหมด</button>
              <button onClick={() => setOpenZ(new Set())} className="rounded-lg border border-border bg-card px-3 py-1 text-sm font-semibold hover:bg-secondary">ยุบทั้งหมด</button>
            </div>
          </div>
        )}
        {unlocked && an.strands.map((z) => {
          const list = rows.filter((r) => r.strand === z.name).sort((a, b) => b.need - a.need);
          if (!list.length) return null;
          const isOpen = zoneOpen(z.name);
          const passed = list.filter((r) => isPassed(r.skill)).length;
          return (
            <section key={z.name} className="rounded-3xl border border-border bg-card p-5 shadow-paper">
              <button type="button" onClick={() => toggle(z.name)} aria-expanded={isOpen} className="flex w-full flex-wrap items-center justify-between gap-2 text-left">
                <span className="flex items-center gap-2">
                  <ChevronRight className={cn("h-5 w-5 text-primary transition-transform", isOpen && "rotate-90")} />
                  <h2 className="font-display text-xl">โซน: {z.name}</h2>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">ผ่าน {passed}/{list.length} เรื่อง</span>
                </span>
                <span className="text-sm text-muted-foreground">ออกสอบเฉลี่ย {z.avgQ.toFixed(1)} ข้อ/ปี · {z.pct}% ของคะแนน</span>
              </button>
              {isOpen && <ul className="mt-3 divide-y divide-border">
                {list.map((t) => (
                  <li key={t.topic} className="grid gap-2 py-3 sm:grid-cols-[1fr_12rem_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">{t.topic} <StatusPill skill={t.skill} /></p>
                      <p className="text-xs text-muted-foreground">
                        ออก {t.years.length}/{an.nYears} ปี · ข้อจริง ถูก {t.realCorrect}/{t.realTotal}
                        {t.drillPct !== null && ` · ข้อสอบย่อยล่าสุด ${t.drillPct}%`}
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs"><span>สกิล</span><b>{t.skill ?? "–"}/100</b></div>
                      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
                        <div className={cn("h-full", skillTone(t.skill))} style={{ width: `${t.skill ?? 0}%` }} />
                      </div>
                    </div>
                    <Link to="/drill/$level/$subject/$topic" params={{ level, subject, topic: String(t.index) }}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border-2 border-foreground px-3 py-1.5 text-sm font-semibold hover:bg-secondary">
                      <PencilLine className="h-4 w-4" /> ข้อสอบย่อย 20 ข้อ
                    </Link>
                  </li>
                ))}
              </ul>}
            </section>
          );
        })}
      </main>
    </div>
  );
}
