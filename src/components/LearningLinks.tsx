import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, ExternalLink, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { analyzeSubject } from "@/data/analysis";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function isHttpUrl(s: string) {
  try { const u = new URL(s.trim()); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; }
}

type TeacherLink = { topic: string; slot: number; url: string };
const TEACHER_TONES = ["border-teacher-resource-1 text-teacher-resource-1 hover:bg-teacher-resource-1/10", "border-teacher-resource-2 text-teacher-resource-2 hover:bg-teacher-resource-2/10", "border-teacher-resource-3 text-teacher-resource-3 hover:bg-teacher-resource-3/10"];

/** Shared system resources plus up to three school-only resources; RLS enforces school membership. */
export function LearningLinks({ level, subject }: { level: Level; subject: Subject }) {
  const a = useMemo(() => analyzeSubject(level, subject), [level, subject]);
  const account = useAccount();
  const isAdmin = account?.role === "admin";
  const isTeacher = account?.role === "teacher";
  const [teacherLinks, setTeacherLinks] = useState<TeacherLink[]>([]);
  const [teacherEditing, setTeacherEditing] = useState<{ topic: string; slot: number } | null>(null);
  const [teacherDraft, setTeacherDraft] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [links, setLinks] = useState<Map<string, string>>(new Map());
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    setLinks(new Map()); setTeacherLinks([]); setEditing(null); setTeacherEditing(null); setLoadError(false);
    void Promise.all([
      supabase.from("learning_links").select("topic, url").eq("level", level).eq("subject", subject),
      account?.school ? supabase.from("school_learning_links").select("topic,slot,url").eq("school_code", account.school).eq("level", level).eq("subject", subject).order("slot") : Promise.resolve({ data: [], error: null }),
    ]).then(([system, school]) => {
      if (!live) return;
      setLinks(new Map((system.data ?? []).map(r => [r.topic, r.url])));
      setTeacherLinks(school.data ?? []);
      setLoadError(Boolean(system.error || school.error));
    });
    return () => { live = false; };
  }, [level, subject, account?.id, account?.school]);

  async function saveTeacherLink() {
    if (!teacherEditing || !account?.school || !isTeacher) return;
    const url = teacherDraft.trim();
    if (!isHttpUrl(url)) { toast.error("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://"); return; }
    setSaving(true);
    const { topic, slot } = teacherEditing;
    const { error } = await supabase.from("school_learning_links").upsert({ school_code: account.school, level, subject, topic, slot, url, updated_by: account.id, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { toast.error("บันทึกลิงก์ไม่สำเร็จ"); return; }
    setTeacherLinks(rows => [...rows.filter(r => r.topic !== topic || r.slot !== slot), { topic, slot, url }].sort((a, b) => a.slot - b.slot));
    setTeacherEditing(null); toast.success("บันทึกเนื้อหาจากครูแล้ว");
  }

  async function removeTeacherLink(row: TeacherLink) {
    if (!account?.school || !isTeacher || !window.confirm("ลบลิงก์เนื้อหาจากครูนี้?")) return;
    const { error } = await supabase.from("school_learning_links").delete().eq("school_code", account.school).eq("level", level).eq("subject", subject).eq("topic", row.topic).eq("slot", row.slot);
    if (error) { toast.error("ลบลิงก์ไม่สำเร็จ"); return; }
    setTeacherLinks(rows => rows.filter(r => r.topic !== row.topic || r.slot !== row.slot));
  }

  async function save(topic: string) {
    const url = draft.trim();
    if (!isHttpUrl(url)) { toast.error("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://"); return; }
    setSaving(true);
    const { error } = await supabase.from("learning_links").upsert({ level, subject, topic, url, updated_at: new Date().toISOString(), updated_by: account?.id ?? null });
    setSaving(false);
    if (error) { toast.error("บันทึกลิงก์ไม่สำเร็จ"); return; }
    setLinks((m) => new Map(m).set(topic, url));
    setEditing(null);
    toast.success("บันทึกลิงก์แล้ว");
  }

  const hasResource = (topic: string) => links.has(topic) || teacherLinks.some(r => r.topic === topic);
  const total = a.topics.length, have = a.topics.filter((t) => hasResource(t.topic)).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
      <h2 className="font-display text-xl">แหล่งเรียนรู้รายเรื่อง ({total} เรื่อง)</h2>
      <p className="text-sm text-muted-foreground">มีแหล่งเรียนรู้แล้ว {have}/{total} เรื่อง</p>
      {loadError && <p role="alert" className="mt-2 text-sm text-destructive">โหลดลิงก์ไม่สำเร็จ กรุณาลองเปิดหน้านี้ใหม่</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(new Set(a.strands.map((x) => x.name)))}>ขยายทั้งหมด</Button>
        <Button variant="outline" size="sm" onClick={() => setOpen(new Set())}>ยุบทั้งหมด</Button>
      </div>
      <div className="mt-2 space-y-2">
        {a.strands.map((s) => {
          const ts = a.topics.filter((t) => t.strand === s.name);
          if (!ts.length) return null;
          const isOpen = open.has(s.name);
          const n = ts.filter((t) => hasResource(t.topic)).length;
          return (
            <div key={s.name} className="overflow-hidden rounded-xl border border-border">
              <Button variant="ghost" type="button" aria-expanded={isOpen} onClick={() => setOpen((o) => { const x = new Set(o); if (x.has(s.name)) x.delete(s.name); else x.add(s.name); return x; })}
                className="flex h-auto w-full items-center gap-3 whitespace-normal bg-secondary/60 px-3 py-3 text-left transition hover:bg-secondary">
                <ChevronRight className={cn("h-5 w-5 shrink-0 text-primary transition-transform", isOpen && "rotate-90")} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{ts.length} เรื่อง · มีแหล่งเรียนรู้ {n}</p>
                </div>
              </Button>
              {isOpen && (
                <div className="space-y-2 p-3">
                  <Link to="/learn/$level/$subject/$strand" params={{ level, subject, strand: String(s.index) }}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline">
                    <BookOpen className="h-4 w-4" /> สรุปเนื้อหาสาระนี้
                  </Link>
                  <ol className="grid gap-1.5 sm:grid-cols-2">
                    {ts.map((t) => {
                      const url = links.get(t.topic);
                      const schoolRows = teacherLinks.filter(r => r.topic === t.topic);
                      const nextSlot = [1, 2, 3].find(slot => !schoolRows.some(r => r.slot === slot));
                      return (
                        <li key={t.topic} className="flex flex-col gap-2 rounded-xl bg-secondary/60 px-3 py-3">
                          <p className="font-semibold">{t.topic}</p>
                          {editing === t.topic ? (
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="วางลิงก์ เช่น https://..." aria-label={`ลิงก์ ${t.topic}`}
                                onKeyDown={(e) => { if (e.key === "Enter") void save(t.topic); }} />
                              <div className="flex gap-2">
                                <Button size="sm" disabled={saving} onClick={() => void save(t.topic)}>ตกลง</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>ยกเลิก</Button>
                              </div>
                            </div>
                          ) : url ? (
                            <Button asChild variant="outline" className="min-h-11 h-auto w-full border-2 border-primary bg-card px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
                              <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink /> เนื้อหาจากระบบ</a>
                            </Button>
                          ) : (
                            <span aria-disabled className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground">
                              <Link2 className="h-4 w-4" /> ยังไม่มีแหล่งเรียนรู้
                            </span>
                          )}
                          {isAdmin && editing !== t.topic && (
                            <Button size="sm" variant="secondary" className="self-start" onClick={() => { setEditing(t.topic); setDraft(url ?? ""); }}>
                              {url ? <><Pencil /> แก้ไขลิงก์</> : <><Link2 /> เพิ่มลิงก์</>}
                            </Button>
                          )}
                          {schoolRows.map(row => <div key={row.slot} className="flex items-center gap-1">
                            <Button asChild variant="outline" className={cn("h-auto min-h-11 flex-1 whitespace-normal border-2 bg-card text-sm", TEACHER_TONES[row.slot - 1])}><a href={row.url} target="_blank" rel="noopener noreferrer"><ExternalLink />เนื้อหาจากครู {row.slot}</a></Button>
                            {isTeacher && <><Button size="icon" variant="ghost" aria-label={`แก้ไขเนื้อหาจากครู ${row.slot} ${t.topic}`} onClick={() => { setTeacherEditing({ topic: t.topic, slot: row.slot }); setTeacherDraft(row.url); }}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label={`ลบเนื้อหาจากครู ${row.slot} ${t.topic}`} onClick={() => void removeTeacherLink(row)}><Trash2 className="size-4" /></Button></>}
                          </div>)}
                          {isTeacher && teacherEditing?.topic === t.topic ? <div className="space-y-2">
                            <Input aria-label={`ลิงก์จากครู ${t.topic}`} value={teacherDraft} onChange={e => setTeacherDraft(e.target.value)} placeholder="https://…" autoFocus />
                            <div className="flex gap-2"><Button size="sm" disabled={saving} onClick={() => void saveTeacherLink()}>บันทึกลิงก์</Button><Button size="sm" variant="ghost" onClick={() => setTeacherEditing(null)}>ยกเลิก</Button></div>
                          </div> : isTeacher && nextSlot !== undefined && <Button variant="secondary" size="sm" className="self-start" onClick={() => { setTeacherEditing({ topic: t.topic, slot: nextSlot }); setTeacherDraft(""); }}><Plus />เพิ่มลิงก์จากครู ({schoolRows.length}/3)</Button>}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
