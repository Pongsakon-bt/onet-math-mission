import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileDown, PenLine } from "lucide-react";
import { printReport } from "@/lib/print-report";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAccount, fromRow } from "@/lib/session";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { strandsFor } from "@/data/strands";
import { baseTopic } from "@/data/analysis";
import { levelOf, strandScores, type Attempt } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/teacher_/$studentId")({
  head: () => {
    const title = "ผลรายคน · หน้าครู · PRE O-NET";
    const description = "ครูดูผลของนักเรียนรายคน สาระและหัวข้อที่ควรเสริม และตรวจข้อเขียน";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  validateSearch: (s: Record<string, unknown>): { level?: string | undefined; subject?: string | undefined } => ({
    level: typeof s["level"] === "string" ? s["level"] : undefined,
    subject: typeof s["subject"] === "string" ? s["subject"] : undefined,
  }),
  component: StudentPage,
});

type Essay = { attempt_id: string; qid: string; no: string; prompt: string; max_points: number; answer: string; score: number | null; comment: string | null; created_at: string };
const LEVEL_NAMES: Record<Level, string> = { p6: "ป.6", m3: "ม.3" };
const KIND: Record<Attempt["kind"], string> = { diagnostic: "วัดพื้นฐาน", retest: "สอบซ้ำ", practice: "ฝึก", full: "ข้อสอบเต็มชุด", drill: "ข้อสอบย่อย", pre1: "PRE O-NET ครั้งที่ 1", pre2: "PRE O-NET ครั้งที่ 2" };
const tone = (p: number) => (p < 50 ? "bg-destructive" : p < 75 ? "bg-accent" : "bg-primary");
const pctOf = (items: Attempt["items"]) => (items.length ? Math.round((items.filter((i) => i.correct).length / items.length) * 100) : 0);

