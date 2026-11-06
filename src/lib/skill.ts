import { baseTopic } from "@/data/analysis";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import type { Attempt } from "./progress";

/** Real exam questions a student must answer before "วิเคราะห์และพัฒนา" unlocks. */
export const UNLOCK_COUNT = 40;
/** Drill questions per topic. */
export const DRILL_SIZE = 20;

const mine = (all: Attempt[], level: Level, subject: Subject) => all.filter((a) => a.level === level && a.subject === subject);

/** Distinct real exam questions answered (drills don't count). */
export function answeredCount(all: Attempt[], level: Level, subject: Subject): number {
  return new Set(mine(all, level, subject).filter((a) => a.kind !== "drill").flatMap((a) => a.items.map((i) => i.qid))).size;
}

export const isUnlocked = (count: number) => count >= UNLOCK_COUNT;

/** Questions in one PRE O-NET round. */
export const PRE_SIZE = 40;

/** PRE O-NET round 1 attempt for this level+subject, if finished. Finishing it unlocks yearly sets, round 2 and analysis. */
export const preRound1 = (all: Attempt[], level: Level, subject: Subject) =>
  mine(all, level, subject).find((a) => a.kind === "pre1");
export const isPreUnlocked = (all: Attempt[], level: Level, subject: Subject) => !!preRound1(all, level, subject);

/** Percent of points earned in one attempt. */
export const attemptPct = (a: Attempt) => {
  const total = a.items.reduce((s, i) => s + i.points, 0);
  return total ? Math.round((a.items.reduce((s, i) => s + (i.correct ? i.points : 0), 0) / total) * 100) : 0;
};

export type TopicSkill = { skill: number | null; realCorrect: number; realTotal: number; drillPct: number | null; drills: number };

/** Skill 0–100 for one topic: latest result per real question + latest drill, drill weighted 60%. */
export function topicSkill(all: Attempt[], level: Level, subject: Subject, topic: string): TopicSkill {
  const list = mine(all, level, subject).sort((a, b) => a.at - b.at);
  const latest = new Map<string, boolean>();
  const drills: number[] = [];
  for (const a of list) {
    if (a.kind === "drill") {
      if (a.items.length && baseTopic(a.items[0]!.topic) === topic) drills.push(Math.round((a.items.filter((i) => i.correct).length / a.items.length) * 100));
      continue;
    }
    for (const i of a.items) if (baseTopic(i.topic) === topic) latest.set(i.qid, i.correct);
  }
  const realTotal = latest.size;
  const realCorrect = [...latest.values()].filter(Boolean).length;
  const realPct = realTotal ? (realCorrect / realTotal) * 100 : null;
  const drillPct = drills.length ? drills[drills.length - 1]! : null;
  const raw = drillPct !== null && realPct !== null ? 0.6 * drillPct + 0.4 * realPct : drillPct ?? realPct;
  const skill = raw === null ? null : Math.max(0, Math.min(100, Math.round(raw)));
  return { skill, realCorrect, realTotal, drillPct, drills: drills.length };
}

export type TopicStatus = "none" | "needs" | "fair" | "pass" | "mastered";
/** ต้องติว < 50, พอใช้ 50–74, ผ่าน 75–99, เชี่ยวชาญ 100. */
export function topicStatus(skill: number | null): TopicStatus {
  if (skill === null) return "none";
  if (skill >= 100) return "mastered";
  if (skill >= 75) return "pass";
  if (skill >= 50) return "fair";
  return "needs";
}
export const isPassed = (skill: number | null) => skill !== null && skill >= 75;

/** Next topic to study: not yet passed, lowest skill first, then most frequently examined. */
export function nextTopic<T extends { topic: string; skill: number | null; years: unknown[] }>(rows: T[], exclude?: string): T | null {
  const open = rows.filter((r) => r.topic !== exclude && !isPassed(r.skill));
  open.sort((a, b) => (a.skill ?? -1) - (b.skill ?? -1) || b.years.length - a.years.length);
  return open[0] ?? null;
}
export const subjectReady = (rows: { skill: number | null }[]) => rows.length > 0 && rows.every((r) => isPassed(r.skill));
