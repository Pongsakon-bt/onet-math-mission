import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, RotateCcw, Check, X, Delete, SkipForward, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isCorrect, scoreExam, type Exam, type Question } from "@/data/exams";
import { hints } from "@/data/hints";
import { Rich } from "./Rich";
import { FigureView, ShapeChoice } from "./Figures";

type Answers = Record<string, unknown>;

export function ExamRunner({ exam }: { exam: Exam }) {
  const key = `exam-answers-${exam.level}`;
  const [answers, setAnswers] = useState<Answers>({});
  const [idx, setIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as { answers: Answers; submitted: boolean };
        setAnswers(saved.answers ?? {});
        setSubmitted(!!saved.submitted);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify({ answers, submitted }));
  }, [answers, submitted, loaded, key]);

  const qs = exam.questions;
  const q = qs[idx] ?? qs[0]!;
  const result = useMemo(() => scoreExam(exam, answers), [exam, answers]);
  const answeredCount = qs.filter((x) => isAnswered(x, answers[x.id])).length;
  const left = qs.length - answeredCount;
  const setAns = (v: unknown) => !submitted && setAnswers((a) => ({ ...a, [q.id]: v }));

  const nextUnanswered = () => {
    for (let k = 1; k <= qs.length; k++) {
      const j = (idx + k) % qs.length;
      if (!isAnswered(qs[j]!, answers[qs[j]!.id])) return j;
    }
    return -1;
  };
  const skip = () => {
    const j = nextUnanswered();
    setIdx(j === -1 ? (idx + 1) % qs.length : j);
  };
  const submit = () => {
    if (left > 0 && !confirm) return setConfirm(true);
    setConfirm(false);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <QuestionStrip exam={exam} idx={idx} setIdx={setIdx} answers={answers} submitted={submitted} answeredCount={answeredCount} result={result} />

      <article key={q.id} className="animate-in fade-in mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 py-2 sm:px-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto md:grid landscape:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] landscape:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] rounded-2xl border border-border bg-card p-3 shadow-paper sm:p-5 md:grid-cols-2 md:overflow-hidden landscape:grid-cols-2 landscape:overflow-hidden">
          {/* Left: the question */}
          <section className="min-w-0 shrink-0 md:min-h-0 landscape:min-h-0 md:shrink landscape:shrink md:overflow-y-auto landscape:overflow-y-auto md:pr-2 landscape:pr-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-primary-foreground">{q.no}</span>
              <p className="min-w-0 truncate text-xs text-muted-foreground">{q.topic} · {q.points} คะแนน</p>
              {submitted && <Verdict ok={isCorrect(q, answers[q.id])} />}
            </div>
            <p className="text-base leading-relaxed sm:text-lg [@media(max-height:500px)]:text-sm"><Rich text={q.prompt} /></p>
            {q.figure && <div className="mt-3"><FigureView figure={q.figure} /></div>}
          </section>

          {/* Right: answer + hints */}
          <section className="flex min-w-0 shrink-0 flex-col gap-3 md:min-h-0 landscape:min-h-0 md:overflow-y-auto landscape:overflow-y-auto md:border-l md:pl-4 landscape:border-l landscape:pl-4 border-border">
            {q.promptAfter && <p className="font-semibold leading-relaxed sm:text-lg"><Rich text={q.promptAfter} /></p>}
            <p className="text-xs font-medium text-muted-foreground">
              {q.type === "mcq" ? "แตะเลือก 1 คำตอบ" : q.type === "numeric" ? "กดตัวเลขคำตอบ" : "ตอบ ใช่ / ไม่ใช่ ทุกข้อย่อย"}
            </p>
            {q.type === "mcq" && <McqInput q={q} value={answers[q.id] as number | undefined} onChange={setAns} submitted={submitted} />}
            {q.type === "numeric" && <NumericInput q={q} value={(answers[q.id] as string) ?? ""} onChange={setAns} submitted={submitted} />}
            {q.type === "truefalse" && <TrueFalseInput q={q} value={(answers[q.id] as Record<string, boolean>) ?? {}} onChange={setAns} submitted={submitted} />}
            <HintBox q={q} submitted={submitted} />
          </section>
        </div>
      </article>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:px-4">
          <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => setIdx(idx - 1)} aria-label="ข้อก่อนหน้า">
            <ChevronLeft /> <span className="hidden sm:inline">ก่อนหน้า</span>
          </Button>
          {!submitted && (
            <Button variant="ghost" size="sm" onClick={skip} disabled={left === 0 || (left === 1 && !isAnswered(q, answers[q.id]))}>
              <SkipForward /> ข้ามไปข้อที่ยังไม่ทำ
            </Button>
          )}
          <div className="flex-1" />
          {submitted ? (
            <Button variant="outline" size="sm" onClick={() => { setAnswers({}); setSubmitted(false); setIdx(0); }}>
              <RotateCcw /> ทำใหม่
            </Button>
          ) : confirm ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden text-highlight-strong sm:inline">ยังไม่ทำอีก {left} ข้อ</span>
              <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>กลับไปทำ</Button>
              <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={submit}>ส่งเลย</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="border-success text-success" onClick={submit} disabled={answeredCount === 0}>
              ส่งคำตอบ
            </Button>
          )}
          <Button size="sm" disabled={idx === qs.length - 1} onClick={() => setIdx(idx + 1)} aria-label="ข้อถัดไป">
            <span className="hidden sm:inline">ถัดไป</span> <ChevronRight />
          </Button>
        </div>
      </footer>
    </div>
  );
}

