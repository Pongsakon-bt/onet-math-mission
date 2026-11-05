import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/session";
import { resetStudentPassword } from "@/lib/accounts.functions";
import { MIN_PASSWORD } from "@/lib/account-id";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { strandsFor } from "@/data/strands";
import { levelOf } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher")({
  head: () => {
    const title = "หน้าครู · ความคืบหน้านักเรียน · PRE O-NET";
    const description = "ครูดูความคืบหน้าและผลวิเคราะห์ของนักเรียนทุกคนในโรงเรียน";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: TeacherPage,
});

type Item = { strand: string; correct: boolean; points: number };
type Row = { user_id: string; kind: string; level: string; subject: string; label: string; at: string; items: Item[] };
type Student = { id: string; first: string; last: string; created: string };
const LEVELS: Level[] = ["p6", "m3"];
const LEVEL_NAMES: Record<Level, string> = { p6: "ป.6", m3: "ม.3" };
const SUBJECTS = Object.keys(SUBJECT_NAMES) as Subject[];
const pct = (items: Item[]) => (items.length ? Math.round((items.filter((i) => i.correct).length / items.length) * 100) : 0);
const tone = (p: number) => (p < 50 ? "bg-destructive" : p < 75 ? "bg-accent" : "bg-primary");

function TeacherPage() {
  const acc = useAccount();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, setPending] = useState<Map<string, number>>(new Map());
  const [level, setLevel] = useState<Level>("p6");
  const [subject, setSubject] = useState<Subject>("math");

  useEffect(() => {
    if (!acc || acc.role !== "teacher") return;
    (async () => {
      const [{ data: profs }, { data: roles }, { data: att }] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, created_at").eq("school_code", acc.school),
        supabase.from("user_roles").select("user_id, role").eq("role", "student"),
        supabase.from("attempts").select("user_id, kind, level, subject, label, at, items").order("at", { ascending: true }).limit(5000),
      ]);
      const sids = new Set((roles ?? []).map((r) => r.user_id));
      setStudents((profs ?? []).filter((p) => sids.has(p.id)).map((p) => ({ id: p.id, first: p.first_name, last: p.last_name, created: p.created_at })));
      setRows(((att ?? []) as unknown as Row[]).filter((r) => sids.has(r.user_id)));
      const { data: es } = await supabase.from("essay_answers").select("user_id").is("score", null);
      const m = new Map<string, number>();
      for (const e of es ?? []) m.set(e.user_id, (m.get(e.user_id) ?? 0) + 1);
      setPending(m);
    })();
  }, [acc]);

  const view = useMemo(() => {
    const sel = rows.filter((r) => r.level === level && r.subject === subject);
    const strands = strandsFor(subject).map((s) => {
      const items = sel.flatMap((r) => r.items.filter((i) => i.strand === s));
      return { name: s, n: items.length, pct: pct(items) };
    });
    const per = students.map((s) => {
      const mine = rows.filter((r) => r.user_id === s.id);
      const mineSel = sel.filter((r) => r.user_id === s.id);
      const last = mineSel[mineSel.length - 1];
      const first = mineSel[0];
      return { ...s, count: mine.length, lastAt: mine[mine.length - 1]?.at, firstPct: first ? pct(first.items) : null, lastPct: last ? pct(last.items) : null, tests: mineSel.length };
    }).sort((a, b) => (a.lastPct ?? 101) - (b.lastPct ?? 101));
    return { strands, per, active: new Set(sel.map((r) => r.user_id)).size };
  }, [rows, students, level, subject]);

  const reset = async (s: Student) => {
    const pw = window.prompt(`ตั้งรหัสผ่านใหม่ให้ ${s.first} ${s.last} (อย่างน้อย ${MIN_PASSWORD} ตัว)`);
    if (!pw) return;
    const res = await resetStudentPassword({ data: { studentId: s.id, password: pw } });
    window.alert(res.ok ? "ตั้งรหัสผ่านใหม่แล้ว แจ้งนักเรียนได้เลย" : res.error);
  };
  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/login", replace: true }); };

  if (acc === undefined) return <PageShell title="หน้าครู"><div className="flex flex-1 items-center justify-center text-muted-foreground">กำลังโหลด...</div></PageShell>;
  if (!acc || acc.role !== "teacher") return (
    <PageShell title="หน้าครู">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p>หน้านี้สำหรับครู กรุณาเข้าสู่ระบบด้วยบัญชีครู</p>
        <Button asChild><Link to="/login">เข้าสู่ระบบ</Link></Button>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="หน้าครู" sub={`โรงเรียน${acc.schoolName}`}>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-4 sm:py-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">ครู{acc.first} {acc.last} · รหัส {acc.school}</p>
              <h1 className="font-display text-2xl sm:text-3xl">โรงเรียน{acc.schoolName}</h1>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut /> ออกจากระบบ</Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="นักเรียนที่สมัคร" value={students.length} />
            <Stat label="ทำข้อสอบทั้งหมด" value={rows.length} />
            <Stat label={`ทำ${SUBJECT_NAMES[subject]} ${LEVEL_NAMES[level]}`} value={`${view.active} คน`} />
          </div>

          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => <Pill key={l} on={l === level} onClick={() => setLevel(l)}>{LEVEL_NAMES[l]}</Pill>)}
            <span className="mx-1 w-px bg-border" />
            {SUBJECTS.map((s) => <Pill key={s} on={s === subject} onClick={() => setSubject(s)}>{SUBJECT_NAMES[s]}</Pill>)}
          </div>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="font-display text-xl">ภาพรวมโรงเรียนรายสาระ</h2>
            <p className="text-sm text-muted-foreground">ร้อยละตอบถูกจากทุกครั้งที่นักเรียนทำ (วัดพื้นฐาน ฝึก สอบซ้ำ ข้อสอบเต็มชุด)</p>
            <div className="mt-3 space-y-3">
              {view.strands.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between gap-2 text-sm"><span className="font-semibold">{s.name}</span><span>{s.n ? `${s.pct}% (${levelOf(s.pct)}) · ${s.n} ข้อ` : "ยังไม่มีข้อมูล"}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-secondary"><div className={cn("h-2 rounded-full", tone(s.pct))} style={{ width: `${s.n ? Math.max(s.pct, 2) : 0}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-xl"><Users className="h-5 w-5" /> นักเรียน</h2>
            <p className="text-sm text-muted-foreground">กดชื่อเพื่อดูผลรายคนและตรวจข้อเขียน · เรียงจากคะแนนล่าสุดน้อยไปมาก ({SUBJECT_NAMES[subject]} {LEVEL_NAMES[level]})</p>
            {!students.length ? <p className="mt-3">ยังไม่มีนักเรียนสมัคร ให้นักเรียนสมัครด้วยรหัสโรงเรียน <b>{acc.school}</b></p> : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead><tr className="text-left text-muted-foreground"><th className="py-1">ชื่อ</th><th>ทำวิชานี้</th><th>ครั้งแรก</th><th>ล่าสุด</th><th>ใช้งานล่าสุด</th><th></th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {view.per.map((s) => (
                      <tr key={s.id}>
                        <td className="py-2 font-semibold"><Link to="/teacher/$studentId" params={{ studentId: s.id }} className="text-primary underline-offset-2 hover:underline">{s.first} {s.last}</Link>{pending.get(s.id) ? <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-normal">ข้อเขียนรอตรวจ {pending.get(s.id)}</span> : null}</td>
                        <td>{s.tests} ครั้ง</td>
                        <td>{s.firstPct === null ? "–" : `${s.firstPct}%`}</td>
                        <td>{s.lastPct === null ? "–" : <b>{s.lastPct}% <span className="font-normal text-muted-foreground">({levelOf(s.lastPct)})</span></b>}</td>
                        <td className="text-muted-foreground">{s.lastAt ? new Date(s.lastAt).toLocaleDateString("th-TH") : "–"}</td>
                        <td className="text-right"><Button size="sm" variant="ghost" onClick={() => reset(s)}><KeyRound /> ตั้งรหัสใหม่</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-secondary/60 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-2xl">{value}</p></div>;
}
function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn("rounded-full border px-3 py-1 text-sm", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>{children}</button>;
}
