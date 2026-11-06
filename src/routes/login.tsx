import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { AuthCard, Field, RolePicker } from "@/components/AccountForm";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/account-id";
import { signInByName } from "@/lib/accounts.functions";
import { uploadLocalAttempts } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => {
    const title = "เข้าสู่ระบบ · COOL QUIZ : O-NET";
    const description = "นักเรียนและครูเข้าสู่ระบบด้วยชื่อ นามสกุล และรหัสผ่าน";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [f, setF] = useState({ first: "", last: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adm, setAdm] = useState({ user: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (adminMode) {
      if (!adm.user.trim() || !adm.password) return setErr("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      setBusy(true);
      const r = await signInByName({ data: { role: "teacher", first: adm.user, last: "", password: adm.password } }).catch(() => null);
      if (!r || !r.ok || !("admin" in r)) { setBusy(false); return setErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"); }
      const { error } = await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
      setBusy(false);
      if (error) return setErr("เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง");
      return navigate({ to: "/admin" });
    }
    const isAdmin = f.first.trim().toLowerCase() === "admin";
    if (!f.first.trim() || (!f.last.trim() && !isAdmin) || !f.password) return setErr("กรุณากรอกข้อมูลให้ครบ");
    setBusy(true);
    const res = await signInByName({ data: { role, first: f.first, last: f.last, password: f.password } }).catch(() => null);
    if (!res || !res.ok) { setBusy(false); return setErr(res?.error ?? "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง"); }
    const { error } = await supabase.auth.setSession({ access_token: res.access_token, refresh_token: res.refresh_token });
    setBusy(false);
    if (error) return setErr("เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง");
    if ("admin" in res && res.admin) navigate({ to: "/admin" });
    else if (role === "student") { await uploadLocalAttempts().catch(() => {}); navigate({ to: "/" }); }
    else navigate({ to: "/teacher" });
  };

  return (
    <PageShell navigation title="เข้าสู่ระบบ">
      <AuthCard title="เข้าสู่ระบบ" appearance="blue">
        <form onSubmit={submit} className="space-y-4">
          {adminMode ? (<>
            <p className="font-semibold">เข้าสู่ระบบผู้ดูแลระบบ</p>
            <Field label="ชื่อผู้ใช้"><Input autoComplete="username" value={adm.user} onChange={(e) => setAdm({ ...adm, user: e.target.value })} /></Field>
            <Field label="รหัสผ่าน"><Input type="password" autoComplete="current-password" value={adm.password} onChange={(e) => setAdm({ ...adm, password: e.target.value })} /></Field>
          </>) : (<>
          <RolePicker role={role} onChange={setRole} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="ชื่อ"><Input value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
            <Field label="นามสกุล"><Input value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
          </div>
          <Field label="รหัสผ่าน"><Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
          </>)}
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</Button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <Link to="/register" className="underline">สมัครใช้งาน</Link>
            <Button type="button" variant="link" className="h-auto p-0 text-muted-foreground underline" onClick={() => { setAdminMode(!adminMode); setErr(""); }}>{adminMode ? "กลับไปหน้านักเรียน/ครู" : "ผู้ดูแลระบบ"}</Button>
            <Link to="/forgot-password" className="text-muted-foreground underline">ลืมรหัสผ่าน</Link>
          </div>
        </form>
      </AuthCard>
    </PageShell>
  );
}
