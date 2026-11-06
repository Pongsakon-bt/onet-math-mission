import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ClipboardCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PageShell } from "@/components/PageShell";
import { LevelOverview } from "@/components/LevelOverview";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { strandsFor } from "@/data/strands";
import { loadAttempts, loadStudied, strandScores, levelOf, type Attempt } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { syncMyAttempts } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";

const LEVELS: Level[] = ["p6", "m3"];
const LEVEL_NAMES: Record<Level, string> = { p6: "ป.6", m3: "ม.3" };
const SUBJECTS: Subject[] = ["math", "thai", "eng", "sci"];
const KIND: Record<Attempt["kind"], string> = { diagnostic: "วัดพื้นฐาน", retest: "สอบซ้ำ", practice: "ฝึก", full: "ข้อสอบเต็มชุด", drill: "ข้อสอบย่อย", pre1: "PRE O-NET ครั้งที่ 1", pre2: "PRE O-NET ครั้งที่ 2" };

export const Route = createFileRoute("/dashboard")({
  validateSearch: (s: Record<string, unknown>) => ({
    level: (LEVELS.includes(s['level'] as Level) ? s['level'] : "p6") as Level,
    subject: (SUBJECTS.includes(s['subject'] as Subject) ? s['subject'] : "math") as Subject,
  }),
  head: () => ({
    meta: [
      { title: "แดชบอร์ดของฉัน · PRE O-NET" },
      { name: "description", content: "ดูความรู้พื้นฐานแต่ละสาระ พัฒนาการ และเรื่องที่ควรเรียนต่อ" },
      { property: "og:title", content: "แดชบอร์ดของฉัน · PRE O-NET" },
      { property: "og:description", content: "วิเคราะห์ความรู้รายสาระและพัฒนาการของนักเรียน" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { level, subject } = Route.useSearch();
  const [all, setAll] = useState<Attempt[] | null>(null);
  const [studied, setStudied] = useState<string[]>([]);
  const [synced, setSynced] = useState(false);
  const [essays, setEssays] = useState<{ attempt_id: string; qid: string; no: string; prompt: string; max_points: number; score: number | null; comment: string | null }[]>([]);
  useEffect(() => {
    setAll(loadAttempts()); setStudied(loadStudied());
    // Signed in: show results from every device, plus teacher-graded writing.
    void syncMyAttempts().then((l) => { if (l) { setAll(l); setSynced(true); } });
    void supabase.from("essay_answers").select("attempt_id, qid, no, prompt, max_points, score, comment").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setEssays(data ?? []));
  }, []);

  const strands = strandsFor(subject);
  const mine = useMemo(() => (all ?? []).filter((a) => a.level === level && a.subject === subject).sort((a, b) => a.at - b.at), [all, level, subject]);
  const tests = mine.filter((a) => a.kind !== "practice");
  const first = tests[0];

  // Latest known score per strand: most recent test that covered it.
  const latest = new Map<string, number>();
  const firstMap = first ? strandScores(first.items) : new Map();
  for (const a of tests) for (const [n, v] of strandScores(a.items)) latest.set(n, v.pct);

  const barData = strands.map((n) => ({ strand: n, first: firstMap.get(n)?.pct ?? 0, latest: latest.get(n) ?? 0 }));
  const lineData = tests.map((a, i) => {
    const ok = a.items.filter((x) => x.correct).length;
    return { n: `ครั้งที่ ${i + 1}`, pct: Math.round((ok / (a.items.length || 1)) * 100) };
  });
  const practice = new Map<string, { n: number; ok: number }>();
  for (const a of mine.filter((x) => x.kind === "practice")) for (const it of a.items) {
    const v = practice.get(it.strand) ?? { n: 0, ok: 0 };
    v.n++; if (it.correct) v.ok++;
    practice.set(it.strand, v);
  }
  const todo = strands.map((n, i) => ({ n, i, pct: latest.get(n) })).sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1));

  return (
    <PageShell title="แดชบอร์ดของฉัน" sub={synced ? "ผลจากบัญชีของคุณ (ทุกเครื่อง)" : "ผลเก็บไว้ในเครื่องนี้"}>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-4">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <Link key={l} to="/dashboard" search={{ level: l, subject }} className={cn("rounded-full border px-5 py-2 font-display text-lg", l === level ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{LEVEL_NAMES[l]}</Link>
            ))}
          </div>
          {all && <LevelOverview level={level} all={all} />}
          <h2 className="pt-2 font-display text-xl">รายละเอียดรายวิชา</h2>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <Link key={s} to="/dashboard" search={{ level, subject: s }} className={cn("rounded-full border px-3 py-1 text-sm", s === subject ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{SUBJECT_NAMES[s]}</Link>
            ))}
          </div>

          {all !== null && !tests.length ? (
            <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-paper">
              <p className="font-display text-xl">ยังไม่ได้วัดความรู้พื้นฐาน {SUBJECT_NAMES[subject]} {LEVEL_NAMES[level]}</p>
              <p className="mt-1 text-muted-foreground">ทำแบบวัดสั้น ๆ เพื่อดูว่าแต่ละสาระรู้แค่ไหน</p>
              <Button className="mt-4" asChild><Link to="/diagnostic/$level/$subject" params={{ level, subject }} search={{ strand: undefined }}><ClipboardCheck /> เริ่มวัดความรู้พื้นฐาน</Link></Button>
            </section>
          ) : (
            <>
              <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-xl">ความรู้แต่ละสาระ</h2>
                  <Button size="sm" variant="outline" asChild><Link to="/diagnostic/$level/$subject" params={{ level, subject }} search={{ strand: undefined }}><ClipboardCheck /> วัดพื้นฐานรอบใหม่</Link></Button>
                </div>
                <p className="text-sm text-muted-foreground">ครั้งแรก เทียบกับ ผลล่าสุด (ร้อยละที่ตอบถูก)</p>
                <ChartContainer className="mt-3 h-64 w-full" config={{ first: { label: "ครั้งแรก", color: "var(--muted-foreground)" }, latest: { label: "ล่าสุด", color: "var(--primary)" } }}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="strand" width={150} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="first" fill="var(--color-first)" radius={4} />
                    <Bar dataKey="latest" fill="var(--color-latest)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </section>

              {lineData.length > 1 && (
                <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
                  <h2 className="font-display text-xl">พัฒนาการ</h2>
                  <ChartContainer className="mt-3 h-48 w-full" config={{ pct: { label: "ตอบถูก %", color: "var(--primary)" } }}>
                    <LineChart data={lineData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="n" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} width={30} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line dataKey="pct" stroke="var(--color-pct)" strokeWidth={3} dot />
                    </LineChart>
                  </ChartContainer>
                </section>
              )}

              <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
                <h2 className="font-display text-xl">เรื่องที่ควรเรียนต่อ</h2>
                <p className="text-sm text-muted-foreground">เรียงจากเรื่องที่อ่อนที่สุด</p>
                <div className="mt-3 divide-y divide-border">
                  {todo.map((t) => {
                    const p = practice.get(t.n);
                    const done = studied.includes(`${level}-${subject}-${t.n}`);
                    return (
                      <div key={t.n} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{t.n}</p>
                          <p className="text-xs text-muted-foreground">
                            {done ? "เรียนแล้ว" : "ยังไม่ได้เรียน"} · ฝึกแล้ว {p?.n ?? 0} ข้อ{p ? ` · ถูก ${Math.round((p.ok / p.n) * 100)}%` : ""}
                          </p>
                        </div>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-semibold", t.pct === undefined ? "bg-secondary" : t.pct < 50 ? "bg-destructive text-destructive-foreground" : t.pct < 75 ? "bg-highlight" : "bg-primary text-primary-foreground")}>
                          {t.pct === undefined ? "ยังไม่วัด" : `${t.pct}% · ${levelOf(t.pct)}`}
                        </span>
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/learn/$level/$subject/$strand" params={{ level, subject, strand: String(t.i) }}><BookOpen /> เรียนรู้</Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
                <h2 className="font-display text-xl">ประวัติการทำ</h2>
                <div className="mt-2 divide-y divide-border text-sm">
                  {[...mine].reverse().map((a) => {
                    const ok = a.items.filter((x) => x.correct).length;
                    return (
                      <div key={a.id} className="flex items-center gap-3 py-2">
                        <span className="w-24 shrink-0 rounded-full bg-secondary px-2 py-0.5 text-center text-xs">{KIND[a.kind]}</span>
                        <span className="min-w-0 flex-1 truncate">{a.label}</span>
                        <span className="shrink-0 font-semibold">{ok}/{a.items.length}</span>
                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{new Date(a.at).toLocaleDateString("th-TH")}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {essays.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
              <h2 className="font-display text-xl">ข้อเขียนที่ส่งให้ครูตรวจ</h2>
              <div className="mt-2 divide-y divide-border text-sm">
                {essays.map((e) => (
                  <div key={e.attempt_id + e.qid} className="py-2">
                    <div className="flex items-center gap-3">
                      <span className="min-w-0 flex-1 truncate">ข้อ {e.no} · {e.prompt}</span>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", e.score === null ? "bg-secondary" : "bg-primary text-primary-foreground")}>
                        {e.score === null ? "รอครูตรวจ" : `${e.score}/${e.max_points} คะแนน`}
                      </span>
                    </div>
                    {e.comment && <p className="mt-1 text-muted-foreground">ครู: {e.comment}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </PageShell>
  );
}
