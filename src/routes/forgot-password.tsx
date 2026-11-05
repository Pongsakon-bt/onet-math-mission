import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { AuthCard, Field, RolePicker, SchoolCodeField } from "@/components/AccountForm";
import { MIN_PASSWORD, type Role } from "@/lib/account-id";
import { resetTeacherPassword } from "@/lib/accounts.functions";

export const Route = createFileRoute("/forgot-password")({
  head: () => {
    const title = "ลืมรหัสผ่าน · PRE O-NET";
    const description = "ตั้งรหัสผ่านใหม่สำหรับครูและนักเรียน";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: ForgotPage,
});

function ForgotPage() {
  const [role, setRole] = useState<Role>("teacher");
  const [f, setF] = useState({ first: "", last: "", school: "", recovery: "", password: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const res = await resetTeacherPassword({ data: f });
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: "ตั้งรหัสผ่านใหม่แล้ว เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย" } : { ok: false, text: res.error });
  };

  return (
    <PageShell title="ลืมรหัสผ่าน">
      <AuthCard title="ลืมรหัสผ่าน">
        <div className="space-y-4">
          <RolePicker role={role} onChange={setRole} />
          {role === "student" ? (
            <p>นักเรียนที่ลืมรหัสผ่าน ให้แจ้ง <b>ครูของโรงเรียน</b> ครูจะตั้งรหัสผ่านใหม่ให้ได้จากหน้าครู</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="ชื่อ"><Input value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
                <Field label="นามสกุล"><Input value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
              </div>
              <SchoolCodeField value={f.school} onChange={(school) => setF({ ...f, school })} />
              <Field label="รหัสกู้คืน 8 หลัก" hint="รหัสที่ได้ตอนสมัคร">
                <Input inputMode="numeric" maxLength={8} value={f.recovery} onChange={(e) => setF({ ...f, recovery: e.target.value.replace(/\D/g, "") })} />
              </Field>
              <Field label="รหัสผ่านใหม่" hint={`อย่างน้อย ${MIN_PASSWORD} ตัว`}>
                <Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
              </Field>
              {msg && <p className={msg.ok ? "text-sm text-primary" : "text-sm text-destructive"}>{msg.text}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>ตั้งรหัสผ่านใหม่</Button>
            </form>
          )}
          <p className="text-center text-sm"><Link to="/login" className="underline">กลับไปเข้าสู่ระบบ</Link></p>
        </div>
      </AuthCard>
    </PageShell>
  );
}
