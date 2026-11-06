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
const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const card = "rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6";

const toAttempt = (r: TRow) => ({ kind: r.kind as never, level: r.level as never, subject: r.subject as never, label: r.label, at: new Date(r.at).getTime() });

/** Teachers of the school, students per class and how many finished PRE O-NET round 1. */
export function SchoolPeople({ teachers, students, rows }: { teachers: TPerson[]; students: TStudent[]; rows: TRow[] }) {
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
            {teachers.map((t) => <li key={t.id}><b>ครู{t.first} {t.last}</b></li>)}
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
