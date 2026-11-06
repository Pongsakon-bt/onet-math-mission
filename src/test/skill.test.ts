import { describe, expect, it } from "vitest";
import { answeredCount, isPreUnlocked, isUnlocked, topicSkill } from "@/lib/skill";
import type { Attempt } from "@/lib/progress";

const item = (qid: string, topic: string, correct: boolean) => ({ qid, strand: "s", topic, correct, points: 1 });
const att = (id: string, kind: Attempt["kind"], items: Attempt["items"], at = 1): Attempt => ({ id, kind, level: "p6", subject: "math", label: "", at, items });

describe("unlock rule", () => {
  it("needs 40 distinct real questions", () => {
    expect(isUnlocked(39)).toBe(false);
    expect(isUnlocked(40)).toBe(true);
  });
  it("does not count drills or repeated questions", () => {
    const a = [
      att("a", "diagnostic", [item("q1", "ร้อยละ", true), item("q2", "ร้อยละ", false)]),
      att("b", "practice", [item("q1", "ร้อยละ", true)]),
      att("c", "drill", [item("d1", "ร้อยละ", true)]),
    ];
    expect(answeredCount(a, "p6", "math")).toBe(2);
  });
});

describe("PRE O-NET round 1 unlocks everything", () => {
  it("locked until round 1 is finished", () => {
    expect(isPreUnlocked([att("a", "diagnostic", [item("q1", "x", true)])], "p6", "math")).toBe(false);
    expect(isPreUnlocked([att("p", "pre1", [item("q1", "x", true)])], "p6", "math")).toBe(true);
  });
  it("round 2 alone does not unlock", () => {
    expect(isPreUnlocked([att("p", "pre2", [item("q1", "x", true)])], "p6", "math")).toBe(false);
  });
  it("only counts the same level and subject", () => {
    const a: Attempt = { ...att("p", "pre1", [item("q1", "x", true)]), subject: "thai" };
    expect(isPreUnlocked([a], "p6", "math")).toBe(false);
  });
});

describe("skill 0-100", () => {
  it("is null with no data", () => expect(topicSkill([], "p6", "math", "ร้อยละ").skill).toBeNull());
  it("mixes latest drill 60% with real exam 40%", () => {
    const a = [
      att("a", "diagnostic", [item("q1", "ร้อยละ", true), item("q2", "ร้อยละ", false)], 1),
      att("d", "drill", Array.from({ length: 20 }, (_, i) => item(`d${i}`, "ร้อยละ", i < 15)), 2),
    ];
    expect(topicSkill(a, "p6", "math", "ร้อยละ").skill).toBe(65); // 0.6*75 + 0.4*50
  });
  it("stays within 0-100", () => {
    const a = [att("d", "drill", [item("d1", "ร้อยละ", true)])];
    expect(topicSkill(a, "p6", "math", "ร้อยละ").skill).toBe(100);
  });
});
