import { describe, expect, it } from "vitest";
import { assignedTo, assignmentStatus, cleanRoom, isAssignmentDone, type Assignment } from "@/lib/assignments";

const base: Assignment = { id: "a", grade: "p6", room: "1", subject: "math", kind: "pre1", target: "", title: "t",
  due_at: "2026-11-10T00:00:00Z", created_at: "2026-11-01T00:00:00Z", teacher_id: "t" };
const at = (iso: string) => new Date(iso).getTime();

describe("assignments", () => {
  it("done only when matching test finished after assigning", () => {
    expect(isAssignmentDone(base, [{ kind: "pre1", level: "p6", subject: "math", label: "x", at: at("2026-11-02T00:00:00Z") }])).toBe(true);
    expect(isAssignmentDone(base, [{ kind: "pre1", level: "p6", subject: "math", label: "x", at: at("2026-10-30T00:00:00Z") }])).toBe(false);
    expect(isAssignmentDone(base, [{ kind: "pre1", level: "p6", subject: "thai", label: "x", at: at("2026-11-02T00:00:00Z") }])).toBe(false);
  });
  it("drill must match the topic", () => {
    const d = { ...base, kind: "drill" as const, target: "เศษส่วน" };
    expect(isAssignmentDone(d, [{ kind: "drill", level: "p6", subject: "math", label: "ข้อสอบย่อย: ทศนิยม", at: at("2026-11-02T00:00:00Z") }])).toBe(false);
    expect(isAssignmentDone(d, [{ kind: "drill", level: "p6", subject: "math", label: "ข้อสอบย่อย: เศษส่วน", at: at("2026-11-02T00:00:00Z") }])).toBe(true);
  });
  it("late after due date when not done", () => {
    expect(assignmentStatus(base, [], at("2026-11-11T00:00:00Z"))).toBe("late");
    expect(assignmentStatus(base, [], at("2026-11-05T00:00:00Z"))).toBe("todo");
  });
  it("targets room, or whole grade when room is empty", () => {
    const s = [{ grade: "p6", room: "1" }, { grade: "p6", room: "2" }, { grade: "m3", room: "1" }];
    expect(assignedTo(base, s)).toHaveLength(1);
    expect(assignedTo({ grade: "p6", room: null }, s)).toHaveLength(2);
  });
  it("room input is trimmed", () => {
    expect(cleanRoom(" 2 ")).toBe("2");
    expect(cleanRoom("")).toBeNull();
  });
});
