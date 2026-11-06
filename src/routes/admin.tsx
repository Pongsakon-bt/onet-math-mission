import { listMissingDrills, prefillDrill } from "@/lib/drill.functions";
import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, KeyRound, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { adminMoveSchool } from "@/lib/classes.functions";
import { adminViewAs, adminDeleteUser, adminGradeEssay, adminOverview, adminResetPassword, amIAdmin } from "@/lib/admin.functions";
import { SUBJECT_NAMES } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => {
    const title = "ผู้ดูแลระบบ · PRE O-NET";
    const description = "ภาพรวมทุกโรงเรียน ผู้ใช้ คะแนน และข้อเขียน สำหรับผู้ดูแลระบบ";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: AdminPage,
});

type Tab = "schools" | "users" | "essays";

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const check = useServerFn(amIAdmin);
  const load = useServerFn(adminOverview);
  const auth = useQuery({ queryKey: ["am-i-admin"], queryFn: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session ? check() : false;
  } });
  const q = useQuery({ queryKey: ["admin-overview"], queryFn: () => load(), enabled: auth.data === true });
  const [tab, setTab] = useState<Tab>("schools");
  const [school, setSchool] = useState<string>("");
  const [search, setSearch] = useState("");

  const signOut = async () => { qc.clear(); await supabase.auth.signOut(); navigate({ to: "/login", replace: true }); };

  if (auth.isLoading) return <PageShell title="ผู้ดูแลระบบ"><p className="p-6 text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p></PageShell>;
  if (!auth.data) return (
    <PageShell title="ผู้ดูแลระบบ">
      <div className="mx-auto max-w-md space-y-3 p-6 text-center">
        <p>หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
        <Link to="/login" className="underline">เข้าสู่ระบบ</Link>
      </div>
    </PageShell>
  );

  const d = q.data;
  return (
    <PageShell title="ผู้ดูแลระบบ">
      <div className="mx-auto max-w-6xl space-y-5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 font-display text-2xl"><ShieldCheck className="h-6 w-6 text-primary" />ผู้ดูแลระบบ</div>
          <Button variant="outline" size="sm" onClick={signOut}><LogOut className="mr-1 h-4 w-4" />ออกจากระบบ</Button>
        </div>
        <DrillPrefill />
        {q.isLoading || !d ? <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p> : (
          <AdminBody d={d} tab={tab} setTab={setTab} school={school} setSchool={setSchool} search={search} setSearch={setSearch}
            refresh={() => qc.invalidateQueries({ queryKey: ["admin-overview"] })} />
        )}
      </div>
    </PageShell>
  );
}

