import type { Attempt } from "./progress";
import { attemptPct } from "./skill";

/** Weights for the predicted O-NET score; missing parts are left out and the rest re-weighted. */
export const WEIGHTS = { pre2: 0.5, drill: 0.3, pre1: 0.2 } as const;

/** Predicted O-NET percent (0–100) with a ± range, from PRE round 1, drills and PRE round 2. Null when nothing is measured. */
export function predictScore(attempts: Pick<Attempt, "kind" | "items" | "at">[]): { score: number; low: number; high: number; parts: number } | null {
  const sorted = [...attempts].sort((a, b) => a.at - b.at);
  const pre1 = sorted.find((a) => a.kind === "pre1");
  const pre2 = sorted.filter((a) => a.kind === "pre2").pop();
  const drills = sorted.filter((a) => a.kind === "drill" && a.items.length);
  const drillPct = drills.length ? drills.reduce((s, a) => s + attemptPct(a as Attempt), 0) / drills.length : null;
  const parts: [number, number][] = [];
  if (pre2) parts.push([attemptPct(pre2 as Attempt), WEIGHTS.pre2]);
  if (drillPct !== null) parts.push([drillPct, WEIGHTS.drill]);
  if (pre1) parts.push([attemptPct(pre1 as Attempt), WEIGHTS.pre1]);
  if (!parts.length) return null;
  const w = parts.reduce((s, [, x]) => s + x, 0);
  const score = Math.round(parts.reduce((s, [v, x]) => s + v * x, 0) / w);
  const spread = parts.length === 3 ? 4 : parts.length === 2 ? 6 : 8;
  return { score, low: Math.max(0, score - spread), high: Math.min(100, score + spread), parts: parts.length };
}
