import { useEffect, useMemo, useState } from "react";
import { ClipboardList, School, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { analyzeSubject } from "@/data/analysis";
import { classLabel, cleanRoom } from "@/lib/assignments";
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
    if (error) { toast.error(error.code === "23505" ? "มีห้องนี้แล้ว" : "เพิ่มไม่สำเร็จ"); return; }
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
