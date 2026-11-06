import type { Attempt } from "./progress";

export type AssignmentKind = "pre1" | "pre2" | "drill";
export type Assignment = {
  id: string; grade: string; room: string | null; subject: string; kind: AssignmentKind;
  target: string; title: string; due_at: string | null; created_at: string; teacher_id: string;
};
export type AssignmentStatus = "done" | "todo" | "late";

type AttemptLike = Pick<Attempt, "kind" | "level" | "subject" | "label" | "at">;

/** An assignment counts as done when the student finished the matching test after it was assigned. */
export function isAssignmentDone(a: Assignment, attempts: AttemptLike[]): boolean {
  const since = new Date(a.created_at).getTime();
  return attempts.some((t) =>
    t.level === a.grade && t.subject === a.subject && t.at >= since && t.kind === a.kind &&
    (a.kind !== "drill" || t.label === `ข้อสอบย่อย: ${a.target}`));
}

export function assignmentStatus(a: Assignment, attempts: AttemptLike[], now = Date.now()): AssignmentStatus {
  if (isAssignmentDone(a, attempts)) return "done";
  return a.due_at && new Date(a.due_at).getTime() < now ? "late" : "todo";
}

/** Students an assignment is meant for: same grade, and same room unless it targets the whole grade. */
export function assignedTo<T extends { grade: string | null; room: string | null }>(a: Pick<Assignment, "grade" | "room">, students: T[]): T[] {
  return students.filter((s) => s.grade === a.grade && (a.room == null || s.room === a.room));
}

export function cleanRoom(v: unknown): string | null {
  const s = String(v ?? "").replace(/\s+/g, "").slice(0, 10);
  return s || null;
}

export const classLabel = (grade: string | null, room: string | null) =>
  grade ? `${grade === "p6" ? "ป.6" : "ม.3"}${room ? `/${room}` : ""}` : "ยังไม่ระบุชั้น";

export type AssignmentAlert = "done" | "late" | "soon" | "new" | "todo";
/** Days before the due date that count as "ใกล้ครบกำหนด". */
export const SOON_DAYS = 2;

/** Badge for one assignment on the student's dashboard: late > due soon > not yet opened > to do. */
export function assignmentAlert(a: Assignment, attempts: AttemptLike[], seen: ReadonlySet<string>, now = Date.now()): AssignmentAlert {
  const st = assignmentStatus(a, attempts, now);
  if (st !== "todo") return st;
  if (a.due_at && new Date(a.due_at).getTime() - now <= SOON_DAYS * 86400000) return "soon";
  return seen.has(a.id) ? "todo" : "new";
}

const ALERT_ORDER: Record<AssignmentAlert, number> = { late: 0, soon: 1, new: 2, todo: 3, done: 4 };
/** Most urgent first, then the nearest due date. */
export function sortByUrgency<T extends Assignment>(list: T[], alertOf: (a: T) => AssignmentAlert): T[] {
  const due = (a: T) => (a.due_at ? new Date(a.due_at).getTime() : Infinity);
  return [...list].sort((x, y) => ALERT_ORDER[alertOf(x)] - ALERT_ORDER[alertOf(y)] || due(x) - due(y));
}
