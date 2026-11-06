import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { strandsFor } from "@/data/strands";
import { analyzeSubject } from "@/data/analysis";
import { strandScores, type Attempt } from "@/lib/progress";
import { predictScore } from "@/lib/prediction";
import { certificateReason, topicSkill } from "@/lib/skill";
import { getSchoolStrandAverage } from "@/lib/insights.functions";

/** Predicted O-NET score, strand radar vs school average, and the certificate button when earned. */
export function PredictionCard({ level, subject, attempts, studentId }: { level: Level; subject: Subject; attempts: Attempt[]; studentId?: string }) {
  const mine = useMemo(() => attempts.filter((a) => a.level === level && a.subject === subject), [attempts, level, subject]);
  const pred = predictScore(mine);
  const avgFn = useServerFn(getSchoolStrandAverage);
  const [avg, setAvg] = useState<Record<string, number> | null>(null);
  useEffect(() => { setAvg(null); void avgFn({ data: { level, subject } }).then((r) => setAvg(r.strands)).catch(() => setAvg({})); }, [level, subject]); // eslint-disable-line react-hooks/exhaustive-deps

  const latest = new Map<string, number>();
  for (const a of [...mine].filter((x) => x.kind !== "practice").sort((x, y) => x.at - y.at)) for (const [n, v] of strandScores(a.items)) latest.set(n, v.pct);
  const data = strandsFor(subject).map((n) => ({ strand: n.length > 16 ? n.slice(0, 15) + "…" : n, me: latest.get(n) ?? 0, school: avg?.[n] ?? 0 }));
  const rows = useMemo(() => analyzeSubject(level, subject).topics.map((t) => ({ skill: topicSkill(attempts, level, subject, t.topic).skill })), [attempts, level, subject]);
  const cert = certificateReason(attempts, level, subject, rows);

  if (!pred) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl"><TrendingUp className="h-5 w-5" /> คะแนนคาดการณ์ O-NET</h2>
          <p className="mt-1 font-display text-4xl text-primary">{pred.low}–{pred.high}<span className="text-lg text-muted-foreground"> / 100</span></p>
          <p className="text-xs text-muted-foreground">เป็นการประมาณจาก PRE ครั้งที่ 2 (50%) ข้อสอบย่อย (30%) และ PRE ครั้งที่ 1 (20%) · ใช้ข้อมูล {pred.parts} ส่วน</p>
        </div>
        {cert && (
          <Button asChild className="bg-highlight text-foreground hover:bg-highlight/90">
            <Link to="/certificate/$level/$subject" params={{ level, subject }} search={{ student: studentId }}><Award /> {studentId ? "พิมพ์เกียรติบัตร" : "รับเกียรติบัตร"}</Link>
          </Button>
        )}
      </div>
      <ChartContainer className="mx-auto mt-3 h-72 w-full" config={{ me: { label: studentId ? "นักเรียน" : "ฉัน", color: "var(--primary)" }, school: { label: "เฉลี่ยโรงเรียน", color: "var(--muted-foreground)" } }}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="strand" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Radar dataKey="school" stroke="var(--color-school)" fill="var(--color-school)" fillOpacity={0.15} />
          <Radar dataKey="me" stroke="var(--color-me)" fill="var(--color-me)" fillOpacity={0.35} />
        </RadarChart>
      </ChartContainer>
    </section>
  );
}
