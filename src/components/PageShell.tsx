import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/** Full-height shell with the PRE O-NET header; children fill the rest. */
export function PageShell({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border bg-background [@media(max-height:500px)]:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4">
          <Link to="/" className="font-display text-lg text-primary">PRE O-NET<span className="text-highlight-strong">.</span></Link>
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-semibold leading-tight">{title}</p>
            {sub && <p className="hidden truncate text-xs text-muted-foreground sm:block">{sub}</p>}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
