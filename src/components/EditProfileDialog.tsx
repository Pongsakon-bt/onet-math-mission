import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GRADES, GRADE_NAMES } from "@/lib/assignments";
import { updateMyProfile } from "@/lib/classes.functions";
import type { Account } from "@/lib/session";

export function EditProfileDialog({ account }: { account: Account }) {
  const save = useServerFn(updateMyProfile);
  const student = account.role === "student";
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ first: account.first, last: account.last, grade: account.grade ?? "", room: account.room ?? "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const r = await save({ data: student ? f : { first: f.first, last: f.last } }).catch(() => ({ ok: false as const, error: "บันทึกไม่สำเร็จ" }));
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    window.location.reload();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="shrink-0 gap-1"><Pencil className="size-4" />แก้ไขข้อมูล</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>แก้ไขข้อมูลของฉัน</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>ชื่อ</Label><Input value={f.first} maxLength={60} onChange={(e) => setF({ ...f, first: e.target.value })} /></div>
            <div className="space-y-1"><Label>นามสกุล</Label><Input value={f.last} maxLength={60} onChange={(e) => setF({ ...f, last: e.target.value })} /></div>
          </div>
          {student && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>ระดับชั้น</Label>
                <select value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">เลือกชั้น</option>
                  {GRADES.map((g) => <option key={g} value={g}>{GRADE_NAMES[g]}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>ห้อง</Label><Input value={f.room} maxLength={10} placeholder="เช่น 1" onChange={(e) => setF({ ...f, room: e.target.value })} /></div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">ถ้าเปลี่ยนชื่อหรือนามสกุล ครั้งต่อไปให้เข้าสู่ระบบด้วยชื่อใหม่ (รหัสผ่านเดิม)</p>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <DialogFooter><Button type="submit" disabled={busy}>{busy ? "กำลังบันทึก…" : "บันทึก"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
