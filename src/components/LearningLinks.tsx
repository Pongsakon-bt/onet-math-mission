import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, ExternalLink, Link2, Pencil } from "lucide-react";
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

/** Learning resources per topic. Students open the link; only admins add/edit links (RLS enforces it). */
export function LearningLinks({ level, subject }: { level: Level; subject: Subject }) {
  const a = useMemo(() => analyzeSubject(level, subject), [level, subject]);
  const account = useAccount();
  const isAdmin = account?.role === "admin";
  const [links, setLinks] = useState<Map<string, string>>(new Map());
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    void supabase.from("learning_links").select("topic, url").eq("level", level).eq("subject", subject)
      .then(({ data }) => { if (live) setLinks(new Map((data ?? []).map((r) => [r.topic, r.url]))); });
    return () => { live = false; };
  }, [level, subject]);

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

  const total = a.topics.length, have = a.topics.filter((t) => links.has(t.topic)).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-paper sm:p-6">
      <h2 className="font-display text-xl">แหล่งเรียนรู้รายเรื่อง ({total} เรื่อง)</h2>
      <p className="text-sm text-muted-foreground">กดปุ่มเพื่อไปศึกษาเนื้อหาแต่ละเรื่อง · มีลิงก์แล้ว {have}/{total} เรื่อง{isAdmin ? " · คุณเป็นผู้ดูแลระบบ เพิ่มหรือแก้ไขลิงก์ได้" : ""}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(new Set(a.strands.map((x) => x.name)))} className="rounded-lg border border-border px-3 py-1 text-sm font-semibold hover:bg-secondary">ขยายทั้งหมด</button>
        <button type="button" onClick={() => setOpen(new Set())} className="rounded-lg border border-border px-3 py-1 text-sm font-semibold hover:bg-secondary">ยุบทั้งหมด</button>
      </div>
      <div className="mt-2 space-y-2">
        {a.strands.map((s) => {
          const ts = a.topics.filter((t) => t.strand === s.name);
          if (!ts.length) return null;
          const isOpen = open.has(s.name);
          const n = ts.filter((t) => links.has(t.topic)).length;
          return (
            <div key={s.name} className="overflow-hidden rounded-xl border border-border">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen((o) => { const x = new Set(o); if (x.has(s.name)) x.delete(s.name); else x.add(s.name); return x; })}
                className="flex w-full items-center gap-3 bg-secondary/60 px-3 py-3 text-left transition hover:bg-secondary">
                <ChevronRight className={cn("h-5 w-5 shrink-0 text-primary transition-transform", isOpen && "rotate-90")} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{ts.length} เรื่อง · มีแหล่งเรียนรู้ {n}</p>
                </div>
              </button>
              {isOpen && (
                <div className="space-y-2 p-3">
                  <Link to="/learn/$level/$subject/$strand" params={{ level, subject, strand: String(s.index) }}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline">
                    <BookOpen className="h-4 w-4" /> สรุปเนื้อหาสาระนี้
                  </Link>
                  <ol className="grid gap-1.5 sm:grid-cols-2">
                    {ts.map((t) => {
                      const url = links.get(t.topic);
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
                              <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink /> ไปศึกษาเรื่องนี้</a>
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
