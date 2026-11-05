import { isCorrect, type Exam, type Subject } from "@/data/exams";
import type { Level } from "@/data/catalog";
import { strandOf } from "@/data/strands";

export type AttemptKind = "diagnostic" | "practice" | "retest" | "full";
export type Attempt = {
  id: string;
  kind: AttemptKind;
  level: Level;
  subject: Subject;
  label: string;
  at: number;
  items: { qid: string; no?: number; strand: string; topic: string; correct: boolean; points: number }[];
  /** Page to return to for the question-by-question review. */
  back?: string;
  /** Time spent in ms, when timed. */
  ms?: number;
};

const KEY = "preonet-attempts";
const STUDIED = "preonet-studied";

export function loadAttempts(): Attempt[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Attempt[]; } catch { return []; }
}

/** Save (or replace by id) one finished attempt. Essays are skipped — they are teacher-graded. */
export function saveAttempt(kind: AttemptKind, id: string, exam: Exam, answers: Record<string, unknown>, label: string, extra: { back?: string; ms?: number } = {}) {
  const items = exam.questions.filter((q) => q.type !== "essay").map((q) => {
    const base = (q as { strand?: string }).strand ?? strandOf(exam.subject, q.topic);
    return { qid: q.id, no: q.no, strand: base, topic: q.topic, correct: isCorrect(q, answers[q.id]), points: q.points };
  });
  const list = loadAttempts().filter((a) => a.id !== id);
  const attempt: Attempt = { id, kind, level: exam.level, subject: exam.subject, label, at: Date.now(), items, ...extra };
  list.push(attempt);
  localStorage.setItem(KEY, JSON.stringify(list));
  // Also store it in the student's account when signed in, so their teacher can see it.
  void import("./session").then((m) => m.uploadAttempt(attempt)).catch(() => {});
}

export function loadStudied(): string[] {
  try { return JSON.parse(localStorage.getItem(STUDIED) ?? "[]") as string[]; } catch { return []; }
}
export function markStudied(key: string) {
  const s = new Set(loadStudied()); s.add(key);
  localStorage.setItem(STUDIED, JSON.stringify([...s]));
}

/** Percent correct per strand for one attempt (by question count). */
export function strandScores(items: Attempt["items"]) {
  const m = new Map<string, { ok: number; n: number }>();
  for (const it of items) {
    const v = m.get(it.strand) ?? { ok: 0, n: 0 };
    v.n++; if (it.correct) v.ok++;
    m.set(it.strand, v);
  }
  return new Map([...m].map(([k, v]) => [k, { ...v, pct: Math.round((v.ok / v.n) * 100) }]));
}

export const levelOf = (pct: number) => (pct < 50 ? "อ่อน" : pct < 75 ? "พอใช้" : "ดี");
