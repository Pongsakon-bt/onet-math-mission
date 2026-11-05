import { p6Exam, m3Exam } from "./exams";
import type { Exam, Subject } from "./exam-types";

export type Level = "p6" | "m3";
export const examKey = (e: Pick<Exam, "level" | "subject" | "year">) => `${e.level}-${e.subject}-${e.year}`;

// Every transcribed set in ./sets/<level>-<subject>-<year>.ts is picked up automatically.
const modules = import.meta.glob<{ exam: Exam }>("./sets/*.ts", { eager: true });

const list: Exam[] = [p6Exam, m3Exam, ...Object.values(modules).map((m) => m.exam)];
export const catalog: Record<string, Exam> = Object.fromEntries(list.map((e) => [examKey(e), e]));

export function yearsFor(level: Level, subject: Subject): Exam[] {
  return list.filter((e) => e.level === level && e.subject === subject).sort((a, b) => b.year - a.year);
}

export const SUBJECT_NAMES: Record<Subject, string> = { math: "คณิตศาสตร์", thai: "ภาษาไทย", eng: "ภาษาอังกฤษ", sci: "วิทยาศาสตร์" };
