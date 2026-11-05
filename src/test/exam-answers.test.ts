import { describe, expect, it } from "vitest";
import { m3Exam, p6Exam, scoreExam } from "@/data/exams";

// Official answer sheets included with the uploaded O-NET 2568 papers.
const p6Key: (number)[] = [3, 2, 2, 3, 3, 1, 1, 4, 3, 4, 3, 34, 500, 27, 224];
const m3Key: unknown[] = [1, 4, 1, 4, 2, { "6.1": false, "6.2": false, "6.3": true, "6.4": false },
  1, 4, 4, 3, 1, 3, 2, 2, 2, 4, 20, 850, 154, 33];

describe("O-NET 2568 answer keys", () => {
  it("P.6 matches the official sheet and full marks = 100", () => {
    const answers = Object.fromEntries(p6Exam.questions.map((q, i) => [q.id, p6Key[i]]));
    const r = scoreExam(p6Exam, answers);
    expect(r.correct).toBe(15);
    expect(r.score).toBe(100);
  });
  it("M.3 matches the official sheet and full marks = 100", () => {
    const answers = Object.fromEntries(m3Exam.questions.map((q, i) => [q.id, m3Key[i]]));
    const r = scoreExam(m3Exam, answers);
    expect(r.correct).toBe(20);
    expect(r.score).toBe(100);
  });
});
