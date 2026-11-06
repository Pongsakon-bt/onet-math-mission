import { Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { AccountChip } from "@/components/AccountChip";
import type { Level } from "@/data/catalog";

const TABS: { to: "/p6" | "/m3"; short: string; full: string }[] = [
  { to: "/p6", short: "ป.6", full: "ประถมศึกษาปีที่ 6" },
  { to: "/m3", short: "ม.3", full: "มัธยมศึกษาปีที่ 3" },
];

export function SiteNav({ level }: { level?: Level }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-5xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 sm:gap-4">
        <Link to="/" className="font-display text-xl text-primary sm:text-2xl">PRE O-NET<span className="text-highlight-strong">.</span></Link>
        <nav className="flex min-w-0 justify-center gap-1">
          {TABS.map((t) => (
            <Link key={t.to} to={t.to}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}>
              <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.full}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" search={{ level: level ?? "p6", subject: "math" }} aria-label="แดชบอร์ดของฉัน"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold">
            <BarChart3 className="h-4 w-4" /><span className="hidden md:inline">แดชบอร์ดของฉัน</span>
          </Link>
          <AccountChip />
        </div>
      </div>
    </header>
  );
}
