import { describe, expect, it } from "vitest";
import { assignmentAlert, sortByUrgency, type Assignment } from "@/lib/assignments";
import { predictScore } from "@/lib/prediction";
import { certificateReason } from "@/lib/skill";
import type { Attempt } from "@/lib/progress";

const base: Assignment = { id: "a", grade: "p6", room: "1", subject: "math", kind: "pre1", target: "", title: "t",
  due_at: "2026-11-10T00:00:00Z", created_at: "2026-11-01T00:00:00Z", teacher_id: "t" };
const at = (iso: string) => new Date(iso).getTime();
const att = (kind: Attempt["kind"], ok: number, n = 10, t = 1): Attempt => ({ id: kind + t, kind, level: "p6", subject: "math", label: "x", at: t,
  items: Array.from({ length: n }, (_, i) => ({ qid: `${kind}${t}${i}`, strand: "s", topic: "x", correct: i < ok, points: 1 })) });

describe("assignment alerts", () => {
  it("due within 2 days is soon", () => expect(assignmentAlert(base, [], new Set(["a"]), at("2026-11-08T12:00:00Z"))).toBe("soon"));
  it("past due is late", () => expect(assignmentAlert(base, [], new Set(), at("2026-11-11T00:00:00Z"))).toBe("late"));
  it("unopened is new, opened is todo", () => {
    expect(assignmentAlert(base, [], new Set(), at("2026-11-02T00:00:00Z"))).toBe("new");
    expect(assignmentAlert(base, [], new Set(["a"]), at("2026-11-02T00:00:00Z"))).toBe("todo");
  });
  it("late sorts before new", () => {
    const b = { ...base, id: "b", due_at: null };
    const alerts: Record<string, "late" | "new"> = { a: "late", b: "new" };
    expect(sortByUrgency([b, base], (x) => alerts[x.id]!).map((x) => x.id)).toEqual(["a", "b"]);
  });
});

describe("predicted score", () => {
  it("weights pre2 50, drill 30, pre1 20", () => expect(predictScore([att("pre1", 5, 10, 1), att("drill", 6, 10, 2), att("pre2", 8, 10, 3)])!.score).toBe(68));
  it("re-weights when parts missing", () => expect(predictScore([att("pre1", 4, 10, 1)])!.score).toBe(40));
  it("null with no data", () => expect(predictScore([])).toBeNull());
});

describe("certificate", () => {
  it("pre2 at 80% earns excellent", () => expect(certificateReason([att("pre2", 8)], "p6", "math", [{ skill: 10 }])?.reason).toBe("excellent"));
  it("pre2 at 79% earns nothing", () => expect(certificateReason([att("pre2", 79, 100)], "p6", "math", [{ skill: 10 }])).toBeNull());
  it("all topics passed earns mastered", () => expect(certificateReason([], "p6", "math", [{ skill: 75 }, { skill: 100 }])?.reason).toBe("mastered"));
});
