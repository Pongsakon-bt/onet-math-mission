import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { AuthCard, Field, RolePicker, SchoolCodeField } from "@/components/AccountForm";
import { supabase } from "@/integrations/supabase/client";
import { accountEmail, isSchoolCode, MIN_PASSWORD, type Role } from "@/lib/account-id";
import { registerAccount } from "@/lib/accounts.functions";
import { uploadLocalAttempts } from "@/lib/session";

export const Route = createFileRoute("/register")({
  head: () => {
    const title = "สมัครใช้งาน · PRE O-NET";
    const description = "ครูและนักเรียนสมัครด้วยชื่อ นามสกุล และรหัสโรงเรียน สพฐ. 10 หลัก";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [f, setF] = useState({ first: "", last: "", school: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [okSchool, setOkSchool] = useState(false);
  const [opened, setOpened] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!f.first.trim() || !f.last.trim()) return setErr("กรุณากรอกชื่อและนามสกุล");
    if (!isSchoolCode(f.school)) return setErr("รหัสโรงเรียนต้องเป็นตัวเลข 10 หลัก");
    if (!okSchool) return setErr("กรุณากด \"ถูกต้องแล้ว กดตกลง\" เพื่อยืนยันโรงเรียน");
    if (f.password.length < MIN_PASSWORD) return setErr(`รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัว`);
    if (f.password !== f.confirm) return setErr("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
    setBusy(true);
    const res = await registerAccount({ data: { role, first: f.first, last: f.last, school: f.school, password: f.password } });
    if (!res.ok) { setBusy(false); return setErr(res.error); }
    const email = await accountEmail(role, f.first, f.last, f.school);
    await supabase.auth.signInWithPassword({ email, password: f.password });
    setBusy(false);
    if (role === "teacher") { setOpened(!!res.opened); setRecovery(res.recovery); }
    else { await uploadLocalAttempts().catch(() => {}); navigate({ to: "/" }); }
  };

  if (recovery) {
    return (
      <PageShell title="สมัครสำเร็จ">
        <AuthCard title="สมัครสำเร็จ">
          {opened && (
            <div className="mb-4 rounded-xl border-2 border-success bg-success/10 p-3">
              <p className="font-semibold text-success">🎉 เปิดระบบโรงเรียนของคุณแล้ว</p>
              <p className="text-sm">คุณเป็นครูคนแรกของโรงเรียนนี้ ระบบสร้างแดชบอร์ดโรงเรียนให้เรียบร้อย นักเรียนสมัครด้วยรหัสโรงเรียนเดียวกันได้ทันที</p>
            </div>
          )}
          <p>เก็บ <b>รหัสกู้คืน</b> นี้ไว้ ใช้ตั้งรหัสผ่านใหม่เมื่อลืมรหัสผ่าน ระบบจะแสดงให้เห็นครั้งเดียว</p>
          <p className="my-4 rounded-xl bg-secondary py-4 text-center font-display text-4xl tracking-[0.2em]">{recovery}</p>
          <Button size="lg" className="w-full" onClick={() => navigate({ to: "/teacher" })}>จดแล้ว ไปแดชบอร์ดโรงเรียน</Button>
        </AuthCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="สมัครใช้งาน">
      <AuthCard title="สมัครใช้งาน">
        <form onSubmit={submit} className="space-y-4">
          <RolePicker role={role} onChange={setRole} />
          <p className="text-sm text-muted-foreground">
            {role === "teacher" ? "ครูจะเห็นความคืบหน้าของนักเรียนทุกคนที่สมัครด้วยรหัสโรงเรียนเดียวกัน" : "ครูของโรงเรียนจะเห็นผลการทำข้อสอบของคุณ"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ชื่อ"><Input value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
            <Field label="นามสกุล"><Input value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
          </div>
          <SchoolCodeField value={f.school} onChange={(school) => setF({ ...f, school })} confirmed={okSchool} onConfirm={setOkSchool} />
          <Field label="รหัสผ่าน" hint={`อย่างน้อย ${MIN_PASSWORD} ตัว ใช้ตัวเลขล้วนได้`}>
            <Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          </Field>
          <Field label="ยืนยันรหัสผ่าน"><Input type="password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></Field>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "กำลังสมัคร..." : "สมัครใช้งาน"}</Button>
          <p className="text-center text-sm">มีบัญชีแล้ว? <Link to="/login" className="underline">เข้าสู่ระบบ</Link></p>
        </form>
      </AuthCard>
    </PageShell>
  );
}