function StudentPage() {
  const { studentId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const acc = useAccount();
  const [name, setName] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!acc || acc.role !== "teacher") return;
    (async () => {
      // RLS only returns this student when they are in the teacher's school.
      const [{ data: p }, { data: att }, { data: es }] = await Promise.all([
        supabase.from("profiles").select("first_name, last_name").eq("id", studentId).maybeSingle(),
        supabase.from("attempts").select("id, kind, level, subject, label, at, ms, items").eq("user_id", studentId).order("at", { ascending: true }).limit(2000),
        supabase.from("essay_answers").select("attempt_id, qid, no, prompt, max_points, answer, score, comment, created_at").eq("user_id", studentId).order("created_at", { ascending: false }),
      ]);
      setName(p ? `${p.first_name} ${p.last_name}` : null);
      setAttempts((att ?? []).map(fromRow));
      setEssays((es ?? []) as Essay[]);
      setLoaded(true);
    })();
  }, [acc, studentId]);

  const groups = useMemo(() => {
    const keys = [...new Set(attempts.map((a) => `${a.level}|${a.subject}`))];
    return keys.map((k) => {
      const [level, subject] = k.split("|") as [Level, Subject];
      const list = attempts.filter((a) => a.level === level && a.subject === subject);
      const tests = list.filter((a) => a.kind !== "practice");
      const first = tests[0] ? strandScores(tests[0].items) : new Map();
      const latest = new Map<string, number>();
      for (const a of tests) for (const [n, v] of strandScores(a.items)) latest.set(n, v.pct);
      const strands = strandsFor(subject).map((n) => ({ n, first: first.get(n)?.pct as number | undefined, latest: latest.get(n) }));
      // Topics answered wrong most often (across every attempt).
      const t = new Map<string, { ok: number; n: number }>();
      for (const a of list) for (const it of a.items) {
        const key = baseTopic(it.topic.replace(/^[^·]*·\s*/, "").replace(/\s*\(ปี \d+\)$/, ""));
        const v = t.get(key) ?? { ok: 0, n: 0 }; v.n++; if (it.correct) v.ok++; t.set(key, v);
      }
      const weak = [...t].map(([topic, v]) => ({ topic, ...v, pct: Math.round((v.ok / v.n) * 100) }))
        .filter((x) => x.pct < 60).sort((a, b) => a.pct - b.pct || b.n - a.n).slice(0, 8);
      return { level, subject, list, strands, weak };
    });
  }, [attempts]);

  // Subject/level the teacher came from (or picks here); default to the first one with data.
  const level: Level = search.level === "m3" || search.level === "p6" ? search.level : (groups[0]?.level ?? "p6");
  const subject: Subject = (Object.keys(SUBJECT_NAMES) as string[]).includes(search.subject ?? "") ? (search.subject as Subject) : (groups[0]?.subject ?? "math");
  const pick = (l: Level, s: Subject) => navigate({ search: { level: l, subject: s }, replace: true });
  const shown = groups.filter((g) => g.level === level && g.subject === subject);

  if (acc === undefined) return <PageShell title="ผลรายคน"><div className="flex flex-1 items-center justify-center text-muted-foreground">กำลังโหลด...</div></PageShell>;
  if (!acc || acc.role !== "teacher") return (
    <PageShell title="ผลรายคน">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p>หน้านี้สำหรับครู กรุณาเข้าสู่ระบบด้วยบัญชีครู</p>
        <Button asChild><Link to="/login">เข้าสู่ระบบ</Link></Button>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="ผลรายคน" sub={`โรงเรียน${acc.schoolName}`}>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-4 sm:py-6">
          <Button variant="ghost" size="sm" asChild className="no-print"><Link to="/teacher"><ArrowLeft /> กลับหน้าครู</Link></Button>
          {loaded && !name ? <p>ไม่พบนักเรียนคนนี้ในโรงเรียนของคุณ</p> : (
            <>
              <div>
                <p className="text-sm text-muted-foreground">นักเรียน</p>
                <h1 className="font-display text-2xl sm:text-3xl">{name ?? "..."}</h1>
                <p className="text-sm text-muted-foreground">โรงเรียน{acc.schoolName} · ทำทั้งหมด {attempts.length} ครั้ง · ข้อเขียนรอตรวจ {essays.filter((e) => e.score === null).length} ข้อ</p>
                <p className="print-only text-xs text-muted-foreground">รายงานรายบุคคล {SUBJECT_NAMES[subject]} {LEVEL_NAMES[level]} · พิมพ์เมื่อ {new Date().toLocaleString("th-TH", { dateStyle: "long", timeStyle: "short" })}</p>
              </div>

              <div className="no-print flex flex-wrap items-center gap-2">
                {(["p6", "m3"] as Level[]).map((l) => <Chip key={l} on={l === level} onClick={() => pick(l, subject)}>{LEVEL_NAMES[l]}</Chip>)}
                <span className="mx-1 h-6 w-px bg-border" />
                {(Object.keys(SUBJECT_NAMES) as Subject[]).map((s) => <Chip key={s} on={s === subject} onClick={() => pick(level, s)}>{SUBJECT_NAMES[s]}</Chip>)}
                <Button size="sm" className="ml-auto" onClick={() => printReport("student", `รายงาน ${name ?? ""} ${SUBJECT_NAMES[subject]} ${LEVEL_NAMES[level]}`)}><FileDown /> PDF รายบุคคล</Button>
              </div>

              {essays.length > 0 && (
                <section className="no-print rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
                  <h2 className="flex items-center gap-2 font-display text-xl"><PenLine className="h-5 w-5" /> ตรวจข้อเขียน</h2>
                  <div className="mt-3 space-y-4">
                    {essays.map((e) => <EssayCard key={e.attempt_id + e.qid} e={e} onSaved={(n) => setEssays((l) => l.map((x) => (x.attempt_id === n.attempt_id && x.qid === n.qid ? n : x)))} />)}
                  </div>
                </section>
              )}

              {loaded && !shown.length && <p className="text-muted-foreground">นักเรียนยังไม่ได้ทำแบบทดสอบ{SUBJECT_NAMES[subject]} {LEVEL_NAMES[level]}</p>}
              {shown.map((g) => (
                <section key={g.level + g.subject} className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
                  <h2 className="font-display text-xl">{SUBJECT_NAMES[g.subject]} {LEVEL_NAMES[g.level]}</h2>
                  <p className="text-sm text-muted-foreground">ครั้งแรก → ล่าสุด (ร้อยละตอบถูก ไม่รวมการฝึก)</p>
                  <div className="mt-3 space-y-3">
                    {g.strands.map((s) => (
                      <div key={s.n}>
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="font-semibold">{s.n}</span>
                          <span>{s.latest === undefined ? "ยังไม่มีข้อมูล" : <>{s.first ?? "–"}% → <b>{s.latest}%</b> ({levelOf(s.latest)})</>}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-secondary"><div className={cn("h-2 rounded-full", tone(s.latest ?? 0))} style={{ width: `${s.latest === undefined ? 0 : Math.max(s.latest, 2)}%` }} /></div>
                      </div>
                    ))}
                  </div>
                  {g.weak.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold">หัวข้อที่ควรเสริม</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {g.weak.map((w) => <span key={w.topic} className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs">{w.topic} · ถูก {w.ok}/{w.n}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 divide-y divide-border text-sm">
                    {[...g.list].reverse().map((a) => (
                      <div key={a.id} className="flex items-center gap-3 py-2">
                        <span className="w-24 shrink-0 rounded-full bg-secondary px-2 py-0.5 text-center text-xs">{KIND[a.kind]}</span>
                        <span className="min-w-0 flex-1 truncate">{a.label}</span>
                        <span className="shrink-0 font-semibold">{pctOf(a.items)}%</span>
                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{a.ms ? `${Math.round(a.ms / 60000)} นาที · ` : ""}{new Date(a.at).toLocaleDateString("th-TH")}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-full border px-3 py-1 text-sm", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>{children}</button>;
}

function EssayCard({ e, onSaved }: { e: Essay; onSaved: (e: Essay) => void }) {
  const [score, setScore] = useState(e.score === null ? "" : String(e.score));
  const [comment, setComment] = useState(e.comment ?? "");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    const n = Number(score);
    if (score === "" || Number.isNaN(n) || n < 0 || n > e.max_points) { toast.error(`ใส่คะแนน 0–${e.max_points}`); return; }
    setBusy(true);
    const { error } = await supabase.from("essay_answers").update({ score: n, comment: comment.trim() || null }).eq("attempt_id", e.attempt_id).eq("qid", e.qid);
    setBusy(false);
    if (error) { toast.error("บันทึกไม่สำเร็จ"); return; }
    toast.success("บันทึกคะแนนแล้ว");
    onSaved({ ...e, score: n, comment: comment.trim() || null });
  };
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold">ข้อ {e.no} · เต็ม {e.max_points} คะแนน</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", e.score === null ? "bg-accent" : "bg-secondary")}>{e.score === null ? "รอตรวจ" : `ให้แล้ว ${e.score} คะแนน`}</span>
      </div>
      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{e.prompt}</p>
      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-secondary/60 p-3">{e.answer}</p>
      <div className="mt-2 flex flex-wrap items-start gap-2">
        <Input aria-label="คะแนน" inputMode="decimal" className="w-24" placeholder={`0–${e.max_points}`} value={score} onChange={(ev) => setScore(ev.target.value)} />
        <Textarea aria-label="ความเห็นครู" className="min-h-9 flex-1" rows={1} placeholder="ความเห็นถึงนักเรียน (ไม่บังคับ)" value={comment} onChange={(ev) => setComment(ev.target.value)} />
        <Button onClick={save} disabled={busy}>บันทึก</Button>
      </div>
    </div>
  );
}
