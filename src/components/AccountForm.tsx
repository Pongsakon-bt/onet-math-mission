import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isSchoolCode, type Role } from "@/lib/account-id";
import { lookupSchool } from "@/lib/accounts.functions";
import { supabase } from "@/integrations/supabase/client";

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
        <button key={r} type="button" onClick={() => onChange(r)} aria-pressed={role === r}
          className={cn("rounded-lg py-2 font-semibold transition", role === r ? "bg-nav-active text-nav-text shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {r === "student" ? "นักเรียน" : "ครู"}
        </button>
      ))}
    </div>
  );
}

type School = { name: string; amphoe: string | null; province: string | null; area: string | null };

/** 10-digit OBEC code input: once 10 digits are typed it looks up the school and asks the user to confirm it. */
export function SchoolCodeField({ value, onChange, confirmed, onConfirm }: { value: string; onChange: (v: string) => void; confirmed?: boolean; onConfirm?: (ok: boolean) => void }) {
  const [school, setSchool] = useState<School | null | "loading">(null);
  useEffect(() => {
    onConfirm?.(false);
    if (!isSchoolCode(value)) { setSchool(null); return; }
    let alive = true;
    setSchool("loading");
    lookupSchool({ data: { code: value } }).then((s) => alive && setSchool(s ?? null)).catch(() => alive && setSchool(null));
    return () => { alive = false; };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  const hint = !isSchoolCode(value) ? `รหัสสถานศึกษา สพฐ. 10 หลัก (พิมพ์แล้ว ${value.length}/10)`
    : school === "loading" ? "กำลังตรวจสอบโรงเรียน..."
    : !school ? <span className="text-destructive">ไม่พบรหัสนี้ในรายชื่อโรงเรียน สพฐ. ตรวจตัวเลขอีกครั้ง</span> : null;
  return (
    <Field label="รหัสโรงเรียน 10 หลัก" hint={hint}>
      <Input inputMode="numeric" maxLength={10} value={value} placeholder="เช่น 1055250290"
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))} />
      <SchoolSearch onPick={onChange} />
      {school && school !== "loading" && (
        <div className={cn("rounded-xl border-2 p-3 text-sm", confirmed ? "border-success bg-success/10" : "border-primary bg-secondary")}>
          <p className="text-xs text-muted-foreground">ใช่โรงเรียนนี้ไหม?</p>
          <p className="font-display text-lg leading-tight">โรงเรียน{school.name}</p>
          <p>อำเภอ{school.amphoe} จังหวัด{school.province}</p>
          {school.area && <p className="text-muted-foreground">{school.area}</p>}
          {onConfirm && (confirmed ? (
            <p className="mt-2 flex items-center justify-between font-semibold text-success">
              ✓ ยืนยันโรงเรียนแล้ว
              <button type="button" onClick={() => onConfirm(false)} className="text-xs font-normal text-muted-foreground underline">เปลี่ยน</button>
            </p>
          ) : (
            <button type="button" onClick={() => onConfirm(true)}
              className="mt-2 w-full rounded-lg bg-primary py-2 font-semibold text-primary-foreground">ถูกต้องแล้ว กดตกลง</button>
          ))}
        </div>
      )}
    </Field>
  );
}

export function AuthCard({ title, children, appearance = "default" }: { title: string; children: ReactNode; appearance?: "default" | "blue" }) {
  return (
    <main className={appearance === "blue" ? "login-blue-background min-h-0 flex-1 overflow-y-auto" : "min-h-0 flex-1 overflow-y-auto"}>
      <div className={appearance === "blue" ? "mx-auto max-w-lg px-4 py-8 sm:py-12" : "mx-auto max-w-md px-4 py-6"}>
        <div className={appearance === "blue" ? "auth-blue rounded-lg border border-border bg-card p-5 text-card-foreground sm:p-8" : "rounded-2xl border border-border bg-card p-5 shadow-paper sm:p-6"}>
          {appearance === "blue" && <p className="mb-2 text-center font-display text-2xl font-medium text-foreground sm:text-3xl">COOL QUIZ : O-NET</p>}
          <h1 className={appearance === "blue" ? "mb-6 text-center font-display text-lg text-muted-foreground" : "mb-4 font-display text-2xl"}>{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}

type Hit = { code: string; name: string; amphoe: string | null; province: string | null };
/** Find the OBEC code by typing the school name and (optionally) province. */
function SchoolSearch({ onPick }: { onPick: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [prov, setProv] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  useEffect(() => {
    const n = name.trim().replace(/^โรงเรียน/, "").replace(/[%,()]/g, ""), p = prov.trim().replace(/^จังหวัด/, "").replace(/[%,()]/g, "");
    if (n.length < 2) { setHits(null); return; }
    let alive = true;
    const t = setTimeout(async () => {
      let q = supabase.from("schools").select("code, name, amphoe, province").ilike("name", `%${n}%`).order("name").limit(20);
      if (p) q = q.ilike("province", `%${p}%`);
      const { data } = await q;
      if (alive) setHits((data ?? []) as Hit[]);
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [name, prov]);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-primary underline">🔍 ไม่รู้รหัส? ค้นหาจากชื่อโรงเรียน</button>;
  return (
    <div className="space-y-2 rounded-xl border border-border bg-secondary/50 p-3">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold">ค้นหารหัสโรงเรียน</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground underline">ปิด</button></div>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="ชื่อโรงเรียน" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="จังหวัด (ไม่บังคับ)" value={prov} onChange={(e) => setProv(e.target.value)} />
      </div>
      {hits === null ? <p className="text-xs text-muted-foreground">พิมพ์ชื่อโรงเรียนอย่างน้อย 2 ตัวอักษร</p>
        : !hits.length ? <p className="text-xs text-destructive">ไม่พบโรงเรียน ลองพิมพ์ชื่อสั้นลง หรือตรวจชื่อจังหวัด</p>
        : <ul className="max-h-56 divide-y divide-border overflow-y-auto rounded-lg bg-card">
            {hits.map((h) => (
              <li key={h.code}><button type="button" onClick={() => { onPick(h.code); setOpen(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-secondary">
                <b>โรงเรียน{h.name}</b> <span className="text-muted-foreground">· {h.amphoe ?? ""} จ.{h.province ?? ""}</span>
                <span className="block font-mono text-xs">{h.code}</span>
              </button></li>
            ))}
          </ul>}
    </div>
  );
}
