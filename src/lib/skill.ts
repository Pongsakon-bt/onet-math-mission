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
