import { Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp, Trophy, AlertTriangle } from "lucide-react";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { SUBJECTS } from "@/components/subject-ui";
import { baseTopic } from "@/data/analysis";
import type { Attempt } from "@/lib/progress";
import { attemptPct } from "@/lib/skill";
import { cn } from "@/lib/utils";

/** All four subjects of one level: PRE O-NET round 1 / latest round 2 / best yearly set, plus a short analysis. */
export function LevelOverview({ level, all, subject, tab }: { level: Level; all: Attempt[]; subject?: Subject; tab?: "practice" | undefined }) {
  const rows = SUBJECTS.map((s) => {
    const mine = all.filter((a) => a.level === level && a.subject === s.key).sort((a, b) => a.at - b.at);
    const pre1 = mine.find((a) => a.kind === "pre1");
    const pre2 = mine.filter((a) => a.kind === "pre2").pop();
    const full = mine.filter((a) => a.kind === "full");
    const best = full.length ? Math.max(...full.map(attemptPct)) : null;
    const latest = [...mine].reverse().find((a) => a.kind !== "drill" && a.kind !== "practice");
    // Most-missed topics across every real-exam attempt.
    const miss = new Map<string, { n: number; wrong: number }>();
    for (const a of mine) if (a.kind !== "drill") for (const i of a.items) {
      const t = baseTopic(i.topic.split(" · ").pop()!.replace(/\s*\(ปี \d+\)$/, ""));
      const v = miss.get(t) ?? { n: 0, wrong: 0 };
      v.n++; if (!i.correct) v.wrong++;
      miss.set(t, v);
    }
    return { s, pre1: pre1 ? attemptPct(pre1) : null, pre2: pre2 ? attemptPct(pre2) : null, best, now: latest ? attemptPct(latest) : null, miss };
  });
  const scored = rows.filter((r) => r.now !== null);
  const strongest = [...scored].sort((a, b) => b.now! - a.now!)[0];
  const weakest = [...scored].sort((a, b) => a.now! - b.now!)[0];
  const ready = scored.length ? Math.round(scored.reduce((x, r) => x + r.now!, 0) / scored.length) : null;
  const weakTopics = rows
    .flatMap((r) => [...r.miss].filter(([, v]) => v.wrong >= 1).map(([t, v]) => ({ t, s: r.s, rate: v.wrong / v.n, wrong: v.wrong })))
    .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
    .slice(0, 5);

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {rows.map(({ s, pre1, pre2, best }) => {
          const I = s.icon;
          const diff = pre1 !== null && pre2 !== null ? pre2 - pre1 : null;
          return (
            <Link key={s.key} to="/dashboard" search={{ level, subject: s.key, tab }}
              aria-current={subject === s.key ? "true" : undefined}
              data-selected={subject === s.key}
              className={cn("rounded-2xl border bg-card p-4 shadow-paper transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", subject === s.key ? "border-primary ring-2 ring-primary" : "border-border")}>
              <div className="flex items-center gap-2">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground", s.color)}><I className="h-5 w-5" /></span>
                <p className={cn("font-semibold", s.text)}>{s.name}</p>
              </div>
              <p className="mt-3 font-display text-4xl leading-none">{pre1 ?? "–"}<span className="text-base text-muted-foreground">{pre1 !== null && "%"}</span></p>
              <p className="text-xs text-muted-foreground">PRE O-NET ครั้งที่ 1</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full", s.color)} style={{ width: `${pre1 ?? 0}%` }} /></div>
              <dl className="mt-3 space-y-0.5 text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground">ครั้งที่ 2 ล่าสุด</dt><dd className="font-semibold">{pre2 !== null ? `${pre2}%` : "–"}
                  {diff !== null && <span className={cn("ml-1", diff >= 0 ? "text-success" : "text-destructive")}>({diff >= 0 ? "+" : ""}{diff})</span>}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">ข้อสอบรายปีดีที่สุด</dt><dd className="font-semibold">{best !== null ? `${best}%` : "–"}</dd></div>
              </dl>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-5">
        <h2 className="font-display text-xl">วิเคราะห์ภาพรวม</h2>
        {!scored.length ? (
          <p className="mt-1 text-sm text-muted-foreground">ยังไม่มีผลสอบในระดับชั้นนี้ เริ่มจาก PRE O-NET ครั้งที่ 1 ของแต่ละวิชา</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">ความพร้อมสอบเฉลี่ย ({scored.length}/4 วิชา)</p>
              <p className="font-display text-3xl">{ready}%</p>
              <p className="text-xs">{ready! >= 75 ? "พร้อมดี รักษาระดับไว้" : ready! >= 50 ? "พอใช้ เร่งวิชาที่อ่อนอีกนิด" : "ควรทบทวนพื้นฐานก่อน"}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-sm">
              <p className="flex items-center gap-1"><Trophy className="h-4 w-4" /> เด่นสุด: <b className={strongest?.s.text}>{strongest?.s.name}</b> {strongest?.now}%</p>
              {weakest && weakest !== strongest && (
                <p className="mt-1 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> ควรเร่ง: <b className={weakest.s.text}>{weakest.s.name}</b> {weakest.now}%</p>
              )}
              {rows.filter((r) => r.pre1 !== null && r.pre2 !== null).map((r) => (
                <p key={r.s.key} className="mt-1 flex items-center gap-1 text-xs">
                  {r.pre2! >= r.pre1! ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                  {r.s.name}: ครั้งที่ 1 → 2 {r.pre1}% → {r.pre2}%
                </p>
              ))}
            </div>
            <div className="rounded-xl bg-secondary p-3 text-sm">
              <p className="text-xs text-muted-foreground">เรื่องที่ตอบผิดบ่อยที่สุด</p>
              <ul className="mt-1 space-y-0.5">
                {weakTopics.map((w) => (
                  <li key={w.s.key + w.t} className="flex gap-1"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", w.s.color)} /><span className="min-w-0">{w.t} <span className="text-muted-foreground">(ผิด {w.wrong})</span></span></li>
                ))}
                {!weakTopics.length && <li className="text-muted-foreground">ยังไม่มี</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
