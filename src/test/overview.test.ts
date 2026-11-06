import { describe, expect, it } from "vitest";
import { subjectBand, topicCoverage, progressSteps } from "@/lib/overview";
import type { Attempt } from "@/lib/progress";

const att = (kind: string, topic: string, ok: number, n: number, at: number) => ({
  level: "p6", subject: "math", kind, at,
  items: Array.from({ length: n }, (_, i) => ({ qid: `${kind}${at}-${i}`, topic, strand: "x", correct: i < ok, points: 1 })),
}) as unknown as Attempt;

describe("overview", () => {
  it("bands at 50 and 75", () => {
    expect(subjectBand(49)).toBe("needs");
    expect(subjectBand(50)).toBe("fair");
    expect(subjectBand(74)).toBe("fair");
    expect(subjectBand(75)).toBe("good");
    expect(subjectBand(null)).toBe("none");
  });
  it("coverage counts topics with skill ≥ 75", () => {
    const all = [att("pre1", "เศษส่วน", 4, 4, 1), att("pre1", "ทศนิยม", 1, 4, 2)];
    expect(topicCoverage(all, "p6", "math", ["เศษส่วน", "ทศนิยม", "เรขาคณิต", "สถิติ"])).toBe(25);
  });
  it("progress steps average drills", () => {
    const all = [att("pre1", "a", 2, 4, 1), att("drill", "a", 4, 4, 2), att("drill", "b", 2, 4, 3)];
    expect(progressSteps(all, "p6", "math")).toEqual({ pre1: 50, drill: 75, pre2: null });
  });
});
