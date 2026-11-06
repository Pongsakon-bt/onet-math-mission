import { useEffect, useMemo, useState } from "react";
import { ClipboardList, School, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { analyzeSubject } from "@/data/analysis";
import { assignedTo, assignmentStatus, classLabel, cleanRoom, type Assignment, type AssignmentKind } from "@/lib/assignments";
import { cn } from "@/lib/utils";

export type TStudent = { id: string; first: string; last: string; created: string; grade: string | null; room: string | null; active: boolean };
export type TPerson = { id: string; first: string; last: string };
export type TRow = { user_id: string; kind: string; level: string; subject: string; label: string; at: string };
export type TClass = { id: string; teacher_id: string; grade: string; room: string; subject: string };

const SUBJECTS = Object.keys(SUBJECT_NAMES) as Subject[];
const KIND_NAMES: Record<AssignmentKind, string> = { pre1: "PRE O-NET ครั้งที่ 1", pre2: "PRE O-NET ครั้งที่ 2", drill: "ข้อสอบย่อยรายเรื่อง" };
const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const card = "rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6";

const toAttempt = (r: TRow) => ({ kind: r.kind as never, level: r.level as never, subject: r.subject as never, label: r.label, at: new Date(r.at).getTime() });

/** Teachers of the school, students per class and how many finished PRE O-NET round 1. */
export function SchoolPeople({ teachers, students, rows, classes }: { teachers: TPerson[]; students: TStudent[]; rows: TRow[]; classes: TClass[] }) {
  const groups = useMemo(() => {
    const m = new Map<string, TStudent[]>();
    for (const s of students.filter((x) => x.active)) {
      const k = classLabel(s.grade, s.room);
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    const pre1 = new Set(rows.filter((r) => r.kind === "pre1").map((r) => r.user_id));
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b, "th")).map(([k, list]) => ({ k, n: list.length, done: list.filter((s) => pre1.has(s.id)).length }));
  }, [students, rows]);
  return (
    <section className={card}>
      <h2 className="flex items-center gap-2 font-display text-xl"><School className="h-5 w-5" /> คนในโรงเรียน</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 font-semibold">ครู ({teachers.length})</p>
          <ul className="space-y-1 text-sm">
            {teachers.map((t) => {
              const mine = classes.filter((c) => c.teacher_id === t.id);
              return <li key={t.id}><b>ครู{t.first} {t.last}</b> <span className="text-muted-foreground">{mine.length ? mine.map((c) => `${classLabel(c.grade, c.room || null)} ${SUBJECT_NAMES[c.subject as Subject]}`).join(", ") : "ยังไม่เลือกห้องที่สอน"}</span></li>;
            })}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-semibold">นักเรียนแต่ละห้อง</p>
          {!groups.length ? <p className="text-sm text-muted-foreground">ยังไม่มีนักเรียน</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th>ห้อง</th><th>นักเรียน</th><th>ทำ PRE O-NET ครั้งที่ 1 แล้ว</th></tr></thead>
              <tbody className="divide-y divide-border">
                {groups.map((g) => <tr key={g.k}><td className="py-1 font-semibold">{g.k}</td><td>{g.n} คน</td><td>{g.done} คน ({Math.round((g.done / g.n) * 100)}%)</td></tr>)}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

/** Classes this teacher looks after. */
export function MyClasses({ me, classes, onChange }: { me: string; classes: TClass[]; onChange: () => void }) {
  const [f, setF] = useState({ grade: "p6", room: "", subject: "math" });
  const mine = classes.filter((c) => c.teacher_id === me);
  const add = async () => {
    const { error } = await supabase.from("teacher_classes").insert({ teacher_id: me, grade: f.grade, room: cleanRoom(f.room) ?? "", subject: f.subject });
    if (error) return toast.error(error.code === "23505" ? "มีห้องนี้แล้ว" : "เพิ่มไม่สำเร็จ");
    setF({ ...f, room: "" }); onChange();
  };
  const del = async (id: string) => { await supabase.from("teacher_classes").delete().eq("id", id); onChange(); };
  return (
    <section className={cn(card, "no-print")}>
      <h2 className="flex items-center gap-2 font-display text-xl"><UserCog className="h-5 w-5" /> ห้องและวิชาที่ฉันสอน</h2>
      <p className="text-sm text-muted-foreground">เลือกไว้แล้วตัวกรองนักเรียนจะเปิดที่ห้องแรกของคุณ (ยังดูทั้งโรงเรียนได้)</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {mine.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
            {classLabel(c.grade, c.room || null)} · {SUBJECT_NAMES[c.subject as Subject]}
            <button aria-label="ลบห้องนี้" onClick={() => del(c.id)}><Trash2 className="h-3.5 w-3.5" /></button>
          </span>
        ))}
        {!mine.length && <span className="text-sm text-muted-foreground">ยังไม่ได้เลือก</span>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select className={sel} value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })}><option value="p6">ป.6</option><option value="m3">ม.3</option></select>
        <Input className="h-9 w-24" placeholder="ห้อง" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} />
        <select className={sel} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJECTS.map((s) => <option key={s} value={s}>{SUBJECT_NAMES[s]}</option>)}</select>
        <Button size="sm" onClick={add}>เพิ่มห้อง</Button>
      </div>
    </section>
  );
}

