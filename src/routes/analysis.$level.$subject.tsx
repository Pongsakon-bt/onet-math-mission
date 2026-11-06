import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ClipboardCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { analyzeSubject } from "@/data/analysis";
import { cn } from "@/lib/utils";

const LEVEL_NAMES: Record<Level, string> = { p6: "ป.6", m3: "ม.3" };
const SAME = {
  same: { label: "เรื่องเดิมทุกปี", cls: "bg-primary/15" },
  similar: { label: "สาระเดียวกัน", cls: "bg-secondary" },
  diff: { label: "เปลี่ยนทุกปี", cls: "bg-card" },
};

export const Route = createFileRoute("/analysis/$level/$subject")({
  loader: ({ params }) => {
    if (!(params.level in LEVEL_NAMES) || !(params.subject in SUBJECT_NAMES)) throw notFound();
    return { level: params.level as Level, subject: params.subject as Subject };
  },
  head: ({ loaderData }) => {
    const n = loaderData ? `${SUBJECT_NAMES[loaderData.subject]} ${LEVEL_NAMES[loaderData.level]}` : "";
    const title = `วิเคราะห์ข้อสอบ O-NET ${n} ย้อนหลัง · PRE O-NET`;
    const description = `แต่ละข้อออกเรื่องอะไรในแต่ละปี เรื่องไหนออกบ่อยที่สุด และควรติวเรื่องอะไร ${n}`;
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: AnalysisPage,
});

function AnalysisPage() {
  const { level, subject } = Route.useLoaderData();
  const a = useMemo(() => analyzeSubject(level, subject), [level, subject]);
  const name = `${SUBJECT_NAMES[subject]} ${LEVEL_NAMES[level]}`;
  const top = a.topics.filter((t) => t.years.length >= Math.min(3, a.nYears)).slice(0, 12);

  return (
    <PageShell subject={subject} title="วิเคราะห์ข้อสอบ" sub={name}>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-4 sm:py-6">
          <h1 className="font-display text-2xl sm:text-3xl">{name} · {a.nYears} ปี ({a.years.join(", ")})</h1>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="font-display text-xl">เรื่องที่ควรติว</h2>
            <p className="text-sm text-muted-foreground">ออกสอบอย่างน้อย {Math.min(3, a.nYears)} จาก {a.nYears} ปี เรียงจากออกบ่อยและคะแนนมาก</p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {top.map((t, i) => (
                <li key={t.topic} className="flex items-start gap-2 rounded-xl bg-secondary/60 p-2.5">
                  <span className="font-display text-lg text-primary">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{t.topic}</p>
                    <p className="text-xs text-muted-foreground">ออก {t.years.length}/{a.nYears} ปี · รวม {t.count} ข้อ · เฉลี่ย {(t.points / a.nYears).toFixed(1)} คะแนน/ปี · {t.strand}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button size="lg" asChild><Link to="/diagnostic/$level/$subject" params={{ level, subject }} search={{ strand: undefined }}><ClipboardCheck /> วัดความรู้พื้นฐานจากเรื่องที่ออกบ่อย</Link></Button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="font-display text-xl">น้ำหนักแต่ละสาระ (เฉลี่ยต่อปี)</h2>
            <div className="mt-3 space-y-3">
              {a.strands.map((s) => (
                <div key={s.name}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link to="/learn/$level/$subject/$strand" params={{ level, subject, strand: String(s.index) }} className="font-semibold underline-offset-2 hover:underline">
                      {s.name} <BookOpen className="inline h-4 w-4" />
                    </Link>
                    <span className="text-sm text-muted-foreground">{s.avgQ.toFixed(1)} ข้อ · {s.avgPoints.toFixed(1)} คะแนน · {s.pct}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${s.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="font-display text-xl">แต่ละข้อออกเรื่องอะไร</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {Object.values(SAME).map((v) => <span key={v.label} className={cn("rounded-full border border-border px-2 py-0.5", v.cls)}>{v.label}</span>)}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] border-separate border-spacing-y-1 text-sm">
                <thead><tr className="text-left text-muted-foreground"><th className="w-10 px-2">ข้อ</th>{a.years.map((y) => <th key={y} className="px-2">{y}</th>)}</tr></thead>
                <tbody>
                  {a.grid.map((r) => (
                    <tr key={r.no} className={SAME[r.same].cls}>
                      <td className="rounded-l-lg px-2 py-1.5 font-display">{r.no}</td>
                      {r.cells.map((c, i) => <td key={i} className="px-2 py-1.5 last:rounded-r-lg">{c?.topic ?? "–"}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="font-display text-xl">ทุกเรื่องที่เคยออก</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.topics.map((t) => <span key={t.topic} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{t.topic} · {t.years.length}/{a.nYears} ปี</span>)}
            </div>
          </section>
        </div>
      </main>
    </PageShell>
  );
}
