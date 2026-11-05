import { Link } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/session";

/** Header chip: sign-in link, or the signed-in name (+ teacher page link) with sign-out. */
export function AccountChip() {
  const acc = useAccount();
  const chip = "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold";
  if (acc === undefined) return null;
  if (!acc) return <Link to="/login" className={chip}><UserRound className="h-4 w-4" /> เข้าสู่ระบบ</Link>;
  return (
    <span className="inline-flex items-center gap-2">
      {acc.role === "teacher"
        ? <Link to="/teacher" className={chip}><UserRound className="h-4 w-4" /> หน้าครู</Link>
        : <span className={chip}><UserRound className="h-4 w-4" /> {acc.first}</span>}
      <button aria-label="ออกจากระบบ" onClick={() => supabase.auth.signOut()} className="rounded-full border border-border bg-card p-2"><LogOut className="h-4 w-4" /></button>
    </span>
  );
}
