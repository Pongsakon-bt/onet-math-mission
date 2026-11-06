import { Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { AccountChip } from "@/components/AccountChip";
import { BrandHomeLink } from "@/components/BrandHomeLink";
import type { Level } from "@/data/catalog";

const TABS: { to: "/p6" | "/m3"; short: string; full: string }[] = [
  { to: "/p6", short: "ป.6", full: "ประถมศึกษาปีที่ 6" },
  { to: "/m3", short: "ม.3", full: "มัธยมศึกษาปีที่ 3" },
];

export function SiteNav({ level }: { level?: Level }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4">
        <BrandHomeLink />
        <nav className="col-span-2 row-start-2 flex min-w-0 justify-center gap-1 sm:col-span-1 sm:row-start-auto">
          {TABS.map((t) => (
            <Link key={t.to} to={t.to}
              className="flex-1 rounded-full px-3 py-1.5 text-center text-sm font-semibold text-muted-foreground transition hover:bg-secondary data-[status=active]:bg-primary data-[status=active]:text-primary-foreground sm:flex-none">
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
