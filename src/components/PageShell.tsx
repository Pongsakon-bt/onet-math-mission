import { BrandHomeLink } from "@/components/BrandHomeLink";
import type { ReactNode } from "react";
import type { Subject } from "@/data/exam-types";
import { subjectVars } from "@/components/subject-ui";
import { SiteNav } from "@/components/SiteNav";
import type { Level } from "@/data/catalog";

/** Full-height shell with the PRE O-NET header; children fill the rest. With `subject`, accents use the subject colour. */
export function PageShell({ title, sub, subject, children, navigation = false, level }: { title: string; sub?: string; subject?: Subject; children: ReactNode; navigation?: boolean; level?: Level }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background" style={subject ? subjectVars(subject) : undefined}>
      {navigation ? <div className="shrink-0"><SiteNav level={level} /></div> : <div className="shrink-0 border-b border-border bg-background [@media(max-height:500px)]:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4">
          <BrandHomeLink compact />
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-semibold leading-tight">{title}</p>
            {sub && <p className="hidden truncate text-xs text-muted-foreground sm:block">{sub}</p>}
          </div>
        </div>
      </div>}
      {children}
    </div>
  );
}
