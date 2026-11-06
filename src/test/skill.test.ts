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

import { topicStatus, nextTopic, subjectReady } from "@/lib/skill";
describe("topic status after drill", () => {
  it("uses 50/75/100 thresholds", () => {
    expect(topicStatus(null)).toBe("none");
    expect(topicStatus(49)).toBe("needs");
    expect(topicStatus(50)).toBe("fair");
    expect(topicStatus(74)).toBe("fair");
    expect(topicStatus(75)).toBe("pass");
    expect(topicStatus(99)).toBe("pass");
    expect(topicStatus(100)).toBe("mastered");
  });
  it("next topic skips passed and picks lowest skill, then most frequent", () => {
    const rows = [
      { topic: "a", skill: 80, years: [1] },
      { topic: "b", skill: 40, years: [1] },
      { topic: "c", skill: 40, years: [1, 2] },
    ];
    expect(nextTopic(rows)?.topic).toBe("c");
    expect(nextTopic(rows, "c")?.topic).toBe("b");
    expect(nextTopic([{ topic: "a", skill: 75, years: [] }])).toBeNull();
  });
  it("subject ready only when every topic ≥ 75", () => {
    expect(subjectReady([{ skill: 75 }, { skill: 100 }])).toBe(true);
    expect(subjectReady([{ skill: 75 }, { skill: null }])).toBe(false);
  });
});
