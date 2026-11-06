import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, CheckCircle2, ListChecks, Trophy, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { SUBJECT_NAMES } from "@/data/catalog";
import { strandsFor } from "@/data/strands";
import { baseTopic } from "@/data/analysis";
import { loadAttempts, levelOf, type Attempt } from "@/lib/progress";
import { cn } from "@/lib/utils";

const LEVEL_NAMES = { p6: "ป.6", m3: "ม.3" } as const;
const KIND = { diagnostic: "วัดความรู้พื้นฐาน", practice: "ฝึกทำ", retest: "ทดสอบหลังเรียน", full: "ข้อสอบเต็มชุด", drill: "ข้อสอบย่อย", pre1: "PRE O-NET ครั้งที่ 1", pre2: "PRE O-NET ครั้งที่ 2" } as const;

export const Route = createFileRoute("/result/$id")({
  head: () => {
    const title = "สรุปผลการทำข้อสอบ · PRE O-NET";
    const description = "สรุปคะแนนละเอียด แยกตามสาระและเรื่อง พร้อมคำแนะนำเรื่องที่ควรเรียนต่อ";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: ResultPage,
});

/** Diagnostic/practice topics are stored as "สาระ · เรื่อง (ปี 2567)" — keep only the topic part. */
const cleanTopic = (t: string) => t.split(" · ").pop()!.replace(/\s*\(ปี \d+\)$/, "");
const tone = (pct: number) => (pct < 50 ? "bg-destructive" : pct < 75 ? "bg-accent" : "bg-primary");

function ResultPage() {
  const { id } = Route.useParams();
  const [a, setA] = useState<Attempt | null | undefined>(undefined);
  useEffect(() => { setA(loadAttempts().find((x) => x.id === id) ?? null); }, [id]);

  const stats = useMemo(() => {
    if (!a) return null;
    const ok = a.items.filter((i) => i.correct);
    const pts = ok.reduce((s, i) => s + i.points, 0);
    const max = a.items.reduce((s, i) => s + i.points, 0);
    const strands = new Map<string, { ok: number; n: number; pts: number; max: number; topics: Map<string, { ok: number; n: number }> }>();
    for (const it of a.items) {
      const s = strands.get(it.strand) ?? { ok: 0, n: 0, pts: 0, max: 0, topics: new Map() };
      s.n++; s.max += it.points; if (it.correct) { s.ok++; s.pts += it.points; }
      const tk = baseTopic(cleanTopic(it.topic));
      const t = s.topics.get(tk) ?? { ok: 0, n: 0 }; t.n++; if (it.correct) t.ok++; s.topics.set(tk, t);
      strands.set(it.strand, s);
    }
    const list = [...strands].map(([name, v]) => ({ name, ...v, pct: Math.round((v.ok / v.n) * 100) })).sort((x, y) => x.pct - y.pct);
    return { ok: ok.length, n: a.items.length, pts, max, pct: max ? Math.round((pts / max) * 100) : 0, strands: list };
  }, [a]);

  if (a === undefined) return <PageShell title="สรุปผล"><div className="flex flex-1 items-center justify-center text-muted-foreground">กำลังโหลด...</div></PageShell>;
  if (!a || !stats) return (
    <PageShell title="สรุปผล">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p>ไม่พบผลการทำข้อสอบนี้ในเครื่องนี้</p>
        <Button asChild><Link to="/">กลับหน้าแรก</Link></Button>
      </div>
    </PageShell>
  );

  const name = `${SUBJECT_NAMES[a.subject]} ${LEVEL_NAMES[a.level]}`;
  const weak = stats.strands.filter((s) => s.pct < 75);
  const mins = a.ms ? `${Math.floor(a.ms / 60000)} นาที ${Math.round((a.ms % 60000) / 1000)} วินาที` : null;

  return (
    <PageShell title="สรุปผล" sub={name} subject={a.subject}>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-4 px-3 py-4 sm:px-4 sm:py-6">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <p className="text-sm text-muted-foreground">{KIND[a.kind]} · {new Date(a.at).toLocaleString("th-TH")}</p>
            <h1 className="font-display text-2xl sm:text-3xl">{a.label}</h1>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={<Trophy className="h-5 w-5" />} label="คะแนน" value={`${+stats.pts.toFixed(2)} / ${+stats.max.toFixed(2)}`} />
              <Stat icon={<CheckCircle2 className="h-5 w-5" />} label="ตอบถูก" value={`${stats.ok} / ${stats.n} ข้อ`} />
              <Stat icon={<BarChart3 className="h-5 w-5" />} label="ร้อยละ" value={`${stats.pct}% (${levelOf(stats.pct)})`} />
              <Stat icon={<Clock className="h-5 w-5" />} label="เวลาที่ใช้" value={mins ?? "–"} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="font-display text-xl">ผลแยกตามสาระ</h2>
            <p className="text-sm text-muted-foreground">เรียงจากสาระที่ต้องปรับปรุงมากที่สุด แตะชื่อสาระเพื่อไปเรียน</p>
            <div className="mt-3 space-y-4">
              {stats.strands.map((s) => (
                <div key={s.name} className="rounded-xl bg-secondary/50 p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link to="/learn/$level/$subject/$strand" params={{ level: a.level, subject: a.subject, strand: String(Math.max(0, strandsFor(a.subject).indexOf(s.name))) }}
                      className="font-semibold underline-offset-2 hover:underline">{s.name} <BookOpen className="inline h-4 w-4" /></Link>
                    <span className="text-sm">ถูก {s.ok}/{s.n} · {+s.pts.toFixed(2)}/{+s.max.toFixed(2)} คะแนน · <b>{s.pct}%</b> ({levelOf(s.pct)})</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-background"><div className={cn("h-2 rounded-full", tone(s.pct))} style={{ width: `${Math.max(s.pct, 2)}%` }} /></div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[...s.topics].map(([t, v]) => (
                      <span key={t} className={cn("rounded-full px-2.5 py-0.5 text-xs", v.ok === v.n ? "bg-primary/15" : "bg-destructive/15")}>
                        {v.ok === v.n ? "✓" : "✗"} {t} {v.ok}/{v.n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="font-display text-xl">คำแนะนำ</h2>
            {weak.length ? (
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                {weak.map((s) => <li key={s.name}>เรียน <b>{s.name}</b> ({s.pct}%) แล้วกด "ทดสอบหลังเรียน" — เรื่องที่ยังพลาด: {[...s.topics].filter(([, v]) => v.ok < v.n).map(([t]) => t).join(", ") || "–"}</li>)}
              </ol>
            ) : <p className="mt-2">เยี่ยมมาก ทุกสาระอยู่ในระดับดี ลองทำข้อสอบเต็มชุดเพื่อฝึกเวลา</p>}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="font-display text-xl">ผลรายข้อ</h2>
            <ul className="mt-2 divide-y divide-border">
              {a.items.map((it, i) => (
                <li key={it.qid} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-8 font-display text-base">{it.no ?? i + 1}</span>
                  {it.correct ? <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /> : <XCircle className="h-5 w-5 shrink-0 text-destructive" />}
                  <span className="min-w-0 flex-1">{cleanTopic(it.topic)} <span className="text-muted-foreground">· {it.strand}</span></span>
                  <span className="shrink-0 text-muted-foreground">{it.correct ? `+${+it.points.toFixed(2)}` : `0/${+it.points.toFixed(2)}`}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-3 pb-4 sm:grid-cols-2">
            {a.back && <Button size="lg" variant="outline" asChild><a href={a.back}><ListChecks /> ดูเฉลยและวิธีทำรายข้อ</a></Button>}
            <Button size="lg" asChild><Link to="/dashboard" search={{ level: a.level, subject: a.subject }}><BarChart3 /> แดชบอร์ดของฉัน</Link></Button>
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</p>
      <p className="mt-1 font-display text-lg leading-tight">{value}</p>
    </div>
  );
}
