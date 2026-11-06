import { Link } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/session";

/** Header chip: sign-in link, or the signed-in name (+ teacher page link) with sign-out. */
export function AccountChip({ tone = "default" }: { tone?: "default" | "navigation" }) {
  const acc = useAccount();
  const chip = tone === "navigation"
    ? "inline-flex min-w-0 items-center gap-1.5 rounded-md bg-nav-action px-3 py-2 text-sm font-semibold text-nav-action-foreground transition-opacity hover:opacity-90"
    : "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold";
  if (acc === undefined) return null;
  if (!acc) return <Link to="/login" className={chip}><UserRound className="h-4 w-4" /> เข้าสู่ระบบ</Link>;
  return (
    <span className="inline-flex items-center gap-2">
      {acc.role === "teacher"
        ? <Link to="/teacher" className={chip}><UserRound className="h-4 w-4" /> หน้าครู</Link>
        : <span className={chip}><UserRound className="h-4 w-4 shrink-0" /> <span className="max-w-24 truncate">{acc.first}</span></span>}
      <button aria-label="ออกจากระบบ" onClick={() => supabase.auth.signOut()} className={tone === "navigation" ? "rounded-md p-2 text-nav-muted hover:bg-nav-hover hover:text-nav-text" : "rounded-full border border-border bg-card p-2"}><LogOut className="h-4 w-4" /></button>
    </span>
  );
}
