/**
 * Text markup used in questions:
 *   {a/b}  -> stacked fraction      [n]{a/b} not used; mixed numbers write "1{4/15}"
 *   ^{n}   -> superscript
 *   √{x}   -> square root, ∛{x} -> cube root
 */

export type Figure =
  | { kind: "image"; src: string; alt: string; maxWidth?: number }
  | { kind: "lineVisitors" }
  | { kind: "pieDrinks" }
  | { kind: "pieColors" }
  | { kind: "barFlu" }
  | { kind: "stemLeaf" }
  | { kind: "dataStrip" }
  | { kind: "pyramid" };

export type Choice = { text?: string; shape?: "hexagon" | "square" | "trapezoid" | "triangle" };

type Base = {
  id: string;
  no: number;
  topic: string;
  points: number;
  prompt: string;
  promptAfter?: string;
  figure?: Figure;
  /** Shared reading passage / situation shown above the question (Thai, English, Science sets). */
  passage?: string;
  /** Worked solution / explanation — only shown after submitting. */
  steps: string[];
  /** Hints shown during the exam — must never reveal the answer. */
  hints?: string[];
};

export type McqQuestion = Base & { type: "mcq"; choices: Choice[]; answer: number };
export type NumericQuestion = Base & { type: "numeric"; answer: number; unit?: string };
export type TrueFalseQuestion = Base & {
  type: "truefalse";
  items: { label: string; text: string; answer: boolean }[];
};
/** Choose every correct option (answers = 1-based indexes). */
export type MultiQuestion = Base & { type: "multi"; choices: Choice[]; answers: number[] };
export type Question = McqQuestion | NumericQuestion | TrueFalseQuestion | MultiQuestion;

export type Subject = "math" | "thai" | "eng" | "sci";
export type Exam = {
  level: "p6" | "m3";
  subject: Subject;
  title: string;
  code: string;
  examDate: string;
  minutes: number;
  questions: Question[];
};


export function isCorrect(q: Question, ans: unknown): boolean {
  if (ans === undefined || ans === null || ans === "") return false;
  if (q.type === "mcq") return ans === q.answer;
  if (q.type === "numeric") return Math.abs(Number(ans) - q.answer) < 1e-9;
  if (q.type === "multi") {
    const a = [...(ans as number[])].sort((x, y) => x - y);
    const b = [...q.answers].sort((x, y) => x - y);
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  const a = ans as Record<string, boolean>;
  return q.items.every((it) => a[it.label] === it.answer);
}

export function scoreExam(exam: Exam, answers: Record<string, unknown>) {
  let score = 0;
  let correct = 0;
  for (const q of exam.questions) {
    if (isCorrect(q, answers[q.id])) {
      score += q.points;
      correct += 1;
    }
  }
  return { score: Math.round(score * 1000) / 1000, correct, total: exam.questions.length };
}
