import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileDown, KeyRound, LogOut, Users } from "lucide-react";
import { printReport } from "@/lib/print-report";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/session";
import { resetStudentPassword } from "@/lib/accounts.functions";
import { teacherUpdateStudent } from "@/lib/classes.functions";
import { AssignmentsPanel, MyClasses, SchoolPeople, type TClass, type TPerson } from "@/components/teacher/ClassTools";
import { classLabel } from "@/lib/assignments";
import { MIN_PASSWORD } from "@/lib/account-id";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { strandsFor } from "@/data/strands";
import { levelOf } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/teacher")({
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
type Student = { id: string; first: string; last: string; created: string; grade: string | null; room: string | null; active: boolean };
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
  const [teachers, setTeachers] = useState<TPerson[]>([]);
  const [classes, setClasses] = useState<TClass[]>([]);
  const [room, setRoom] = useState<string>("all");
  const [tick, setTick] = useState(0);
  const [school, setSchool] = useState<{ amphoe: string | null; province: string | null; area: string | null; opened: string | null; teachers: number } | null>(null);

  useEffect(() => {
    if (!acc || acc.role !== "teacher") return;
    (async () => {
      const [{ data: profs }, { data: roles }, { data: att }] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, created_at, grade, room, active").eq("school_code", acc.school),
        supabase.from("user_roles").select("user_id, role").eq("role", "student"),
        supabase.from("attempts").select("user_id, kind, level, subject, label, at, items").order("at", { ascending: true }).limit(5000),
      ]);
      const sids = new Set((roles ?? []).map((r) => r.user_id));
      setStudents((profs ?? []).filter((p) => sids.has(p.id)).map((p) => ({ id: p.id, first: p.first_name, last: p.last_name, created: p.created_at, grade: p.grade, room: p.room, active: p.active })));
      setRows(((att ?? []) as unknown as Row[]).filter((r) => sids.has(r.user_id)));
      const { data: es } = await supabase.from("essay_answers").select("user_id").is("score", null);
      const m = new Map<string, number>();
      for (const e of es ?? []) m.set(e.user_id, (m.get(e.user_id) ?? 0) + 1);
      setPending(m);
      const [{ data: sc }, { data: site }, { data: tr }] = await Promise.all([
        supabase.from("schools").select("amphoe, province, area").eq("code", acc.school).maybeSingle(),
        supabase.from("school_sites").select("opened_at").eq("code", acc.school).maybeSingle(),
        supabase.from("user_roles").select("user_id").eq("role", "teacher"),
      ]);
      const tids = new Set((tr ?? []).map((r) => r.user_id));
      setTeachers((profs ?? []).filter((p) => tids.has(p.id)).map((p) => ({ id: p.id, first: p.first_name, last: p.last_name })));
      const { data: cls } = await supabase.from("teacher_classes").select("id, teacher_id, grade, room, subject");
      const mine = ((cls ?? []) as TClass[]);
      setClasses(mine);
      setRoom((cur) => {
        if (cur !== "all") return cur;
        const first = mine.find((c) => c.teacher_id === acc.id);
        if (!first) return cur;
        setLevel(first.grade as Level); setSubject(first.subject as Subject);
        return classLabel(first.grade, first.room || null);
      });
      setSchool({ amphoe: sc?.amphoe ?? null, province: sc?.province ?? null, area: sc?.area ?? null, opened: site?.opened_at ?? null,
        teachers: (profs ?? []).filter((p) => tids.has(p.id)).length });
    })();
  }, [acc, tick]);

  const view = useMemo(() => {
    const sel = rows.filter((r) => r.level === level && r.subject === subject);
    const strands = strandsFor(subject).map((s) => {
      const items = sel.flatMap((r) => r.items.filter((i) => i.strand === s));
      return { name: s, n: items.length, pct: pct(items) };
    });
    const per = students.filter((s) => room === "all" || classLabel(s.grade, s.room) === room || classLabel(s.grade, null) === room).map((s) => {
      const mine = rows.filter((r) => r.user_id === s.id);
      const mineSel = sel.filter((r) => r.user_id === s.id);
      const last = mineSel[mineSel.length - 1];
      const first = mineSel[0];
      return { ...s, count: mine.length, lastAt: mine[mine.length - 1]?.at, firstPct: first ? pct(first.items) : null, lastPct: last ? pct(last.items) : null, tests: mineSel.length };
    }).sort((a, b) => (a.lastPct ?? 101) - (b.lastPct ?? 101));
    return { strands, per, active: new Set(sel.map((r) => r.user_id)).size };
  }, [rows, students, level, subject, room]);
  const rooms = useMemo(() => [...new Set([...students.map((s) => classLabel(s.grade, s.room)), ...(room === "all" ? [] : [room])])].sort((a, b) => a.localeCompare(b, "th")), [students, room]);

  const reset = async (s: Student) => {
    const pw = window.prompt(`ตั้งรหัสผ่านใหม่ให้ ${s.first} ${s.last} (อย่างน้อย ${MIN_PASSWORD} ตัว)`);
    if (!pw) return;
    const res = await resetStudentPassword({ data: { studentId: s.id, password: pw } });
    window.alert(res.ok ? "ตั้งรหัสผ่านใหม่แล้ว แจ้งนักเรียนได้เลย" : res.error);
  };
  const move = async (s: Student) => {
    const v = window.prompt(`ย้ายห้อง ${s.first} ${s.last} — พิมพ์ชั้น/ห้อง เช่น ป.6/2 หรือ ม.3/1`, classLabel(s.grade, s.room));
    if (!v) return;
    const m = v.trim().match(/^(ป\.?6|ม\.?3)\s*\/?\s*(\S*)$/);
    if (!m) return window.alert("รูปแบบไม่ถูกต้อง ตัวอย่าง: ป.6/2");
    const res = await teacherUpdateStudent({ data: { studentId: s.id, grade: m[1]!.startsWith("ป") ? "p6" : "m3", room: m[2] ?? "" } });
    if (!res.ok) return window.alert(res.error);
    setTick((t) => t + 1);
  };
  const toggleActive = async (s: Student) => {
    if (!window.confirm(s.active ? `ปิดบัญชี ${s.first} ${s.last}? นักเรียนจะเข้าสู่ระบบไม่ได้ แต่ผลสอบยังเก็บไว้` : `เปิดบัญชี ${s.first} ${s.last} อีกครั้ง?`)) return;
    const res = await teacherUpdateStudent({ data: { studentId: s.id, active: !s.active } });
    if (!res.ok) return window.alert(res.error);
    setTick((t) => t + 1);
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
              <h1 className="font-display text-xl">สวัสดี ครู{acc.first} {acc.last}</h1>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <Button size="sm" onClick={() => printReport("school", `รายงานโรงเรียน${acc.schoolName}`)}><FileDown /> PDF รายโรงเรียน</Button>
              <Button variant="outline" size="sm" onClick={signOut}><LogOut /> ออกจากระบบ</Button>
            </div>
          </div>
          <p className="print-only text-xs text-muted-foreground">พิมพ์เมื่อ {new Date().toLocaleString("th-TH", { dateStyle: "long", timeStyle: "short" })} · COOL QUIZ : O-NET</p>

          <div className="rep-school">

          <SchoolOverview acc={acc} school={school} students={students} rows={rows} pending={[...pending.values()].reduce((a, b) => a + b, 0)}
            onPick={(l, sub) => { setLevel(l); setSubject(sub); }} />
          </div>

          <SchoolPeople teachers={teachers} students={students} rows={rows} classes={classes} />
          <MyClasses me={acc.id} classes={classes} onChange={() => setTick((t) => t + 1)} />
          <AssignmentsPanel me={acc.id} school={acc.school} students={students} rows={rows} />

          <div className="rep-subject space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <h2 className="font-display text-xl">รายละเอียด {SUBJECT_NAMES[subject]} {LEVEL_NAMES[level]}</h2>
            <Button size="sm" variant="outline" className="no-print" onClick={() => printReport("subject", `รายงาน${SUBJECT_NAMES[subject]} ${LEVEL_NAMES[level]} ${acc.schoolName}`)}><FileDown /> PDF รายวิชานี้</Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="นักเรียนที่สมัคร" value={students.length} />
            <Stat label="ทำข้อสอบทั้งหมด" value={rows.length} />
            <Stat label={`ทำ${SUBJECT_NAMES[subject]} ${LEVEL_NAMES[level]}`} value={`${view.active} คน`} />
          </div>

          <div className="no-print flex flex-wrap gap-2">
            {LEVELS.map((l) => <Pill key={l} on={l === level} onClick={() => setLevel(l)}>{LEVEL_NAMES[l]}</Pill>)}
            <span className="mx-1 w-px bg-border" />
            {SUBJECTS.map((s) => <Pill key={s} on={s === subject} onClick={() => setSubject(s)}>{SUBJECT_NAMES[s]}</Pill>)}
          </div>
          <div className="no-print flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">ห้อง:</span>
            <Pill on={room === "all"} onClick={() => setRoom("all")}>ทั้งโรงเรียน</Pill>
            {rooms.map((r) => <Pill key={r} on={r === room} onClick={() => setRoom(r)}>{r}</Pill>)}
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
                <table className="w-full min-w-[760px] text-sm">
                  <thead><tr className="text-left text-muted-foreground"><th className="py-1">ชื่อ</th><th>ห้อง</th><th>ทำวิชานี้</th><th>ครั้งแรก</th><th>ล่าสุด</th><th>ใช้งานล่าสุด</th><th></th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {view.per.map((s) => (
                      <tr key={s.id}>
                        <td className="py-2 font-semibold"><Link to="/teacher/$studentId" params={{ studentId: s.id }} search={{ level, subject }} className="text-primary underline-offset-2 hover:underline">{s.first} {s.last}</Link>{pending.get(s.id) ? <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-normal">ข้อเขียนรอตรวจ {pending.get(s.id)}</span> : null}</td>
                        <td className="whitespace-nowrap">{classLabel(s.grade, s.room)}{!s.active && <span className="ml-1 rounded-full bg-muted px-2 text-xs">ปิดบัญชี</span>}</td>
                        <td>{s.tests} ครั้ง</td>
                        <td>{s.firstPct === null ? "–" : `${s.firstPct}%`}</td>
                        <td>{s.lastPct === null ? "–" : <b>{s.lastPct}% <span className="font-normal text-muted-foreground">({levelOf(s.lastPct)})</span></b>}</td>
                        <td className="text-muted-foreground">{s.lastAt ? new Date(s.lastAt).toLocaleDateString("th-TH") : "–"}</td>
                        <td className="no-print whitespace-nowrap text-right"><Button size="sm" variant="ghost" onClick={() => reset(s)}><KeyRound /> ตั้งรหัสใหม่</Button><Button size="sm" variant="ghost" onClick={() => move(s)}>ย้ายห้อง</Button><Button size="sm" variant="ghost" onClick={() => toggleActive(s)}>{s.active ? "ปิดบัญชี" : "เปิดบัญชี"}</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          </div>
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

const SUBJ_UI: Record<Subject, { bg: string; text: string }> = {
  math: { bg: "bg-subj-math", text: "text-subj-math" }, thai: { bg: "bg-subj-thai", text: "text-subj-thai" },
  eng: { bg: "bg-subj-eng", text: "text-subj-eng" }, sci: { bg: "bg-subj-sci", text: "text-subj-sci" },
};

/** School back office header: identity, headline numbers and a level × subject score grid. */
function SchoolOverview({ acc, school, students, rows, pending, onPick }: {
  acc: { school: string; schoolName: string };
  school: { amphoe: string | null; province: string | null; area: string | null; opened: string | null; teachers: number } | null;
  students: Student[]; rows: Row[]; pending: number; onPick: (l: Level, s: Subject) => void;
}) {
  const weekAgo = Date.now() - 7 * 864e5;
  const active = new Set(rows.filter((r) => new Date(r.at).getTime() >= weekAgo).map((r) => r.user_id)).size;
  const pre1 = rows.filter((r) => r.kind === "pre1");
  const avgPre1 = pre1.length ? Math.round(pre1.reduce((a, r) => a + pct(r.items), 0) / pre1.length) : null;
  const cell = (l: Level, s: Subject) => {
    const p1 = pre1.filter((r) => r.level === l && r.subject === s);
    const latest = new Map<string, Row>();
    for (const r of rows) if (r.level === l && r.subject === s && r.kind !== "practice" && r.kind !== "drill") latest.set(r.user_id, r);
    const avg = (xs: Row[]) => (xs.length ? Math.round(xs.reduce((a, r) => a + pct(r.items), 0) / xs.length) : null);
    return { n: p1.length, pre1: avg(p1), now: avg([...latest.values()]) };
  };
  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-paper">
        <div className="bg-primary p-4 text-primary-foreground sm:p-5">
          <p className="text-xs opacity-80">แดชบอร์ดโรงเรียน · รหัส {acc.school}</p>
          <h2 className="font-display text-2xl sm:text-3xl">โรงเรียน{acc.schoolName}</h2>
          <p className="text-sm opacity-90">{school ? `อำเภอ${school.amphoe ?? "-"} จังหวัด${school.province ?? "-"}` : "…"}</p>
          {school?.area && <p className="text-sm opacity-90">{school.area}</p>}
        </div>
        <div className="grid grid-cols-2 divide-border sm:grid-cols-5 sm:divide-x">
          <Kpi label="ครูในระบบ" value={school?.teachers ?? "–"} />
          <Kpi label="นักเรียนที่สมัคร" value={students.length} />
          <Kpi label="ใช้งาน 7 วันล่าสุด" value={`${active} คน`} />
          <Kpi label="คะแนนเฉลี่ย PRE O-NET ครั้งที่ 1" value={avgPre1 !== null ? `${avgPre1}%` : "–"} />
          <Kpi label="ข้อเขียนรอตรวจ" value={pending} />
        </div>
        {school?.opened && <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">เปิดระบบโรงเรียนเมื่อ {new Date(school.opened).toLocaleDateString("th-TH", { dateStyle: "long" })}</p>}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-5">
        <h2 className="font-display text-xl">คะแนนรายวิชา</h2>
        <p className="text-sm text-muted-foreground">เฉลี่ย PRE O-NET ครั้งที่ 1 และผลล่าสุดของนักเรียน · แตะช่องเพื่อดูรายละเอียด</p>
        <div className="mt-3 space-y-3">
          {LEVELS.map((l) => (
            <div key={l}>
              <p className="mb-1.5 font-semibold">{LEVEL_NAMES[l]}</p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {SUBJECTS.map((s) => {
                  const c = cell(l, s);
                  return (
                    <button key={s} type="button" onClick={() => onPick(l, s)} className="rounded-xl border border-border p-3 text-left transition hover:bg-secondary">
                      <p className={cn("text-sm font-semibold", SUBJ_UI[s].text)}>{SUBJECT_NAMES[s]}</p>
                      <p className="font-display text-3xl leading-tight">{c.pre1 ?? "–"}{c.pre1 !== null && <span className="text-sm">%</span>}</p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full", SUBJ_UI[s].bg)} style={{ width: `${c.pre1 ?? 0}%` }} /></div>
                      <p className="mt-1 text-xs text-muted-foreground">ทำครั้งที่ 1 แล้ว {c.n} คน · ล่าสุด {c.now ?? "–"}{c.now !== null && "%"}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 sm:p-4">
      <p className="font-display text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
