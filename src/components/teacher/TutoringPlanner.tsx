import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECT_NAMES } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { analyzeSubject } from "@/data/analysis";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/session";
import { ONET_CALENDAR } from "@/lib/onet-calendar";
import { buildTutoringPlan, dayDate, targetLevel, type PlanConfig, type PlanSession } from "@/lib/tutoring-plan";
import { saveTutoringPlan } from "@/lib/tutoring.functions";

const GRADES: PlanConfig["grade"][] = ["p4", "p5", "p6", "m1", "m2", "m3"];
const gradeName = (g: string) => `${g.startsWith("p") ? "ป." : "ม."}${g.slice(1)}`;
const DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const formatDay = (d: string) => dayDate(d).toLocaleDateString("th-TH", { dateStyle: "medium", timeZone: "UTC" });
type SavedPlan = { id: string; title: string; teacher_id: string; config: PlanConfig; schedule: PlanSession[] };

export function TutoringPlanner() {
  const account = useAccount();
  const saveFn = useServerFn(saveTutoringPlan);
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [id, setId] = useState<string>();
  const [config, setConfig] = useState<PlanConfig>({ title: "แผนติว O-NET", grade: "p6", room: "", subjects: ["math"], weekdays: [1, 3], start: "", minutes: 60 });
  const [schedule, setSchedule] = useState<PlanSession[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const level = targetLevel(config.grade);
  const topics = useMemo(() => config.subjects.flatMap(subject => analyzeSubject(level, subject).topics.map(t => ({ topic: t.topic, strand: t.strand, subject }))), [level, config.subjects]);

  async function load() {
    const { data, error } = await supabase.from("tutoring_plans").select("id,title,teacher_id,config,schedule").order("created_at", { ascending: false });
    if (error) toast.error("โหลดแผนติวไม่สำเร็จ");
    else setPlans((data ?? []) as unknown as SavedPlan[]);
    setLoading(false);
  }
  useEffect(() => { if (account?.role === "teacher") void load(); }, [account?.id]);
  useEffect(() => {
    setConfig(c => ({ ...c, start: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }) }));
  }, []);
  function change(patch: Partial<PlanConfig>) { setConfig(c => ({ ...c, ...patch })); setSchedule([]); setError(""); }
  function generate() {
    try { const next = buildTutoringPlan(config, topics); setSchedule(next); setError(""); return next; }
    catch (e) { setError(e instanceof Error ? e.message : "ตรวจข้อมูลแผนติวอีกครั้ง"); return null; }
  }
  async function save() {
    if (!generate()) return;
    setBusy(true);
    try { const result = await saveFn({ data: { id, config } }); setId(result.id); setSchedule(result.schedule); await load(); toast.success("บันทึกแผนติวแล้ว"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "บันทึกแผนไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  async function remove(plan: SavedPlan) {
    if (!window.confirm(`ลบแผน ${plan.title}?`)) return;
    const { error } = await supabase.from("tutoring_plans").delete().eq("id", plan.id).eq("teacher_id", account?.id ?? "");
    if (error) toast.error("ลบแผนไม่สำเร็จ");
    else { if (id === plan.id) { setId(undefined); setSchedule([]); } await load(); }
  }
  const weeks = [...new Set(schedule.map(s => s.week))];
  const maximum = Math.max(0, ...schedule.map(s => s.topics.length));
  return (
    <section className="no-print space-y-4 border-y border-border bg-card px-4 py-5 sm:px-6" aria-label="แผนติวรายสัปดาห์">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-xl"><CalendarDays /> แผนติวรายสัปดาห์</h2>
        <Button variant="outline" size="sm" onClick={() => { setId(undefined); setReadOnly(false); setSchedule([]); setError(""); }}><Plus /> แผนใหม่</Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">กำลังโหลดแผนติว…</p> : plans.length > 0 && <div className="flex flex-wrap gap-2">{plans.map(plan => <div key={plan.id} className="flex items-center gap-1">
        <Button size="sm" variant={id === plan.id ? "default" : "outline"} onClick={() => { setId(plan.id); setConfig(plan.config); setSchedule(plan.schedule); setReadOnly(plan.teacher_id !== account?.id); setError(""); }}><Pencil className="size-3" />{plan.title}</Button>
        {plan.teacher_id === account?.id && <Button size="icon" variant="ghost" aria-label={`ลบ ${plan.title}`} onClick={() => void remove(plan)}><Trash2 className="size-4" /></Button>}
      </div>)}</div>}
      <fieldset disabled={readOnly || busy} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm font-semibold">ชื่อแผน<Input value={config.title} onChange={e => change({ title: e.target.value })} maxLength={100} /></label>
        <div className="space-y-1 text-sm font-semibold"><span>ชั้นที่ติว</span><Select value={config.grade} onValueChange={grade => change({ grade: grade as PlanConfig["grade"] })}><SelectTrigger aria-label="ชั้นที่ติว"><SelectValue /></SelectTrigger><SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{gradeName(g)}</SelectItem>)}</SelectContent></Select></div>
        <label className="space-y-1 text-sm font-semibold">ห้อง (เว้นว่าง = ทุกห้อง)<Input value={config.room} maxLength={10} onChange={e => change({ room: e.target.value })} /></label>
        <div className="space-y-1 text-sm font-semibold"><span>วันเริ่มติว</span><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start" aria-label="วันเริ่มติว"><CalendarDays />{config.start ? formatDay(config.start) : "เลือกวัน"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar locale={th} mode="single" className="pointer-events-auto" selected={config.start ? new Date(`${config.start}T12:00:00`) : undefined} disabled={d => d >= new Date(`${ONET_CALENDAR[level].day}T00:00:00`)} onSelect={d => { if (d) change({ start: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` }); }} /></PopoverContent></Popover></div>
        <label className="space-y-1 text-sm font-semibold">นาทีต่อครั้ง<Input type="number" min={15} max={240} value={config.minutes} onChange={e => change({ minutes: Number(e.target.value) })} /></label>
        <div className="space-y-1 text-sm"><p className="font-semibold">สอบ O-NET {level === "p6" ? "ป.6" : "ม.3"}</p><p>{ONET_CALENDAR[level].label}</p></div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-3"><p className="text-sm font-semibold">วิชาที่ติว</p><div className="flex flex-wrap gap-4">{(Object.keys(SUBJECT_NAMES) as Subject[]).map(subject => <label key={subject} className="flex items-center gap-2 text-sm"><Checkbox checked={config.subjects.includes(subject)} onCheckedChange={checked => change({ subjects: checked ? [...config.subjects, subject] : config.subjects.filter(s => s !== subject) })} />{SUBJECT_NAMES[subject]}</label>)}</div></div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-3"><p className="text-sm font-semibold">วันติว · {config.weekdays.length} ครั้งต่อสัปดาห์</p><div className="flex flex-wrap gap-2">{[1, 2, 3, 4, 5, 6, 0].map(day => <Button type="button" key={day} size="sm" aria-pressed={config.weekdays.includes(day)} variant={config.weekdays.includes(day) ? "default" : "outline"} onClick={() => change({ weekdays: config.weekdays.includes(day) ? config.weekdays.filter(d => d !== day) : [...config.weekdays, day] })}>{DAYS[day]}</Button>)}</div></div>
      </fieldset>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!readOnly && <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={generate} disabled={busy}><CalendarDays /> สร้างตารางติว</Button><Button onClick={() => void save()} disabled={busy}><Save />{busy ? "กำลังบันทึก…" : "บันทึกแผน"}</Button></div>}
      {schedule.length > 0 && <div className="space-y-3">
        <div className="flex flex-wrap gap-4 border-y border-border py-3 text-sm font-semibold"><span>{weeks.length} สัปดาห์</span><span>{schedule.length} ครั้ง</span><span>{schedule.reduce((n, s) => n + s.topics.length, 0)} เรื่อง</span><span>{config.minutes} นาที/ครั้ง</span></div>
        {maximum > Math.max(1, Math.floor(config.minutes / 20)) && <p className="text-sm text-destructive">เวลาค่อนข้างแน่น: บางครั้งมี {maximum} เรื่อง ควรเพิ่มวันติวหรือเวลา เพื่อให้ทบทวนได้ครบ</p>}
        <div className="space-y-3">{weeks.map(week => {
          const sessions = schedule.filter(s => s.week === week);
          return <div key={week} className="border-l-4 border-primary pl-3"><h3 className="mb-2 font-semibold">สัปดาห์ที่ {week} · {sessions[0] ? formatDay(sessions[0].date) : ""}</h3><div className="grid gap-2 sm:grid-cols-2">{sessions.map(session => <div key={session.date} className="rounded-lg border border-border p-3"><p className="text-sm font-semibold text-primary">{formatDay(session.date)} · {SUBJECT_NAMES[session.subject]}</p>{session.review ? <p className="mt-1 text-sm">ทบทวนและฝึกทำข้อสอบ</p> : <ul className="mt-2 space-y-1 text-sm">{session.topics.map(t => <li key={t.topic}>{t.topic}<span className="ml-2 text-xs text-muted-foreground">{t.strand}</span></li>)}</ul>}</div>)}</div></div>;
        })}</div>
      </div>}
    </section>
  );
}