import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BarChart3, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamRunner } from "./ExamRunner";
import { buildExam, pickIds, poolFor } from "@/data/pool";
import { topicFrequency } from "@/data/analysis";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { loadAttempts, saveAttempt, strandScores, levelOf, type AttemptKind } from "@/lib/progress";

type Props = {
  sid: string;
  kind: AttemptKind;
  level: Level;
  subject: Subject;
  title: string;
  /** Questions per strand; ignored when `all` is set. */
  perStrand?: number;
  strand?: string | undefined;
  /** Use every question of the strand (practice mode). */
  all?: boolean;
};

/** A generated question set (diagnostic / retest / practice). The chosen ids persist so a reload keeps the same set. */
export function QuizSession({ sid, kind, level, subject, title, perStrand = 4, strand, all }: Props) {
  const pool = useMemo(() => poolFor(level, subject), [level, subject]);
  const setKey = `preonet-set-${sid}`;
  const [state, setState] = useState<{ ids: string[]; round: number; saved: boolean } | null>(null);

  const newSet = (round: number) => {
    const seen = new Set(loadAttempts().filter((a) => a.level === level && a.subject === subject).flatMap((a) => a.items.map((i) => i.qid)));
    const ids = all ? pool.filter((q) => q.strand === strand).map((q) => q.id) : pickIds(pool, subject, perStrand, strand, seen, topicFrequency(level, subject));
    const s = { ids, round, saved: false };
    localStorage.setItem(setKey, JSON.stringify(s));
    localStorage.removeItem(`exam-answers-${sid}-${round}`);
    setState(s);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(setKey);
      if (raw) return setState(JSON.parse(raw));
    } catch { /* ignore */ }
    newSet(1);
  }, [setKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const exam = useMemo(() => (state ? buildExam(pool, state.ids, { level, subject, title }) : null), [state, pool, level, subject, title]);
  const [submitted, setSubmitted] = useState(false);

  if (!state || !exam) return <div className="flex flex-1 items-center justify-center text-muted-foreground">กำลังสุ่มข้อสอบ...</div>;
  if (!exam.questions.length) return <div className="flex flex-1 items-center justify-center p-6 text-center text-muted-foreground">ยังไม่มีข้อสอบในเรื่องนี้</div>;

  const onStatus = (sub: boolean, answers: Record<string, unknown>) => {
    setSubmitted(sub);
    if (sub && !state.saved) {
      saveAttempt(kind, `${sid}-${state.round}-${Date.now()}`, exam, answers, title);
      const s = { ...state, saved: true };
      localStorage.setItem(setKey, JSON.stringify(s));
      setState(s);
    }
  };

  const last = submitted ? loadAttempts().filter((a) => a.id.startsWith(`${sid}-${state.round}-`)).pop() : undefined;

  return (
    <>
      {submitted && last && (
        <div className="shrink-0 border-b border-border bg-secondary/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2 text-sm sm:px-4">
            {[...strandScores(last.items)].map(([n, v]) => (
              <span key={n} className="rounded-full bg-card px-2.5 py-0.5">
                {n} <b>{v.pct}%</b> <span className="text-muted-foreground">({levelOf(v.pct)})</span>
              </span>
            ))}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setSubmitted(false); newSet(state.round + 1); }}><Shuffle /> สุ่มชุดใหม่</Button>
              <Button size="sm" asChild><Link to="/dashboard" search={{ level, subject }}><BarChart3 /> แดชบอร์ด</Link></Button>
            </div>
          </div>
        </div>
      )}
      <ExamRunner key={state.round} exam={exam} storageKey={`${sid}-${state.round}`} onStatus={onStatus} />
    </>
  );
}
