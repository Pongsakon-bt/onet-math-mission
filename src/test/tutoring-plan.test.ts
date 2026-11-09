import { describe, expect, it } from "vitest";
import { buildTutoringPlan, canEditSchoolResource, validResourceSlot, type PlanConfig, type PlanTopic } from "@/lib/tutoring-plan";
import { ONET_CALENDAR } from "@/lib/onet-calendar";

const config: PlanConfig = { title: "แผนติว", grade: "p6", room: "", subjects: ["math", "eng"], weekdays: [1, 3], start: "2027-01-04", minutes: 60 };
const topics: PlanTopic[] = Array.from({ length: 10 }, (_, i) => ({ topic: `เรื่อง ${i}`, strand: "สาระ", subject: i % 2 ? "eng" : "math" }));
describe("teacher resources", () => {
  it("allows exactly slots 1 to 3, not a fourth resource", () => {
    expect([1, 2, 3].every(validResourceSlot)).toBe(true);
    expect(validResourceSlot(4)).toBe(false);
    expect(validResourceSlot(0)).toBe(false);
  });
  it("teachers may edit only their own school", () => {
    expect(canEditSchoolResource("teacher", "1055250290", "1055250290")).toBe(true);
    expect(canEditSchoolResource("teacher", "1055250290", "1055250291")).toBe(false);
    expect(canEditSchoolResource("student", "1055250290", "1055250290")).toBe(false);
  });
});
describe("weekly tutoring plan", () => {
  it("uses the same exam deadlines as the countdown", () => {
    expect(ONET_CALENDAR.p6.day).toBe("2027-01-30");
    expect(ONET_CALENDAR.m3.day).toBe("2027-02-01");
  });
  it("creates two sessions weekly on selected weekdays before the exam", () => {
    const sessions = buildTutoringPlan(config, topics);
    expect(sessions).toHaveLength(8);
    expect(sessions[0]?.date).toBe("2027-01-04");
    expect(sessions.at(-1)?.date).toBe("2027-01-27");
    expect(new Set(sessions.map(s => s.week)).size).toBe(4);
    expect(sessions.every(s => [1, 3].includes(new Date(s.date).getUTCDay()))).toBe(true);
  });
  it("includes every topic exactly once across chosen subjects", () => {
    const planned = buildTutoringPlan(config, topics).flatMap(s => s.topics);
    expect(planned).toHaveLength(10);
    expect(new Set(planned.map(t => t.topic)).size).toBe(10);
    expect(buildTutoringPlan(config, topics)).toEqual(buildTutoringPlan(config, topics));
  });
  it("rejects plans starting on or after the exam", () => {
    expect(() => buildTutoringPlan({ ...config, start: "2027-01-30" }, topics)).toThrow();
    expect(() => buildTutoringPlan({ ...config, start: "2027-02-02" }, topics)).toThrow();
  });
  it("uses M3 exam for M1-M3 learners and rejects insufficient sessions", () => {
    expect(buildTutoringPlan({ ...config, grade: "m1", subjects: ["math"], weekdays: [0], start: "2027-01-31" }, topics)[0]?.date).toBe("2027-01-31");
    expect(() => buildTutoringPlan({ ...config, start: "2027-01-29" }, topics)).toThrow();
  });
});