function DrillPrefill() {
  const list = useServerFn(listMissingDrills);
  const fill = useServerFn(prefillDrill);
  const [st, setSt] = useState<{ total: number; left: number; done: number; fail: number; running: boolean } | null>(null);
  const stop = useRef(false);
  const refresh = async () => { const r = await list(); setSt((s) => ({ total: r.total, left: r.missing.length, done: s?.done ?? 0, fail: s?.fail ?? 0, running: false })); return r; };
  useEffect(() => { refresh(); }, []);
  const run = async () => {
    stop.current = false;
    const r = await refresh();
    const queue = [...r.missing];
    setSt((s) => s && { ...s, running: true });
    const worker = async () => {
      while (queue.length && !stop.current) {
        const t = queue.shift()!;
        let ok = false;
        try { ok = (await fill({ data: t })).ok; } catch { ok = false; }
        setSt((s) => s && { ...s, left: ok ? s.left - 1 : s.left, done: s.done + (ok ? 1 : 0), fail: s.fail + (ok ? 0 : 1) });
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    await refresh();
  };
  if (!st) return null;
  const ready = st.total - st.left;
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">ข้อสอบย่อยรายเรื่องที่พร้อมใช้: {ready} / {st.total} เรื่อง</p>
          <p className="text-sm text-muted-foreground">{st.running ? `กำลังเตรียม... สำเร็จ ${st.done} · ไม่สำเร็จ ${st.fail} (เปิดหน้านี้ค้างไว้)` : st.left ? `เหลือ ${st.left} เรื่องที่ยังต้องรอโหลดครั้งแรก` : "ครบทุกเรื่องแล้ว เปิดได้ทันที"}</p>
        </div>
        {st.running ? <Button variant="outline" onClick={() => { stop.current = true; }}>หยุด</Button>
          : st.left > 0 && <Button onClick={run}>เตรียมข้อสอบทุกเรื่อง</Button>}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${(ready / st.total) * 100}%` }} /></div>
    </div>
  );
}

type Data = Awaited<ReturnType<typeof adminOverview>>;

function AdminBody({ d, tab, setTab, school, setSchool, search, setSearch, refresh }: {
  d: Data; tab: Tab; setTab: (t: Tab) => void; school: string; setSchool: (s: string) => void;
  search: string; setSearch: (s: string) => void; refresh: () => void;
}) {
  const roleOf = useMemo(() => new Map(d.roles.map((r) => [r.user_id, r.role])), [d.roles]);
  const schoolName = useMemo(() => new Map(d.schools.map((s) => [s.code, s])), [d.schools]);
  const nameOf = useMemo(() => new Map(d.profiles.map((p) => [p.id, p])), [d.profiles]);
  const pending = d.essays.filter((e) => e.score == null).length;

  const schoolRows = d.schools.map((s) => {
    const ps = d.profiles.filter((p) => p.school_code === s.code);
    const ids = new Set(ps.map((p) => p.id));
    const at = d.attempts.filter((a) => ids.has(a.user_id) && a.pct != null);
    return {
      ...s,
      teachers: ps.filter((p) => roleOf.get(p.id) === "teacher").length,
      students: ps.filter((p) => roleOf.get(p.id) === "student").length,
      attempts: at.length,
      avg: at.length ? Math.round(at.reduce((n, a) => n + (a.pct ?? 0), 0) / at.length) : null,
    };
  }).sort((a, b) => b.students - a.students);

  const users = d.profiles.filter((p) => (!school || p.school_code === school)
    && (!search || `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())));
  const essays = d.essays.filter((e) => !school || nameOf.get(e.user_id)?.school_code === school);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="โรงเรียนที่ใช้งาน" value={d.schools.length} />
        <Kpi label="ครู" value={d.roles.filter((r) => r.role === "teacher").length} />
        <Kpi label="นักเรียน" value={d.roles.filter((r) => r.role === "student").length} />
        <Kpi label="ครั้งที่ทำข้อสอบ" value={d.attempts.length} />
        <Kpi label="ข้อเขียนรอตรวจ" value={pending} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["schools", "users", "essays"] as Tab[]).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t === "schools" ? "โรงเรียน" : t === "users" ? "ผู้ใช้" : `ข้อเขียน (${pending})`}
          </Button>
        ))}
        {school && (
          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
            {schoolName.get(school)?.name ?? school}
            <button className="underline" onClick={() => setSchool("")}>ล้าง</button>
          </span>
        )}
      </div>

      {tab === "schools" && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr>
              <th className="p-3">โรงเรียน</th><th className="p-3">จังหวัด</th><th className="p-3 text-right">ครู</th>
              <th className="p-3 text-right">นักเรียน</th><th className="p-3 text-right">ทำข้อสอบ</th><th className="p-3 text-right">เฉลี่ย</th><th />
            </tr></thead>
            <tbody>
              {schoolRows.map((s) => (
                <tr key={s.code} className="border-t border-border">
                  <td className="p-3"><div className="font-semibold">{s.name}</div><div className="text-xs text-muted-foreground">{s.code}</div></td>
                  <td className="p-3">{s.province ?? "-"}</td>
                  <td className="p-3 text-right">{s.teachers}</td><td className="p-3 text-right">{s.students}</td>
                  <td className="p-3 text-right">{s.attempts}</td><td className="p-3 text-right">{s.avg == null ? "-" : `${s.avg}%`}</td>
                  <td className="p-3 text-right"><Button size="sm" variant="outline" onClick={() => { setSchool(s.code); setTab("users"); }}>ดูผู้ใช้</Button></td>
                </tr>
              ))}
              {!schoolRows.length && <tr><td className="p-6 text-center text-muted-foreground" colSpan={7}>ยังไม่มีโรงเรียนใช้งาน</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          <Input placeholder="ค้นหาชื่อ" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <div className="space-y-2">
            {users.map((p) => (
              <UserRow key={p.id} p={p} role={roleOf.get(p.id) ?? "-"} school={schoolName.get(p.school_code)?.name ?? p.school_code}
                attempts={d.attempts.filter((a) => a.user_id === p.id)} onChanged={refresh} />
            ))}
            {!users.length && <p className="text-muted-foreground">ไม่พบผู้ใช้</p>}
          </div>
        </div>
      )}

      {tab === "essays" && (
        <div className="space-y-3">
          {essays.map((e) => (
            <EssayCard key={`${e.attempt_id}-${e.qid}`} e={e} who={nameOf.get(e.user_id)} school={schoolName.get(nameOf.get(e.user_id)?.school_code ?? "")?.name} onSaved={refresh} />
          ))}
          {!essays.length && <p className="text-muted-foreground">ยังไม่มีข้อเขียน</p>}
        </div>
      )}
    </>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-3xl">{value}</div></div>;
}

