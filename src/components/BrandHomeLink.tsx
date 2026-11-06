import { Link } from "@tanstack/react-router";
import logo from "@/assets/cool-quiz-logo.png.asset.json";

export function BrandHomeLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" aria-label="COOL QUIZ : O-NET — กลับหน้าหลัก" title="กลับหน้าหลัก"
      className="inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <img src={logo.url} alt="COOL QUIZ : O-NET" width={1147} height={747}
        className={compact ? "h-10 w-auto object-contain sm:h-12" : "h-14 w-auto object-contain sm:h-16"} />
    </Link>
  );
}