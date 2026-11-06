import { Clock, ListChecks, Target, Timer, Play, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Exam, Question } from "@/data/exams";
import { strandOf } from "@/data/strands";

const TYPE_LABEL: Record<Question["type"], string> = {
  mcq: "ปรนัย เลือก 1 คำตอบ",
  multi: "เลือกหลายคำตอบ",
  truefalse: "ถูก / ผิด หลายข้อย่อย",
  numeric: "เติมคำตอบเป็นตัวเลข",
  order: "เรียงลำดับ",
  essay: "เขียนตอบ (ครูตรวจ)",
};

const r = (n: number) => Math.round(n * 100) / 100;

export function analyzeExam(exam: Exam) {
  const qs = exam.questions;
  const total = r(qs.reduce((s, q) => s + q.points, 0));
  const topics = new Map<string, { nos: number[]; points: number }>();
  for (const q of qs) {
    const t = topics.get(q.topic) ?? { nos: [], points: 0 };
    t.nos.push(q.no);
    t.points += q.points;
    topics.set(q.topic, t);
  }
  const types = new Map<string, { nos: number[]; points: number; each: Set<number> }>();
  for (const q of qs) {
    const t = types.get(q.type) ?? { nos: [], points: 0, each: new Set<number>() };
    t.nos.push(q.no);
    t.points += q.points;
    t.each.add(q.points);
    types.set(q.type, t);
  }
  const strands = new Map<string, { nos: number[]; points: number; subs: Map<string, number[]> }>();
  for (const q of qs) {
    const n = strandOf(exam.subject, q.topic);
    const t = strands.get(n) ?? { nos: [], points: 0, subs: new Map<string, number[]>() };
    t.nos.push(q.no);
    t.points += q.points;
    t.subs.set(q.topic, [...(t.subs.get(q.topic) ?? []), q.no]);
    strands.set(n, t);
  }
  return {
    total,
    strands: [...strands.entries()]
      .map(([name, v]) => ({ name, nos: v.nos, points: r(v.points), subs: [...v.subs.entries()] }))
      .sort((a, b) => b.points - a.points),
    secPerQ: (exam.minutes * 60) / qs.length,
    secPerPoint: (exam.minutes * 60) / (total || 1),
    topics: [...topics.entries()].map(([name, v]) => ({ name, ...v, points: r(v.points) })).sort((a, b) => b.points - a.points),
    types: [...types.entries()].map(([type, v]) => ({ type: type as Question["type"], nos: v.nos, points: r(v.points), each: [...v.each] })),
  };
}

export const fmtDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m} นาที${s ? ` ${s} วินาที` : ""}` : `${s} วินาที`;
};

const ranges = (nos: number[]) => {
  const out: string[] = [];
  for (let i = 0; i < nos.length; i++) {
    let j = i;
    while (j + 1 < nos.length && nos[j + 1] === nos[j]! + 1) j++;
    out.push(j > i ? `${nos[i]}–${nos[j]}` : `${nos[i]}`);
    i = j;
  }
  return out.join(", ");
};

export function ExamIntro({ exam, onStart, resumable, resumeMock }: { exam: Exam; onStart: (mock: boolean) => void; resumable: boolean; resumeMock?: boolean }) {
  const a = analyzeExam(exam);
  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-4 px-3 py-4 sm:px-4 sm:py-6">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
          <p className="text-sm text-muted-foreground">{exam.code} · {exam.examDate}</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl">{exam.title} · ปีการศึกษา {exam.year}</h1>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={ListChecks} label="จำนวนข้อ" value={`${exam.questions.length} ข้อ`} />
            <Stat icon={Target} label="คะแนนเต็ม" value={`${a.total} คะแนน`} />
            <Stat icon={Clock} label="เวลาสอบ" value={`${exam.minutes} นาที`} />
            <Stat icon={Timer} label="เฉลี่ยต่อข้อ" value={fmtDuration(a.secPerQ)} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            เฉลี่ยคะแนนละ {fmtDuration(a.secPerPoint)} — ข้อที่คะแนนสูงควรให้เวลามากกว่า
          </p>
          {resumable ? (
            <Button size="lg" className="mt-4 w-full sm:w-auto" onClick={() => onStart(resumeMock ?? false)}>
              <Play /> ทำต่อ (เวลาเดินต่อ){resumeMock ? " · โหมดสอบจริง" : ""}
            </Button>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button size="lg" variant="outline" className="h-auto flex-col items-start py-3 text-left" onClick={() => onStart(false)}>
                <span className="flex items-center gap-2"><Play /> ฝึกทำ</span>
                <span className="whitespace-normal text-xs font-normal text-muted-foreground">มีคำใบ้ระหว่างทำ จับเวลาไว้ดูเฉย ๆ</span>
              </Button>
              <Button size="lg" className="h-auto flex-col items-start py-3 text-left" onClick={() => onStart(true)}>
                <span className="flex items-center gap-2"><Timer /> สอบจริงจับเวลา {exam.minutes} นาที</span>
                <span className="whitespace-normal text-xs font-normal opacity-90">ไม่มีคำใบ้ ไม่เฉลยระหว่างทำ หมดเวลาส่งอัตโนมัติ</span>
              </Button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
          <h2 className="font-display text-xl">รูปแบบข้อสอบและคะแนน</h2>
          <div className="mt-3 divide-y divide-border">
            {a.types.map((t) => (
              <div key={t.type} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                <div>
                  <p className="font-semibold">{TYPE_LABEL[t.type]}</p>
                  <p className="text-sm text-muted-foreground">ข้อ {ranges(t.nos)} · {t.nos.length} ข้อ · ข้อละ {t.each.join(" / ")} คะแนน</p>
                </div>
                <p className="text-sm font-semibold">
                  {t.points} คะแนน · ควรใช้ราว {fmtDuration(t.points * a.secPerPoint)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
          <h2 className="font-display text-xl">เนื้อหาที่ออกสอบ</h2>
          <p className="text-sm text-muted-foreground">แยกตามสาระการเรียนรู้ เรียงตามน้ำหนักคะแนน พร้อมเรื่องย่อยและเลขข้อ</p>
          <div className="mt-3 space-y-3">
            {a.strands.map((t) => {
              const pct = (t.points / (a.total || 1)) * 100;
              return (
                <div key={t.name} className="rounded-xl border border-border p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 font-semibold">{t.name}</p>
                    <p className="shrink-0 text-sm text-muted-foreground">{t.nos.length} ข้อ · {t.points} คะแนน · {Math.round(pct)}%</p>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.subs.map(([sub, nos]) => (
                      <span key={sub} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                        {sub} <span className="text-muted-foreground">· ข้อ {ranges(nos)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl"><PenLine className="h-5 w-5" /> รายข้อ</h2>
          <div className="mt-3 grid gap-x-6 sm:grid-cols-2">
            {exam.questions.map((q) => (
              <div key={q.id} className="flex items-baseline gap-2 border-b border-border py-1.5 text-sm">
                <span className="w-7 shrink-0 font-display text-primary">{q.no}</span>
                <span className="min-w-0 flex-1">{q.topic}</span>
                <span className="shrink-0 text-muted-foreground">{q.points}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: I, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><I className="h-3.5 w-3.5" /> {label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
