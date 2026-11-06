import type React from "react";
import { Calculator, BookOpen, Languages, FlaskConical } from "lucide-react";
import type { Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";

export const SUBJECTS = [
  { key: "math", name: "คณิตศาสตร์", icon: Calculator, color: "bg-subj-math", text: "text-subj-math", code: { p6: "64", m3: "94" } },
  { key: "thai", name: "ภาษาไทย", icon: BookOpen, color: "bg-subj-thai", text: "text-subj-thai", code: { p6: "61", m3: "91" } },
  { key: "eng", name: "ภาษาอังกฤษ", icon: Languages, color: "bg-subj-eng", text: "text-subj-eng", code: { p6: "63", m3: "93" } },
  { key: "sci", name: "วิทยาศาสตร์", icon: FlaskConical, color: "bg-subj-sci", text: "text-subj-sci", code: { p6: "65", m3: "95" } },
] as const;

export const subjectUi = (s: Subject) => SUBJECTS.find((x) => x.key === s)!;

/** Page background per level: ป.6 blue, ม.3 orange. */
export const LEVEL_BG: Record<Level, string> = { p6: "bg-level-p6", m3: "bg-level-m3" };
export const LEVEL_SHORT: Record<Level, string> = { p6: "ป.6", m3: "ม.3" };

export const isLevel = (v: string): v is Level => v === "p6" || v === "m3";
export const isSubject = (v: string): v is Subject => ["math", "thai", "eng", "sci"].includes(v);

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  };
}

/** CSS variables that recolour buttons/highlights (primary) to the subject colour inside exam screens. */
export const subjectVars = (s: Subject) =>
  ({ "--primary": `var(--subj-${s})`, "--ring": `var(--subj-${s})` }) as React.CSSProperties;
