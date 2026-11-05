import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import { scoreExam, type Question } from "@/data/exam-types";

const correctAnswer = (q: Question): unknown => {
  switch (q.type) {
    case "mcq": case "numeric": case "order": return q.answer;
    case "multi": return q.answers;
    case "truefalse": return Object.fromEntries(q.items.map((i) => [i.label, i.answer]));
    case "essay": return undefined;
  }
};

describe("every transcribed exam", () => {
  for (const [key, exam] of Object.entries(catalog)) {
    it(`${key}: answering every key correctly gets every auto-graded question right`, () => {
      const answers = Object.fromEntries(exam.questions.map((q) => [q.id, correctAnswer(q)]));
      const r = scoreExam(exam, answers);
      expect(r.correct).toBe(r.autoTotal);
      expect(new Set(exam.questions.map((q) => q.id)).size).toBe(exam.questions.length);
    });
  }
});
