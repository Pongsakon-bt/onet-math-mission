import { z } from "zod";
import type { Subject } from "@/data/exam-types";
import { ONET_CALENDAR } from "./onet-calendar";

export const planConfigSchema = z.object({
  title: z.string().trim().min(1).max(100),
  grade: z.enum(["p4", "p5", "p6", "m1", "m2", "m3"]),
  room: z.string().trim().max(10).default(""),
  subjects: z.array(z.enum(["math", "thai", "eng", "sci"])).min(1).max(4).refine(v => new Set(v).size === v.length),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7).refine(v => new Set(v).size === v.length),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  minutes: z.number().int().min(15).max(240),
});
export type PlanConfig = z.infer<typeof planConfigSchema>;
export type PlanTopic = { topic: string; strand: string; subject: Subject };
export type PlanSession = { date: string; week: number; subject: Subject; topics: PlanTopic[]; review: boolean };
export const targetLevel = (grade: PlanConfig["grade"]) => grade.startsWith("p") ? "p6" : "m3";
export const dayDate = (day: string) => new Date(`${day}T00:00:00Z`);
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

/** Fixed dates, one session per selected weekday, full topic coverage, no AI generation. */
export function buildTutoringPlan(input: PlanConfig, topics: PlanTopic[]): PlanSession[] {
  const config = planConfigSchema.parse(input);
  const start = dayDate(config.start);
  if (!Number.isFinite(start.getTime()) || dayKey(start) !== config.start) throw new Error("วันเริ่มติวไม่ถูกต้อง");
  const end = dayDate(ONET_CALENDAR[targetLevel(config.grade)].day);
  if (start >= end) throw new Error("เลือกวันเริ่มติวก่อนวันสอบ O-NET");
  if (end.getTime() - start.getTime() > 366 * 864e5) throw new Error("วางแผนได้ล่วงหน้าสูงสุด 1 ปี");
  const monday = new Date(start);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  const sessions: PlanSession[] = [];
  for (let date = new Date(start); date < end; date.setUTCDate(date.getUTCDate() + 1)) {
    if (!config.weekdays.includes(date.getUTCDay())) continue;
    const subject = config.subjects[sessions.length % config.subjects.length];
    if (!subject) continue;
    sessions.push({ date: dayKey(date), week: Math.floor((date.getTime() - monday.getTime()) / (7 * 864e5)) + 1, subject, topics: [], review: false });
  }
  if (sessions.length < config.subjects.length) throw new Error("วันติวที่เหลือน้อยกว่าจำนวนวิชา กรุณาเพิ่มวันติวหรือเลือกวิชาน้อยลง");
  for (const subject of config.subjects) {
    const slots = sessions.filter(s => s.subject === subject);
    const curriculum = topics.filter(t => t.subject === subject);
    if (!curriculum.length) throw new Error("ไม่พบหัวข้อสำหรับวิชาที่เลือก");
    // Contiguous slices keep frequent topics first and distribute every topic exactly once.
    slots.forEach((session, i) => {
      session.topics = curriculum.slice(Math.floor(i * curriculum.length / slots.length), Math.floor((i + 1) * curriculum.length / slots.length));
      session.review = session.topics.length === 0;
    });
  }
  return sessions;
}

export const validResourceSlot = (slot: number) => Number.isInteger(slot) && slot >= 1 && slot <= 3;
export function canEditSchoolResource(role: string, school: string, target: string) {
  return role === "teacher" && school.length > 0 && school === target;
}