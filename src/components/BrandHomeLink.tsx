import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/cool-quiz-logo.webp";

export function BrandHomeLink({ compact = false, showName = false }: { compact?: boolean; showName?: boolean }) {
  return (
    <Link to="/" aria-label="COOL QUIZ : O-NET — กลับหน้าหลัก" title="กลับหน้าหลัก"
      className="inline-flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <img src={logoUrl} alt="COOL QUIZ : O-NET" width={320} height={208} decoding="async"
        className={compact ? "h-8 w-auto shrink-0 object-contain sm:h-10" : "h-14 w-auto shrink-0 object-contain sm:h-16"} />
      {showName && <span className="font-display text-xs font-medium leading-tight sm:text-sm">COOL QUIZ : O-NET</span>}
    </Link>
  );
}