import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import type { Attempt } from "./progress";
import { attemptPct, topicSkill } from "./skill";

export const BAND_FAIR = 50;
export const BAND_GOOD = 75;

/** Readiness band for a subject percent. */
export const subjectBand = (pct: number | null): "none" | "needs" | "fair" | "good" =>
  pct === null ? "none" : pct >= BAND_GOOD ? "good" : pct >= BAND_FAIR ? "fair" : "needs";

const of = (all: Attempt[], level: Level, subject: Subject) => all.filter((a) => a.level === level && a.subject === subject).sort((a, b) => a.at - b.at);

/** Latest real-exam percent (no drills/practice). */
export function latestExamPct(all: Attempt[], level: Level, subject: Subject): number | null {
  const x = of(all, level, subject).filter((a) => a.kind !== "drill" && a.kind !== "practice").at(-1);
  return x ? attemptPct(x) : null;
}

/** PRE1, average drill, latest PRE2. */
export function progressSteps(all: Attempt[], level: Level, subject: Subject) {
  const list = of(all, level, subject);
  const pre1 = list.find((a) => a.kind === "pre1");
  const pre2 = list.filter((a) => a.kind === "pre2").at(-1);
  const drills = list.filter((a) => a.kind === "drill");
  return {
    pre1: pre1 ? attemptPct(pre1) : null,
    drill: drills.length ? Math.round(drills.reduce((s, a) => s + attemptPct(a), 0) / drills.length) : null,
    pre2: pre2 ? attemptPct(pre2) : null,
  };
}

/** Percent of topics passed (skill ≥ 75). */
export function topicCoverage(all: Attempt[], level: Level, subject: Subject, topics: string[]): number {
  if (!topics.length) return 0;
  const passed = topics.filter((t) => (topicSkill(all, level, subject, t).skill ?? -1) >= BAND_GOOD).length;
  return Math.round((passed / topics.length) * 100);
}