/** Teacher assigns PRE O-NET rounds or topic drills to a class and sees who has finished. */
export function AssignmentsPanel({ me, school, students, rows }: { me: string; school: string; students: TStudent[]; rows: TRow[] }) {
  const [list, setList] = useState<Assignment[]>([]);
  const [f, setF] = useState({ grade: "p6" as Level, room: "", subject: "math" as Subject, kind: "pre1" as AssignmentKind, target: "", due: "" });
  const [open, setOpen] = useState<string | null>(null);
  const load = async () => {
    const { data } = await supabase.from("assignments").select("id, grade, room, subject, kind, target, title, due_at, created_at, teacher_id").order("created_at", { ascending: false });
    setList((data ?? []) as Assignment[]);
  };
  useEffect(() => { void load(); }, []);
  const topics = useMemo(() => analyzeSubject(f.grade, f.subject).topics.map((t) => t.topic), [f.grade, f.subject]);
  const add = async () => {
    if (f.kind === "drill" && !f.target) return toast.error("เลือกเรื่องที่ต้องการให้ทำ");
    const room = cleanRoom(f.room);
    const title = `${KIND_NAMES[f.kind]}${f.kind === "drill" ? `: ${f.target}` : ""} · ${SUBJECT_NAMES[f.subject]}`;
    const { error } = await supabase.from("assignments").insert({ school_code: school, teacher_id: me, grade: f.grade, room, subject: f.subject, kind: f.kind,
      target: f.kind === "drill" ? f.target : "", title, due_at: f.due ? new Date(`${f.due}T23:59:00`).toISOString() : null });
    if (error) return toast.error("มอบหมายไม่สำเร็จ");
    toast.success("มอบหมายงานแล้ว"); setF({ ...f, target: "", due: "" }); void load();
  };
  const del = async (id: string) => { if (!window.confirm("ลบงานนี้?")) return; await supabase.from("assignments").delete().eq("id", id); void load(); };
  const atts = useMemo(() => {
    const m = new Map<string, ReturnType<typeof toAttempt>[]>();
    for (const r of rows) m.set(r.user_id, [...(m.get(r.user_id) ?? []), toAttempt(r)]);
    return m;
  }, [rows]);
  return (
    <section className={card}>
      <h2 className="flex items-center gap-2 font-display text-xl"><ClipboardList className="h-5 w-5" /> งานที่มอบหมาย</h2>
      <div className="no-print mt-3 flex flex-wrap items-center gap-2">
        <select className={sel} value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value as Level, target: "" })}><option value="p6">ป.6</option><option value="m3">ม.3</option></select>
        <Input className="h-9 w-28" placeholder="ห้อง (ว่าง=ทุกห้อง)" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} />
        <select className={sel} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value as Subject, target: "" })}>{SUBJECTS.map((s) => <option key={s} value={s}>{SUBJECT_NAMES[s]}</option>)}</select>
        <select className={sel} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as AssignmentKind })}>{(Object.keys(KIND_NAMES) as AssignmentKind[]).map((k) => <option key={k} value={k}>{KIND_NAMES[k]}</option>)}</select>
        {f.kind === "drill" && <select className={cn(sel, "max-w-[220px]")} value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })}><option value="">เลือกเรื่อง</option>{topics.map((t) => <option key={t} value={t}>{t}</option>)}</select>}
        <label className="flex items-center gap-1 text-sm">ส่งภายใน <Input type="date" className="h-9 w-40" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></label>
        <Button size="sm" onClick={add}>มอบหมาย</Button>
      </div>
      <div className="mt-4 space-y-2">
        {!list.length && <p className="text-sm text-muted-foreground">ยังไม่มีงานที่มอบหมาย</p>}
        {list.map((a) => {
          const target = assignedTo(a, students.filter((s) => s.active));
          const st = target.map((s) => ({ s, status: assignmentStatus(a, atts.get(s.id) ?? []) }));
          const done = st.filter((x) => x.status === "done").length;
          return (
            <div key={a.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button className="text-left" onClick={() => setOpen(open === a.id ? null : a.id)}>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{classLabel(a.grade, a.room)}{a.room ? "" : " ทุกห้อง"} · {a.due_at ? `ส่งภายใน ${new Date(a.due_at).toLocaleDateString("th-TH")}` : "ไม่กำหนดวันส่ง"} · ทำแล้ว {done}/{target.length} คน</p>
                </button>
                {a.teacher_id === me && <Button size="sm" variant="ghost" className="no-print" onClick={() => del(a.id)}><Trash2 /></Button>}
              </div>
              {open === a.id && (
                <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  {st.map(({ s, status }) => (
                    <li key={s.id} className="flex justify-between gap-2"><span>{s.first} {s.last}</span>
                      <span className={cn(status === "done" ? "text-success" : status === "late" ? "text-destructive" : "text-muted-foreground")}>{status === "done" ? "ทำแล้ว" : status === "late" ? "เลยกำหนด" : "ยังไม่ทำ"}</span></li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
