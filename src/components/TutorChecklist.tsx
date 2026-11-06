import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, PencilLine } from "lucide-react";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { analyzeSubject, baseTopic } from "@/data/analysis";
import { loadAttempts, levelOf, type Attempt } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { syncMyAttempts } from "@/lib/session";

/** Every topic that has appeared in the subject's past exams = the full tutoring syllabus.
 *  Each topic is rated from the PRE O-NET round 1 result (ดี / พอใช้ / ต้องติว / ยังไม่ได้วัด). */
export function TutorChecklist({ level, subject, attempts }: { level: Level; subject: Subject; attempts?: Attempt[] }) {
  const a = useMemo(() => analyzeSubject(level, subject), [level, subject]);
  const [local, setLocal] = useState<Attempt[]>([]);
  useEffect(() => {
    if (attempts) return;
    setLocal(loadAttempts());
    syncMyAttempts().then((r) => { if (r) setLocal(r); }).catch(() => {});
  }, [attempts]);
  const list = attempts ?? local;
  const [open, setOpen] = useState<string | null>(null);
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

      <div className="mt-4 space-y-2">
        {a.strands.map((s) => {
          const ts = rated.filter((t) => t.strand === s.name)
            .sort((x, y) => (x.pct ?? 101) - (y.pct ?? 101) || y.years.length - x.years.length);
          if (!ts.length) return null;
          const m = ts.filter((t) => t.pct !== undefined);
          const ok = m.reduce((n, t) => n + ((t.pct ?? 0) * t.n) / 100, 0), tot = m.reduce((n, t) => n + t.n, 0);
          const pct = tot ? Math.round((ok / tot) * 100) : undefined;
          const isOpen = open === s.name;
          return (
            <div key={s.name} className="overflow-hidden rounded-xl border border-border">
              <button type="button" onClick={() => setOpen(isOpen ? null : s.name)} aria-expanded={isOpen}
                className="flex w-full items-center gap-3 bg-secondary/60 px-3 py-3 text-left transition hover:bg-secondary">
                <ChevronRight className={cn("h-5 w-5 shrink-0 text-primary transition-transform", isOpen && "rotate-90")} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ts.length} เรื่อง · ต้องติว {ts.filter((t) => t.pct !== undefined && t.pct < 50).length} · ยังไม่ได้วัด {ts.filter((t) => t.pct === undefined).length}
                  </p>
                </div>
                <Pill pct={pct} />
              </button>
              {isOpen && (
                <div className="space-y-2 p-3">
                  <Link to="/learn/$level/$subject/$strand" params={{ level, subject, strand: String(s.index) }}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline">
                    <BookOpen className="h-4 w-4" /> เรียนรู้สาระนี้
                  </Link>
                  <ol className="grid gap-1.5 sm:grid-cols-2">
                    {ts.map((t) => (
                      <li key={t.topic} className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{t.topic}</p>
                          <p className="text-xs text-muted-foreground">ออก {t.years.length}/{a.nYears} ปี · รวม {t.count} ข้อ{t.n ? ` · ครั้งที่ 1 ทำ ${t.n} ข้อ` : ""}</p>
                          <Link to="/drill/$level/$subject/$topic" params={{ level, subject, topic: String(a.topics.indexOf(a.topics.find((x) => x.topic === t.topic)!)) }}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline">
                            <PencilLine className="h-3.5 w-3.5" /> ทำข้อสอบเรื่องนี้ (20 ข้อ)
                          </Link>
                        </div>
                        <Pill pct={t.pct} small />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Pill({ pct, small }: { pct: number | undefined; small?: boolean }) {
  return (
    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 font-semibold", small ? "text-xs" : "text-sm",
      pct === undefined ? "bg-card text-muted-foreground" : pct < 50 ? "bg-destructive text-destructive-foreground" : pct < 75 ? "bg-highlight" : "bg-primary text-primary-foreground")}>
      {pct === undefined ? "ยังไม่ได้วัด" : `${pct}% · ${pct < 50 ? "ต้องติว" : levelOf(pct)}`}
    </span>
  );
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full px-3 py-0.5 font-semibold", cls)}>{children}</span>;
}
