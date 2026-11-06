import { Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { AccountChip } from "@/components/AccountChip";
import { BrandHomeLink } from "@/components/BrandHomeLink";
import type { Level } from "@/data/catalog";
import { useAccount } from "@/lib/session";
import { canShowDashboard } from "@/lib/access";

const TABS: { to: "/p6" | "/m3"; short: string; full: string }[] = [
  { to: "/p6", short: "ป.6", full: "ประถมศึกษาปีที่ 6" },
  { to: "/m3", short: "ม.3", full: "มัธยมศึกษาปีที่ 3" },
];

export function SiteNav({ level }: { level?: Level }) {
  const account = useAccount();
  const signedIn = canShowDashboard(account);
  return (
    <header className="sticky top-0 z-30 border-b border-nav-hover bg-nav-surface text-nav-text">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-6">
        <div className="flex items-center gap-2">
          <BrandHomeLink compact showName />
        </div>
        <nav aria-label="เมนูหลัก" className="col-span-2 row-start-2 flex min-w-0 items-center justify-center gap-1 lg:col-span-1 lg:row-start-auto lg:gap-2">
          <Link to="/" activeOptions={{ exact: true }} className="rounded-md px-3 py-2 text-sm font-semibold text-nav-muted transition-colors hover:bg-nav-hover hover:text-nav-text data-[status=active]:bg-nav-active data-[status=active]:text-nav-text">หน้าหลัก</Link>
          {TABS.map((t) => (
            <Link key={t.to} to={t.to}
              className="rounded-md px-3 py-2 text-center text-sm font-semibold text-nav-muted transition-colors hover:bg-nav-hover hover:text-nav-text data-[status=active]:bg-nav-active data-[status=active]:text-nav-text">
              <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.full}</span>
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 items-center justify-end gap-2">
          {canShowDashboard(account) && <Link to="/dashboard" search={{ level: level ?? "p6", subject: "math" }} aria-label="แดชบอร์ดของฉัน"
            title="แดชบอร์ดของฉัน" className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold text-nav-muted transition-colors hover:bg-nav-hover hover:text-nav-text">
            <BarChart3 className="h-4 w-4" /><span className="hidden md:inline">แดชบอร์ดของฉัน</span>
          </Link>}
          <AccountChip tone="navigation" />
        </div>
      </div>
    </header>
  );
}