function QuestionStrip({ exam, idx, setIdx, answers, submitted, answeredCount, result }: {
  exam: Exam; idx: number; setIdx: (i: number) => void; answers: Answers; submitted: boolean; answeredCount: number;
  result: { score: number; correct: number; total: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>(`[data-i="${idx}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [idx]);
  const n = exam.questions.length;
  return (
    <nav aria-label="แผนผังข้อสอบ" className="shrink-0 border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-3 py-2 sm:px-4 [@media(max-height:500px)]:py-1">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
          <p className="font-semibold">ข้อ {idx + 1}/{n}</p>
          <div className="mx-2 h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answeredCount / n) * 100}%` }} />
          </div>
          {submitted ? (
            <p className="font-semibold text-primary">{result.score.toFixed(2)} คะแนน · ถูก {result.correct}/{n}</p>
          ) : (
            <p className="flex gap-2 text-muted-foreground">
              <span>ทำแล้ว {answeredCount}</span>
              <span className={cn(n - answeredCount > 0 && "font-semibold text-highlight-strong")}>ยังไม่ทำ {n - answeredCount}</span>
            </p>
          )}
        </div>
        <div ref={ref} className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          {exam.questions.map((x, i) => {
            const done = isAnswered(x, answers[x.id]);
            const ok = submitted && isCorrect(x, answers[x.id]);
            return (
              <button
                key={x.id}
                data-i={i}
                onClick={() => setIdx(i)}
                aria-label={`ไปข้อ ${x.no}${done ? "" : " (ยังไม่ทำ)"}`}
                aria-current={i === idx ? "step" : undefined}
                className={cn(
                  "h-8 min-w-8 shrink-0 rounded-md border px-1 text-sm font-semibold transition",
                  i === idx && "ring-2 ring-ring ring-offset-1 ring-offset-card",
                  submitted
                    ? ok ? "border-success bg-success text-success-foreground" : "border-destructive bg-destructive/15 text-destructive"
                    : done ? "border-primary bg-primary text-primary-foreground" : "border-dashed border-muted-foreground/60 bg-background text-muted-foreground hover:bg-secondary",
                )}
              >
                {x.no}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function isAnswered(q: Question, v: unknown) {
  if (v === undefined || v === "") return false;
  if (q.type === "truefalse") return Object.keys(v as object).length === q.items.length;
  return true;
}

function Verdict({ ok }: { ok: boolean }) {
  return (
    <span className={cn("ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
      ok ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground")}>
      {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {ok ? "ถูกต้อง" : "ยังไม่ถูก"}
    </span>
  );
}

function McqInput({ q, value, onChange, submitted }: { q: Extract<Question, { type: "mcq" }>; value: number | undefined; onChange: (v: number) => void; submitted: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {q.choices.map((c, i) => {
        const n = i + 1;
        const chosen = value === n;
        const right = submitted && n === q.answer;
        const wrong = submitted && chosen && n !== q.answer;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            disabled={submitted}
            className={cn(
              "flex items-center gap-2 rounded-xl border-2 p-2 text-left text-sm transition sm:text-base",
              chosen ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary",
              right && "border-success bg-success/10",
              wrong && "border-destructive bg-destructive/10",
            )}
          >
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
              chosen ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
              right && "border-success bg-success text-success-foreground")}>
              {n}
            </span>
            {c.shape ? <ShapeChoice shape={c.shape} /> : <span className="min-w-0"><Rich text={c.text ?? ""} /></span>}
          </button>
        );
      })}
    </div>
  );
}

function NumericInput({ q, value, onChange, submitted }: { q: Extract<Question, { type: "numeric" }>; value: string; onChange: (v: string) => void; submitted: boolean }) {
  const press = (k: string) => {
    if (k === "del") return onChange(value.slice(0, -1));
    if (k === "." && value.includes(".")) return;
    if (value.replace(".", "").length >= 6) return;
    onChange(value + k);
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="text-center">
        <div className={cn("flex min-w-36 items-center justify-center gap-2 rounded-xl border-2 bg-background px-4 py-2 font-display text-3xl tabular-nums",
          submitted ? (value !== "" && Number(value) === q.answer ? "border-success" : "border-destructive") : "border-primary")}>
          <span>{value || <span className="text-muted-foreground/40">?</span>}</span>
          {q.unit && <span className="text-sm text-muted-foreground">{q.unit}</span>}
        </div>
        {submitted && <p className="mt-1 text-sm">คำตอบที่ถูก: <b>{q.answer}</b> {q.unit}</p>}
      </div>
      {!submitted && (
        <div className="grid grid-cols-4 gap-1.5">
          {["7", "8", "9", "del", "4", "5", "6", ".", "1", "2", "3", "0"].map((k) => (
            <button key={k} onClick={() => press(k)} aria-label={k === "del" ? "ลบ" : k}
              className="flex h-10 w-12 items-center justify-center rounded-lg border border-border bg-secondary text-lg font-semibold transition hover:bg-accent active:scale-95">
              {k === "del" ? <Delete className="h-5 w-5" /> : k}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TrueFalseInput({ q, value, onChange, submitted }: { q: Extract<Question, { type: "truefalse" }>; value: Record<string, boolean>; onChange: (v: Record<string, boolean>) => void; submitted: boolean }) {
  return (
    <div className="space-y-1.5">
      {q.items.map((it) => {
        const v = value[it.label];
        return (
          <div key={it.label} className={cn("flex items-center gap-2 rounded-lg border p-2 text-sm",
            submitted && (v === it.answer ? "border-success bg-success/10" : "border-destructive bg-destructive/10"))}>
            <span className="font-bold text-primary">{it.label}</span>
            <span className="min-w-0 flex-1">{it.text}</span>
            <div className="flex shrink-0 gap-1">
              {[true, false].map((b) => (
                <button key={String(b)} disabled={submitted} onClick={() => onChange({ ...value, [it.label]: b })}
                  className={cn("rounded-md border-2 px-2.5 py-1 font-semibold transition",
                    v === b ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary",
                    submitted && it.answer === b && "ring-2 ring-success ring-offset-1")}>
                  {b ? "ใช่" : "ไม่ใช่"}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** During the exam: hints only (never the answer). After submitting: the full worked solution. */
function HintBox({ q, submitted }: { q: Question; submitted: boolean }) {
  const list = hints[q.id] ?? [];
  const [shown, setShown] = useState(0);
  useEffect(() => setShown(0), [q.id]);

  if (submitted) {
    return (
      <details className="rounded-xl bg-highlight/20 p-3 text-sm">
        <summary className="flex cursor-pointer items-center gap-2 font-semibold"><BookOpen className="h-4 w-4" /> ดูวิธีทำ (หลังส่งคำตอบ)</summary>
        <ol className="mt-2 space-y-1.5">
          {q.steps.map((s, i) => (
            <li key={i} className="flex gap-2"><span className="font-bold">{i + 1}.</span><span><Rich text={s} /></span></li>
          ))}
        </ol>
      </details>
    );
  }
  return (
    <div className="mt-auto">
      {shown === 0 ? (
        <Button variant="ghost" size="sm" onClick={() => setShown(1)} className="text-primary">
          <Lightbulb /> ขอคำใบ้
        </Button>
      ) : (
        <div className="rounded-xl bg-highlight/20 p-3 text-sm">
          <p className="mb-1 flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4" /> คำใบ้</p>
          <ul className="space-y-1">
            {list.slice(0, shown).map((h, i) => (
              <li key={i} className="animate-in fade-in">💡 <Rich text={h} /></li>
            ))}
          </ul>
          {shown < list.length && (
            <Button size="sm" variant="outline" className="mt-2 h-7" onClick={() => setShown(shown + 1)}>
              ขอคำใบ้เพิ่ม ({shown}/{list.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
