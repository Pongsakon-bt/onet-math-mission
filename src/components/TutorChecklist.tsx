import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { analyzeSubject, baseTopic } from "@/data/analysis";
import { loadAttempts, levelOf, type Attempt } from "@/lib/progress";
import { cn } from "@/lib/utils";

/** Every topic that has appeared in the subject's past exams = the full tutoring syllabus.
 *  Each topic is rated from the PRE O-NET round 1 result (ดี / พอใช้ / ต้องติว / ยังไม่ได้วัด). */
export function TutorChecklist({ level, subject, attempts }: { level: Level; subject: Subject; attempts?: Attempt[] }) {
  const a = useMemo(() => analyzeSubject(level, subject), [level, subject]);
  const [local, setLocal] = useState<Attempt[]>([]);
  useEffect(() => { if (!attempts) setLocal(loadAttempts()); }, [attempts]);
  const list = attempts ?? local;
  const pre1 = list.find((x) => x.kind === "pre1" && x.level === level && x.subject === subject);

  const score = useMemo(() => {
    const m = new Map<string, { ok: number; n: number }>();
    for (const it of pre1?.items ?? []) {
      const k = baseTopic(it.topic);
      const v = m.get(k) ?? { ok: 0, n: 0 };
      v.n++; if (it.correct) v.ok++;
      m.set(k, v);
    }
    return m;
  }, [pre1]);

  const rated = a.topics.map((t) => {
    const s = score.get(t.topic);
    return { ...t, pct: s ? Math.round((s.ok / s.n) * 100) : undefined, n: s?.n ?? 0 };
  });
  const counts = {
    good: rated.filter((t) => t.pct !== undefined && t.pct >= 75).length,
    fair: rated.filter((t) => t.pct !== undefined && t.pct >= 50 && t.pct < 75).length,
    weak: rated.filter((t) => t.pct !== undefined && t.pct < 50).length,
    none: rated.filter((t) => t.pct === undefined).length,
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
      <h2 className="font-display text-xl">เรื่องที่ต้องติวทั้งหมด ({rated.length} เรื่อง)</h2>
      <p className="text-sm text-muted-foreground">
        ทุกเรื่องที่เคยออกสอบ {a.nYears} ปี ({a.years.join(", ")}) ต้องเรียนให้ครบทุกเรื่อง · ระดับแต่ละเรื่องวัดจาก PRE O-NET ครั้งที่ 1
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <Badge cls="bg-primary text-primary-foreground">ดี {counts.good}</Badge>
        <Badge cls="bg-highlight">พอใช้ {counts.fair}</Badge>
        <Badge cls="bg-destructive text-destructive-foreground">ต้องติว {counts.weak}</Badge>
        <Badge cls="bg-secondary">ยังไม่ได้วัด {counts.none}</Badge>
      </div>
      {!pre1 && <p className="mt-2 text-sm text-muted-foreground">ยังไม่ได้ทำ PRE O-NET ครั้งที่ 1 ทำแล้วจะเห็นระดับของแต่ละเรื่อง</p>}

      <div className="mt-4 space-y-5">
        {a.strands.map((s) => {
          const ts = rated.filter((t) => t.strand === s.name)
            .sort((x, y) => (x.pct ?? 101) - (y.pct ?? 101) || y.years.length - x.years.length);
          if (!ts.length) return null;
          return (
            <div key={s.name}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-1">
                <h3 className="font-semibold">{s.name} <span className="text-sm font-normal text-muted-foreground">· {ts.length} เรื่อง</span></h3>
                <Link to="/learn/$level/$subject/$strand" params={{ level, subject, strand: String(s.index) }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline">
                  <BookOpen className="h-4 w-4" /> เรียนรู้สาระนี้
                </Link>
              </div>
              <ol className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {ts.map((t) => (
                  <li key={t.topic} className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{t.topic}</p>
                      <p className="text-xs text-muted-foreground">ออก {t.years.length}/{a.nYears} ปี · รวม {t.count} ข้อ{t.n ? ` · ครั้งที่ 1 ทำ ${t.n} ข้อ` : ""}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      t.pct === undefined ? "bg-card text-muted-foreground" : t.pct < 50 ? "bg-destructive text-destructive-foreground" : t.pct < 75 ? "bg-highlight" : "bg-primary text-primary-foreground")}>
                      {t.pct === undefined ? "ยังไม่ได้วัด" : `${t.pct}% · ${t.pct < 50 ? "ต้องติว" : levelOf(t.pct)}`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full px-3 py-0.5 font-semibold", cls)}>{children}</span>;
}
