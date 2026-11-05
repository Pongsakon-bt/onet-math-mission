import { yearsFor, type Level } from "./catalog";
import type { Subject } from "./exam-types";
import { strandOf, strandsFor } from "./strands";

/** Main topic name without the detail in brackets, so years can be compared ("สถิติ (ค่าเฉลี่ย)" → "สถิติ"). */
export const baseTopic = (t: string) => t.split(/[(/]/)[0]!.trim();

export type TopicStat = { topic: string; strand: string; years: number[]; count: number; points: number; nos: string[] };

/** Cross-year analysis of one level+subject: per-question grid, strand weight per year, recurring topics. */
export function analyzeSubject(level: Level, subject: Subject) {
  const exams = yearsFor(level, subject).sort((a, b) => a.year - b.year);
  const nYears = exams.length || 1;
  const maxNo = Math.max(0, ...exams.flatMap((e) => e.questions.map((q) => q.no)));

  const grid = Array.from({ length: maxNo }, (_, i) => ({
    no: i + 1,
    cells: exams.map((e) => {
      const q = e.questions.find((x) => x.no === i + 1);
      return q ? { topic: q.topic, base: baseTopic(q.topic), strand: strandOf(subject, q.topic) } : null;
    }),
  }));
  for (const row of grid) {
    const bases = row.cells.filter(Boolean).map((c) => c!.base);
    (row as typeof row & { same: "same" | "similar" | "diff" }).same =
      bases.length && bases.every((b) => b === bases[0]) ? "same"
      : new Set(row.cells.filter(Boolean).map((c) => c!.strand)).size === 1 ? "similar" : "diff";
  }

  const topics = new Map<string, TopicStat>();
  const strandTotals = new Map<string, { count: number; points: number }>(strandsFor(subject).map((s) => [s, { count: 0, points: 0 }]));
  let totalPoints = 0;
  for (const e of exams) for (const q of e.questions) {
    const strand = strandOf(subject, q.topic);
    const key = baseTopic(q.topic);
    const t = topics.get(key) ?? { topic: key, strand, years: [], count: 0, points: 0, nos: [] };
    if (!t.years.includes(e.year)) t.years.push(e.year);
    t.count++; t.points += q.points; t.nos.push(`${e.year % 100}:${q.no}`);
    topics.set(key, t);
    const s = strandTotals.get(strand)!; s.count++; s.points += q.points; totalPoints += q.points;
  }

  const strands = [...strandTotals].map(([name, v]) => ({
    name, index: strandsFor(subject).indexOf(name),
    avgQ: v.count / nYears, avgPoints: v.points / nYears, pct: totalPoints ? Math.round((v.points / totalPoints) * 100) : 0,
  })).sort((a, b) => b.avgPoints - a.avgPoints);

  const ranked = [...topics.values()].sort((a, b) => b.years.length - a.years.length || b.points - a.points);
  return { years: exams.map((e) => e.year), nYears, grid: grid as (typeof grid[number] & { same: "same" | "similar" | "diff" })[], strands, topics: ranked };
}

/** How many years each main topic appeared in, for weighting the diagnostic toward frequently tested topics. */
export function topicFrequency(level: Level, subject: Subject): Map<string, number> {
  return new Map(analyzeSubject(level, subject).topics.map((t) => [t.topic, t.years.length]));
}
