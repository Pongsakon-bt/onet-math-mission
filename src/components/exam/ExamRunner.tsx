import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Lightbulb, RotateCcw, Check, X, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isCorrect, scoreExam, type Exam, type Question } from "@/data/exams";
import { Rich } from "./Rich";
import { FigureView, ShapeChoice } from "./Figures";

type Answers = Record<string, unknown>;

export function ExamRunner({ exam }: { exam: Exam }) {
  const key = `exam-answers-${exam.level}`;
  const [answers, setAnswers] = useState<Answers>({});
  const [idx, setIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  const q = exam.questions[idx] ?? exam.questions[0]!;
  const result = useMemo(() => scoreExam(exam, answers), [exam, answers]);
  const answeredCount = exam.questions.filter((x) => isAnswered(x, answers[x.id])).length;
  const setAns = (v: unknown) => !submitted && setAnswers((a) => ({ ...a, [q.id]: v }));

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_260px]">
      <main>
        <nav aria-label="แผนผังข้อสอบ" className="sticky top-[61px] z-[5] -mx-4 mb-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-card sm:shadow-paper">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="font-semibold">ข้อ {q.no} จาก {exam.questions.length}</p>
            <p className="flex flex-wrap gap-3 text-muted-foreground">
              {submitted ? (
                <>
                  <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-success" />ถูก {result.correct}</span>
                  <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-destructive" />ผิด {result.total - result.correct}</span>
                </>
              ) : (
                <>
                  <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-primary" />ทำแล้ว {answeredCount}</span>
                  <span className={cn(exam.questions.length - answeredCount > 0 && "font-semibold text-highlight-strong")}>
                    <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-dashed border-muted-foreground" />ยังไม่ทำ {exam.questions.length - answeredCount}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answeredCount / exam.questions.length) * 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exam.questions.map((x, i) => {
              const done = isAnswered(x, answers[x.id]);
              const ok = submitted && isCorrect(x, answers[x.id]);
              return (
                <button
                  key={x.id}
                  onClick={() => setIdx(i)}
                  aria-label={`ไปข้อ ${x.no}${done ? "" : " (ยังไม่ทำ)"}`}
                  aria-current={i === idx ? "step" : undefined}
                  className={cn(
                    "h-9 w-9 rounded-lg border text-sm font-semibold transition",
                    i === idx && "ring-2 ring-ring ring-offset-2 ring-offset-card",
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
        </nav>
        <article key={q.id} className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border bg-card p-5 shadow-paper sm:p-8">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-display text-xl text-primary-foreground">
                {q.no}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{q.topic}</p>
                <p className="text-sm font-medium">
                  {q.type === "mcq" ? "เลือก 1 คำตอบ" : q.type === "numeric" ? "เติมตัวเลขคำตอบ" : "ตอบ ใช่ / ไม่ใช่ ทุกข้อย่อย"} · {q.points} คะแนน
                </p>
              </div>
            </div>
            {submitted && <Verdict ok={isCorrect(q, answers[q.id])} />}
          </header>

          <p className="text-lg leading-relaxed"><Rich text={q.prompt} /></p>
          {q.figure && <div className="my-5"><FigureView figure={q.figure} /></div>}
          {q.promptAfter && <p className="mb-2 text-lg font-semibold leading-relaxed"><Rich text={q.promptAfter} /></p>}

          <div className="mt-5">
            {q.type === "mcq" && <McqInput q={q} value={answers[q.id] as number | undefined} onChange={setAns} submitted={submitted} />}
            {q.type === "numeric" && <NumericInput q={q} value={(answers[q.id] as string) ?? ""} onChange={setAns} submitted={submitted} />}
            {q.type === "truefalse" && (
              <TrueFalseInput q={q} value={(answers[q.id] as Record<string, boolean>) ?? {}} onChange={setAns} submitted={submitted} />
            )}
          </div>

          <Solution q={q} forceOpen={submitted} />

          <footer className="mt-8 flex items-center justify-between gap-2">
            <Button variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
              <ChevronLeft /> ข้อก่อนหน้า
            </Button>
            {idx < exam.questions.length - 1 ? (
              <Button onClick={() => setIdx(idx + 1)}>
                ข้อถัดไป <ChevronRight />
              </Button>
            ) : !submitted ? (
              <Button variant="default" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setSubmitted(true)}>
                ส่งคำตอบ
              </Button>
            ) : null}
          </footer>
        </article>
      </main>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-paper">
          <p className="mb-3 text-sm font-semibold">
            {submitted ? "ผลคะแนน" : `ตอบแล้ว ${answeredCount}/${exam.questions.length} ข้อ`}
          </p>
          {submitted && (
            <div className="mb-4 rounded-xl bg-secondary p-3 text-center">
              <p className="font-display text-4xl text-primary">{result.score.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">จาก 100 คะแนน · ถูก {result.correct}/{result.total} ข้อ</p>
            </div>
          )}
          {!submitted && answeredCount > 0 && (
            <Button className="mt-4 w-full bg-success text-success-foreground hover:bg-success/90" onClick={() => setSubmitted(true)}>
              ส่งคำตอบ
            </Button>
          )}
          {submitted && (
            <Button variant="outline" className="mt-4 w-full" onClick={() => { setAnswers({}); setSubmitted(false); setIdx(0); }}>
              <RotateCcw /> ทำใหม่อีกครั้ง
            </Button>
          )}
        </div>
        <Link to="/" className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← กลับหน้าเลือกชุดข้อสอบ
        </Link>
      </aside>
    </div>
  );
}

function isAnswered(q: Question, v: unknown) {
  if (v === undefined || v === "") return false;
  if (q.type === "truefalse") return Object.keys(v as object).length === q.items.length;
  return true;
}

function Verdict({ ok }: { ok: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold",
      ok ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground")}>
      {ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {ok ? "ถูกต้อง" : "ยังไม่ถูก"}
    </span>
  );
}

function McqInput({ q, value, onChange, submitted }: { q: Extract<Question, { type: "mcq" }>; value: number | undefined; onChange: (v: number) => void; submitted: boolean }) {
  const shapes = q.choices.some((c) => c.shape);
  return (
    <div className={cn("grid gap-3", shapes ? "grid-cols-2" : "sm:grid-cols-2")}>
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
              "group flex items-center gap-3 rounded-xl border-2 p-3 text-left text-base transition",
              chosen ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary",
              right && "border-success bg-success/10",
              wrong && "border-destructive bg-destructive/10",
            )}
          >
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold",
              chosen ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
              right && "border-success bg-success text-success-foreground")}>
              {n}
            </span>
            {c.shape ? <ShapeChoice shape={c.shape} /> : <span><Rich text={c.text ?? ""} /></span>}
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
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
      <div className="text-center">
        <div className={cn("flex min-w-48 items-center justify-center gap-2 rounded-xl border-2 bg-background px-5 py-3 font-display text-4xl tabular-nums",
          submitted ? (Number(value) === q.answer && value !== "" ? "border-success" : "border-destructive") : "border-primary")}>
          <span>{value || <span className="text-muted-foreground/40">?</span>}</span>
          {q.unit && <span className="text-base text-muted-foreground">{q.unit}</span>}
        </div>
        {submitted && <p className="mt-2 text-sm">คำตอบที่ถูก: <b>{q.answer}</b> {q.unit}</p>}
      </div>
      {!submitted && (
        <div className="grid grid-cols-3 gap-2">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "del"].map((k) => (
            <button key={k} onClick={() => press(k)} aria-label={k === "del" ? "ลบ" : k}
              className="flex h-12 w-14 items-center justify-center rounded-lg border border-border bg-secondary text-xl font-semibold transition hover:bg-accent active:scale-95">
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
    <div className="space-y-2">
      {q.items.map((it) => {
        const v = value[it.label];
        return (
          <div key={it.label} className={cn("flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center",
            submitted && (v === it.answer ? "border-success bg-success/10" : "border-destructive bg-destructive/10"))}>
            <span className="font-bold text-primary">{it.label}</span>
            <span className="flex-1">{it.text}</span>
            <div className="flex gap-2">
              {[true, false].map((b) => (
                <button key={String(b)} disabled={submitted} onClick={() => onChange({ ...value, [it.label]: b })}
                  className={cn("rounded-lg border-2 px-4 py-1.5 font-semibold transition",
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

function Solution({ q, forceOpen }: { q: Question; forceOpen: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => setShown(forceOpen ? q.steps.length : 0), [q.id, forceOpen, q.steps.length]);
  return (
    <div className="mt-6 border-t border-dashed border-border pt-4">
      {shown === 0 ? (
        <Button variant="ghost" onClick={() => setShown(1)} className="text-primary">
          <Lightbulb /> ดูวิธีทำทีละขั้น
        </Button>
      ) : (
        <div className="rounded-xl bg-highlight/20 p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4" /> วิธีทำ</p>
          <ol className="space-y-2">
            {q.steps.slice(0, shown).map((s, i) => (
              <li key={i} className="animate-in fade-in slide-in-from-left-1 flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs text-background">{i + 1}</span>
                <span><Rich text={s} /></span>
              </li>
            ))}
          </ol>
          {shown < q.steps.length && (
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setShown(shown + 1)}>
              ขั้นถัดไป ({shown}/{q.steps.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