function UserRow({ p, role, school, attempts, onChanged }: {
  p: Data["profiles"][number]; role: string; school: string; attempts: Data["attempts"]; onChanged: () => void;
}) {
  const reset = useServerFn(adminResetPassword);
  const del = useServerFn(adminDeleteUser);
  const viewAs = useServerFn(adminViewAs);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="text-left" onClick={() => setOpen(!open)}>
          <div className="font-semibold">{p.first_name} {p.last_name} <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs">{role === "teacher" ? "ครู" : role === "student" ? "นักเรียน" : role}</span></div>
          <div className="text-xs text-muted-foreground">{school} · ทำข้อสอบ {attempts.length} ครั้ง</div>
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={async () => {
            if (!confirm(`เข้าดูในมุมมองของ ${p.first_name} ${p.last_name}? (จะออกจากบัญชีแอดมิน ต้องเข้าแอดมินใหม่ภายหลัง)`)) return;
            const r = await viewAs({ data: { userId: p.id } });
            if (!r.ok) return setMsg(r.error);
            await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
            navigate({ to: role === "teacher" ? "/teacher" : "/dashboard", search: role === "teacher" ? undefined : { level: "p6", subject: "math" } } as never);
          }}><Eye className="mr-1 h-4 w-4" />ดูมุมมอง{role === "teacher" ? "ครู" : "นักเรียน"}</Button>
          <Input type="text" placeholder="รหัสผ่านใหม่" value={pw} onChange={(e) => setPw(e.target.value)} className="h-8 w-36" />
          <Button size="sm" variant="outline" onClick={async () => {
            const r = await reset({ data: { userId: p.id, password: pw } });
            setMsg(r.ok ? "ตั้งรหัสผ่านใหม่แล้ว" : r.error); if (r.ok) setPw("");
          }}><KeyRound className="mr-1 h-4 w-4" />ตั้งรหัส</Button>
          <Button size="sm" variant="outline" onClick={async () => {
            const code = prompt(`ย้าย ${p.first_name} ${p.last_name} ไปโรงเรียนอื่น — ใส่รหัสโรงเรียน 10 หลัก`);
            if (!code) return;
            const r = await adminMoveSchool({ data: { userId: p.id, school: code } });
            if (r.ok) { setMsg(`ย้ายไปโรงเรียน${r.name}แล้ว`); onChanged(); } else setMsg(r.error);
          }}>ย้ายโรงเรียน</Button>
          <Button size="sm" variant="destructive" onClick={async () => {
            if (!confirm(`ลบบัญชี ${p.first_name} ${p.last_name} และผลสอบทั้งหมด?`)) return;
            const r = await del({ data: { userId: p.id } });
            if (r.ok) onChanged(); else setMsg(r.error);
          }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
      {open && (
        <ul className="mt-3 space-y-1 border-t border-border pt-2 text-sm">
          {attempts.map((a, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>{a.label} · {SUBJECT_NAMES[a.subject as Subject] ?? a.subject} {a.level === "p6" ? "ป.6" : "ม.3"}</span>
              <span className="text-muted-foreground">{a.pct == null ? "-" : `${a.pct}%`} · {new Date(a.at).toLocaleDateString("th-TH")}</span>
            </li>
          ))}
          {!attempts.length && <li className="text-muted-foreground">ยังไม่มีผลสอบ</li>}
        </ul>
      )}
    </div>
  );
}

function EssayCard({ e, who, school, onSaved }: {
  e: Data["essays"][number]; who: Data["profiles"][number] | undefined; school: string | undefined; onSaved: () => void;
}) {
  const grade = useServerFn(adminGradeEssay);
  const [score, setScore] = useState(e.score == null ? "" : String(e.score));
  const [comment, setComment] = useState(e.comment ?? "");
  const [msg, setMsg] = useState("");
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{who ? `${who.first_name} ${who.last_name}` : "-"} · {school ?? "-"} · ข้อ {e.no} · เต็ม {e.max_points}</div>
      <p className="text-sm font-semibold">{e.prompt}</p>
      <p className="whitespace-pre-wrap rounded-lg bg-secondary p-3 text-sm">{e.answer || "(ไม่ได้ตอบ)"}</p>
      <div className="flex flex-wrap gap-2">
        <Input type="number" min={0} max={Number(e.max_points)} value={score} onChange={(x) => setScore(x.target.value)} className="h-9 w-24" placeholder="คะแนน" />
        <Input value={comment} onChange={(x) => setComment(x.target.value)} className="h-9 flex-1" placeholder="ความเห็น" />
        <Button size="sm" onClick={async () => {
          const r = await grade({ data: { attemptId: e.attempt_id, qid: e.qid, score: score === "" ? null : Number(score), comment } });
          setMsg(r.ok ? "บันทึกแล้ว" : r.error); if (r.ok) onSaved();
        }}>บันทึก</Button>
      </div>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}
