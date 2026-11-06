import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/session";
import { setMyClass } from "@/lib/classes.functions";
import { assignmentAlert, sortByUrgency, classLabel, type Assignment, type AssignmentAlert } from "@/lib/assignments";
import type { Attempt } from "@/lib/progress";
import { cn } from "@/lib/utils";

const SEEN = "preonet-seen-assignments";
const BADGE: Partial<Record<AssignmentAlert, { text: string; cls: string }>> = {
  late: { text: "เลยกำหนด", cls: "bg-destructive text-destructive-foreground" },
  soon: { text: "ใกล้ครบกำหนด", cls: "bg-accent text-accent-foreground" },
  new: { text: "ใหม่", cls: "bg-primary text-primary-foreground" },
};

/** Student dashboard: own class and the work teachers assigned to it. */
export function StudentAssignments({ attempts }: { attempts: Attempt[] }) {
  const acc = useAccount();
  const [list, setList] = useState<Assignment[]>([]);
  const [f, setF] = useState({ grade: "", room: "" });
  const [saved, setSaved] = useState<{ grade: string; room: string | null } | null>(null);
  const [seen, setSeen] = useState<Set<string> | null>(null);
  useEffect(() => { try { setSeen(new Set(JSON.parse(localStorage.getItem(SEEN) ?? "[]") as string[])); } catch { setSeen(new Set()); } }, []);
  const markSeen = (id: string) => {
    const n = new Set(seen ?? []); n.add(id);
    localStorage.setItem(SEEN, JSON.stringify([...n]));
  };
  useEffect(() => {
    if (!acc || acc.role !== "student") return;
    void supabase.from("assignments").select("id, grade, room, subject, kind, target, title, due_at, created_at, teacher_id").order("created_at", { ascending: false })
      .then(({ data }) => setList((data ?? []) as Assignment[]));
  }, [acc, saved]);
  if (!acc || acc.role !== "student") return null;
  const grade = saved?.grade ?? acc.grade;
  const room = saved ? saved.room : acc.room;

  const save = async () => {
    const res = await setMyClass({ data: f });
    if (!res.ok) { toast.error(res.error); return; }
    setSaved({ grade: f.grade, room: f.room.trim() || null });
    toast.success("บันทึกชั้นเรียนแล้ว");
  };

  if (!grade) return (
    <section className="rounded-2xl border-2 border-accent bg-card p-4 shadow-paper">
      <p className="font-semibold">บอกชั้นและห้องของคุณ เพื่อรับงานจากครู</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })}>
          <option value="">เลือกชั้น</option><option value="p6">ป.6</option><option value="m3">ม.3</option>
        </select>
        <Input className="h-9 w-24" placeholder="ห้อง" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} />
        <Button size="sm" onClick={save} disabled={!f.grade}>บันทึก</Button>
      </div>
    </section>
  );

  const link = (a: Assignment) => a.kind === "drill"
    ? <Link to="/drill/$level/$subject/$topic" params={{ level: a.grade, subject: a.subject, topic: a.target }} onClick={() => markSeen(a.id)}>ไปทำ</Link>
    : <Link to="/preonet/$level/$subject/$round" params={{ level: a.grade, subject: a.subject, round: a.kind === "pre1" ? "1" : "2" }} onClick={() => markSeen(a.id)}>ไปทำ</Link>;
  const alertOf = (a: Assignment) => assignmentAlert(a, attempts, seen ?? new Set());
  const sorted = sortByUrgency(list, alertOf);
  const pending = list.filter((a) => alertOf(a) !== "done").length;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-5">
      <h2 className="flex items-center gap-2 font-display text-xl"><ClipboardList className="h-5 w-5" /> งานจากครู {pending > 0 && <span className="rounded-full bg-destructive px-2 py-0.5 text-sm text-destructive-foreground">{pending}</span>} <span className="text-sm font-normal text-muted-foreground">· {classLabel(grade, room)}</span></h2>
      {!list.length ? <p className="mt-2 text-sm text-muted-foreground">ยังไม่มีงานที่ครูมอบหมาย</p> : (
        <ul className="mt-2 divide-y divide-border">
          {sorted.map((a) => {
            const st = alertOf(a);
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold">{a.title} {BADGE[st] && <span className={cn("rounded-full px-2 py-0.5 text-xs", BADGE[st]!.cls)}>{BADGE[st]!.text}</span>}</p>
                  <p className={cn("text-xs", st === "late" ? "text-destructive" : "text-muted-foreground")}>{a.due_at ? `ส่งภายใน ${new Date(a.due_at).toLocaleDateString("th-TH")}` : "ไม่กำหนดวันส่ง"}</p>
                </div>
                {st === "done" ? <span className="text-sm font-semibold text-success">ทำแล้ว ✓</span> : <Button size="sm" asChild>{link(a)}</Button>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
