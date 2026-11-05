import { catalog, type Level } from "./catalog";
import type { Exam, Question, Subject } from "./exam-types";
import { strandOf, strandsFor } from "./strands";
import { baseTopic } from "./analysis";

export type PoolQuestion = Question & { strand: string; fromYear: number };

/** Every auto-scored question of one level+subject across all years, tagged with its strand. */
export function poolFor(level: Level, subject: Subject): PoolQuestion[] {
  return Object.values(catalog)
    .filter((e) => e.level === level && e.subject === subject)
    .sort((a, b) => b.year - a.year)
    .flatMap((e) =>
      e.questions
        .filter((q) => q.type !== "essay")
        .map((q) => ({ ...q, strand: strandOf(subject, q.topic), fromYear: e.year }) as PoolQuestion),
    );
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
}

/** Pick `perStrand` questions per strand (or only the given strand), preferring ids not in `seen`. */
export function pickIds(pool: PoolQuestion[], subject: Subject, perStrand: number, onlyStrand?: string, seen: Set<string> = new Set(), freq?: Map<string, number>) {
  const names = onlyStrand ? [onlyStrand] : strandsFor(subject);
  const f = (q: PoolQuestion) => freq?.get(baseTopic(q.topic)) ?? 0;
  const picked = names.flatMap((n) => {
    const qs = pool.filter((q) => q.strand === n);
    // Frequently tested topics (appear in more years) come first; random order within the same frequency.
    const fresh = shuffle(qs.filter((q) => !seen.has(q.id))).sort((a, b) => f(b) - f(a));
    const old = shuffle(qs.filter((q) => seen.has(q.id)));
    return [...fresh, ...old].slice(0, perStrand).map((q) => q.id);
  });
  return withPassageGroups(pool, picked);
}

/** Questions that share one reading passage/situation are a set: if one is picked, bring all of
 *  its siblings along, kept together and in their original order, so no question loses its context. */
export function withPassageGroups(pool: PoolQuestion[], ids: string[]): string[] {
  const key = (q: PoolQuestion) => (q.passage ? `${q.fromYear}|${q.passage}` : null);
  const groups = new Map<string, PoolQuestion[]>();
  for (const q of pool) {
    const k = key(q);
    if (k) groups.set(k, [...(groups.get(k) ?? []), q]);
  }
  const byId = new Map(pool.map((q) => [q.id, q]));
  const out: string[] = [];
  const done = new Set<string>();
  for (const id of ids) {
    if (done.has(id)) continue;
    const q = byId.get(id);
    const k = q && key(q);
    const set = k ? [...groups.get(k)!].sort((a, b) => a.no - b.no) : q ? [q] : [];
    for (const s of set) if (!done.has(s.id)) { done.add(s.id); out.push(s.id); }
  }
  return out;
}

/** Wrap chosen questions as a temporary exam (renumbered 1..n). Topic shows the source year. */
export function buildExam(pool: PoolQuestion[], ids: string[], meta: { level: Level; subject: Subject; title: string; minutesPerQ?: number }): Exam {
  const byId = new Map(pool.map((q) => [q.id, q]));
  const questions = ids.map((id) => byId.get(id)).filter((q): q is PoolQuestion => !!q)
    .map((q, i) => ({ ...q, no: i + 1, topic: `${q.strand} · ${q.topic} (ปี ${q.fromYear})` }));
  return {
    level: meta.level,
    subject: meta.subject,
    year: 0,
    title: meta.title,
    code: "ชุดสุ่มจากข้อสอบจริง",
    examDate: "ข้อสอบ O-NET ปีการศึกษา 2565–2568",
    minutes: Math.max(5, Math.round(questions.length * (meta.minutesPerQ ?? 2))),
    questions,
  };
}
