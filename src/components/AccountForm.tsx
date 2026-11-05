import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isSchoolCode, type Role } from "@/lib/account-id";
import { lookupSchool } from "@/lib/accounts.functions";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function RolePicker({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
      {(["student", "teacher"] as const).map((r) => (
        <button key={r} type="button" onClick={() => onChange(r)}
          className={cn("rounded-lg py-2 font-semibold transition", role === r ? "bg-card shadow-sm" : "text-muted-foreground")}>
          {r === "student" ? "นักเรียน" : "ครู"}
        </button>
      ))}
    </div>
  );
}

/** 10-digit OBEC code input that shows the matching school name. */
export function SchoolCodeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [school, setSchool] = useState<{ name: string; amphoe: string | null; province: string | null } | null | "loading">(null);
  useEffect(() => {
    if (!isSchoolCode(value)) { setSchool(null); return; }
    let alive = true;
    setSchool("loading");
    lookupSchool({ data: { code: value } }).then((s) => alive && setSchool(s ?? null)).catch(() => alive && setSchool(null));
    return () => { alive = false; };
  }, [value]);
  const hint = !isSchoolCode(value) ? "รหัสสถานศึกษา สพฐ. 10 หลัก"
    : school === "loading" ? "กำลังค้นหาโรงเรียน..."
    : school ? <span className="font-semibold text-foreground">โรงเรียน{school.name} · {school.amphoe} {school.province}</span>
    : <span className="text-destructive">ไม่พบรหัสนี้ในรายชื่อโรงเรียน สพฐ.</span>;
  return (
    <Field label="รหัสโรงเรียน 10 หลัก" hint={hint}>
      <Input inputMode="numeric" maxLength={10} value={value} placeholder="เช่น 1010720040"
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))} />
    </Field>
  );
}

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-paper sm:p-6">
          <h1 className="mb-4 font-display text-2xl">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
