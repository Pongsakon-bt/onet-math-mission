import { topicStatus } from "@/lib/skill";
import { cn } from "@/lib/utils";

const UI = {
  none: { label: "ยังไม่มีผล", cls: "bg-secondary text-muted-foreground" },
  needs: { label: "ยังไม่ผ่าน", cls: "bg-destructive text-destructive-foreground" },
  fair: { label: "เกือบผ่าน", cls: "bg-highlight text-foreground" },
  pass: { label: "ผ่านแล้ว ✓", cls: "bg-subj-eng text-primary-foreground" },
  mastered: { label: "เชี่ยวชาญ ★", cls: "bg-highlight-strong text-foreground" },
} as const;

export function StatusPill({ skill, className }: { skill: number | null; className?: string }) {
  const u = UI[topicStatus(skill)];
  return <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", u.cls, className)}>{u.label}</span>;
}
