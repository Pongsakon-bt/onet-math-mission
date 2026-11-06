import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingDown, TrendingUp, Trophy, AlertTriangle } from "lucide-react";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { SUBJECTS } from "@/components/subject-ui";
import { analyzeSubject, baseTopic } from "@/data/analysis";
import { getSchoolSubjectAverage } from "@/lib/insights.functions";
import { BAND_FAIR, BAND_GOOD, latestExamPct, progressSteps, subjectBand, topicCoverage } from "@/lib/overview";
import type { Attempt } from "@/lib/progress";
import { attemptPct } from "@/lib/skill";
import { cn } from "@/lib/utils";

/** All four subjects of one level: PRE O-NET round 1 / latest round 2 / best yearly set, plus a short analysis. */
export function LevelOverview({ level, all, subject, tab, children }: { level: Level; all: Attempt[]; subject?: Subject; tab?: "practice" | undefined; children?: ReactNode }) {
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

      {children}

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

type RadarMode = "school" | "bands" | "growth" | "coverage";
const MODES: { key: RadarMode; label: string; hint: string }[] = [
  { key: "school", label: "เทียบโรงเรียน", hint: "ฉัน เทียบกับค่าเฉลี่ยนักเรียนชั้นเดียวกันในโรงเรียน" },
  { key: "bands", label: "เทียบเกณฑ์", hint: "ฉัน เทียบกับเกณฑ์พอใช้ 50% และดี 75%" },
  { key: "growth", label: "พัฒนาการ", hint: "PRE O-NET ครั้งที่ 1 → การฝึก → PRE O-NET ครั้งที่ 2" },
  { key: "coverage", label: "ความครอบคลุม", hint: "ผ่านหัวข้อไปแล้วกี่ % (ได้ ≥ 75%)" },
];

export function FourSubjectRadar({ level, attempts }: { level: Level; attempts: Attempt[] }) {
  const [mode, setMode] = useState<RadarMode>("school");
  const [school, setSchool] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    if (mode !== "school" || school) return;
    getSchoolSubjectAverage({ data: { level } }).then((r) => setSchool(r.subjects)).catch(() => setSchool({}));
  }, [mode, level, school]);
  useEffect(() => setSchool(null), [level]);

  const coverage = useMemo(() => Object.fromEntries(SUBJECTS.map((s) => [s.key,
    topicCoverage(attempts, level, s.key, analyzeSubject(level, s.key).topics.map((t) => t.topic))])), [attempts, level]);

  const data = SUBJECTS.map((s) => {
    const me = latestExamPct(attempts, level, s.key);
    const g = progressSteps(attempts, level, s.key);
    return { subject: s.name, key: s.key, me, school: school?.[s.key] ?? null, fair: BAND_FAIR, good: BAND_GOOD, ...g, coverage: coverage[s.key] ?? 0 };
  });
  const series: { key: string; label: string; color: string; fill: number; dash?: string }[] =
    mode === "school" ? [{ key: "school", label: "เฉลี่ยโรงเรียน", color: "var(--muted-foreground)", fill: 0.12 }, { key: "me", label: "ฉัน", color: "var(--primary)", fill: 0.35 }]
    : mode === "bands" ? [{ key: "fair", label: "พอใช้ 50%", color: "var(--muted-foreground)", fill: 0, dash: "4 4" }, { key: "good", label: "ดี 75%", color: "var(--accent-foreground)", fill: 0, dash: "4 4" }, { key: "me", label: "ฉัน", color: "var(--primary)", fill: 0.35 }]
    : mode === "growth" ? [{ key: "pre1", label: "PRE ครั้งที่ 1", color: "var(--muted-foreground)", fill: 0.1 }, { key: "drill", label: "ฝึกทำข้อสอบ", color: "var(--accent-foreground)", fill: 0.1 }, { key: "pre2", label: "PRE ครั้งที่ 2", color: "var(--primary)", fill: 0.3 }]
      .filter((x) => data.some((d) => d[x.key as "pre1"] !== null))
    : [{ key: "coverage", label: "ผ่านหัวข้อแล้ว %", color: "var(--primary)", fill: 0.35 }];
  const focus = mode === "coverage" ? "coverage" : mode === "growth" ? (series.at(-1)?.key ?? "pre1") : "me";
  const vals = data.filter((d) => d[focus as "me"] !== null);
  const best = [...vals].sort((a, b) => (b[focus as "me"] ?? 0) - (a[focus as "me"] ?? 0))[0];
  const worst = [...vals].sort((a, b) => (a[focus as "me"] ?? 0) - (b[focus as "me"] ?? 0))[0];
  const below = mode === "bands" ? data.filter((d) => subjectBand(d.me) === "needs").map((d) => d.subject) : [];
  const empty = !vals.length;
  const config = Object.fromEntries(series.map((x) => [x.key, { label: x.label, color: x.color }]));

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
      <h2 className="font-display text-xl">ภาพรวมทั้ง 4 วิชา</h2>
      <div className="-mx-1 mt-2 flex gap-1 overflow-x-auto px-1 pb-1">
        {MODES.map((m) => (
          <button key={m.key} type="button" onClick={() => setMode(m.key)}
            className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              mode === m.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground")}>
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{MODES.find((m) => m.key === mode)!.hint}</p>
      {empty ? (
        <p className="mt-10 mb-10 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูล ลองทำ PRE O-NET หรือฝึกทำข้อสอบก่อนนะ</p>
      ) : (
        <ChartContainer className="mx-auto mt-3 h-72 w-full" config={config}>
          <RadarChart data={data} outerRadius="62%">
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((x) => (
              <Radar key={x.key} dataKey={x.key} stroke={`var(--color-${x.key})`} fill={`var(--color-${x.key})`} fillOpacity={x.fill} strokeDasharray={x.dash} />
            ))}
          </RadarChart>
        </ChartContainer>
      )}
      {!empty && (
        <p className="text-sm">
          {mode === "school" && school && !Object.keys(school).length ? <span className="text-muted-foreground">ยังไม่มีค่าเฉลี่ยของโรงเรียน · </span> : null}
          {best && <>จุดแข็ง: <b>{best.subject}</b></>}
          {worst && worst !== best && <> · ควรติว: <b>{worst.subject}</b></>}
          {below.length > 0 && <> · ต่ำกว่า 50%: {below.join(", ")}</>}
        </p>
      )}
    </section>
  );
}
