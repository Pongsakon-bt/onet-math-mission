import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, BarChart3, ClipboardCheck, Calculator, BookOpen, Languages, FlaskConical, Clock } from "lucide-react";
import { yearsFor, examKey, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { preloadExamImages } from "@/lib/preload-exam";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PRE O-NET ป.6 และ ม.3 · ฝึกทำข้อสอบจริงแบบโต้ตอบ" },
      { name: "description", content: "ระบบ PRE O-NET ฝึกทำข้อสอบ O-NET ป.6 และ ม.3 ทั้ง 4 วิชา คณิตศาสตร์ ภาษาไทย ภาษาอังกฤษ วิทยาศาสตร์ แบบโต้ตอบ" },
      { property: "og:title", content: "PRE O-NET ป.6 และ ม.3" },
      { property: "og:description", content: "ฝึกทำข้อสอบ O-NET 4 วิชา แบบโต้ตอบ พร้อมคำใบ้" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const SUBJECTS = [
  { key: "math", name: "คณิตศาสตร์", icon: Calculator, color: "bg-subj-math", text: "text-subj-math", code: { p6: "64", m3: "94" } },
  { key: "thai", name: "ภาษาไทย", icon: BookOpen, color: "bg-subj-thai", text: "text-subj-thai", code: { p6: "61", m3: "91" } },
  { key: "eng", name: "ภาษาอังกฤษ", icon: Languages, color: "bg-subj-eng", text: "text-subj-eng", code: { p6: "63", m3: "93" } },
  { key: "sci", name: "วิทยาศาสตร์", icon: FlaskConical, color: "bg-subj-sci", text: "text-subj-sci", code: { p6: "65", m3: "95" } },
] as const;

const LEVELS: { level: Level; short: string; full: string }[] = [
  { level: "p6", short: "ป.6", full: "ประถมศึกษาปีที่ 6" },
  { level: "m3", short: "ม.3", full: "มัธยมศึกษาปีที่ 3" },
];

function Index() {
  const router = useRouter();
  const [level, setLevel] = useState<Level | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  useEffect(() => {
    if (!level) return;
    for (const s of SUBJECTS) for (const e of yearsFor(level, s.key)) {
      const key = examKey(e);
      router.preloadRoute({ to: "/exam/$key", params: { key } }).catch(() => {});
      preloadExamImages(key, 15000);
    }
  }, [router, level]);

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto max-w-5xl px-4 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-2xl text-primary">PRE O-NET<span className="text-highlight-strong">.</span></p>
          <Link to="/dashboard" search={{ level: level ?? "p6", subject: subject ?? "math" }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold"><BarChart3 className="h-4 w-4" /> แดชบอร์ดของฉัน</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-12">
        <h1 className="font-display text-3xl leading-tight sm:text-5xl">ฝึกทำข้อสอบ O-NET<br /><span className="marker">ข้อสอบจริง ทำบนจอได้</span></h1>
        <p className="mt-3 text-muted-foreground">เลือกระดับชั้นของนักเรียน</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <button key={l.level} onClick={() => { setLevel(l.level); setSubject(null); }}
              className={cn("rounded-2xl border-2 bg-card p-5 text-left shadow-paper transition hover:-translate-y-0.5",
                level === l.level ? "border-primary ring-4 ring-primary/20" : "border-border")}>
              <span className="font-display text-5xl text-primary">{l.short}</span>
              <p className="mt-1 text-lg font-semibold">{l.full}</p>
              <p className="text-sm text-muted-foreground">4 วิชา</p>
            </button>
          ))}
        </div>

        {level && (
          <section className="animate-in fade-in mt-8">
            <h2 className="mb-3 font-display text-xl">เลือกวิชา · {LEVELS.find((l) => l.level === level)!.full}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUBJECTS.map((s) => {
                const I = s.icon;
                const sets = yearsFor(level, s.key);
                const open = subject === s.key;
                return (
                  <div key={s.key} className={cn("rounded-2xl border-2 bg-card shadow-paper transition", open ? "border-current" : "border-border", s.text)}>
                    <button onClick={() => setSubject(open ? null : s.key)} disabled={sets.length === 0}
                      className="flex w-full items-center gap-3 p-4 text-left disabled:opacity-60">
                      <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-primary-foreground", s.color)}><I className="h-7 w-7" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold">{s.name}</p>
                        <p className="text-sm text-muted-foreground">รหัสวิชา {s.code[level]} · {sets.length ? `${sets.length} ปี` : "กำลังเตรียมข้อสอบ"}</p>
                      </div>
                      {sets.length ? <ArrowRight className={cn("h-5 w-5 shrink-0 transition", open && "rotate-90")} /> : <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />}
                    </button>
                    {open && (
                      <div className="animate-in fade-in border-t border-border p-3">
                        <Link to="/diagnostic/$level/$subject" params={{ level, subject: s.key }} search={{ strand: undefined }}
                          className="mb-3 flex items-center gap-2 rounded-xl border-2 border-current px-3 py-2 font-semibold transition hover:bg-secondary">
                          <ClipboardCheck className="h-5 w-5" /> วัดความรู้พื้นฐาน
                          <span className="ml-auto text-xs font-normal text-muted-foreground">สุ่มจากทุกปี · ดูว่าเก่งเรื่องไหน</span>
                        </Link>
                        <Link to="/analysis/$level/$subject" params={{ level, subject: s.key }}
                          className="mb-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2 font-semibold transition hover:bg-secondary">
                          <BarChart3 className="h-5 w-5" /> วิเคราะห์ข้อสอบย้อนหลัง
                          <span className="ml-auto text-xs font-normal text-muted-foreground">ข้อไหนออกเรื่องอะไร · ควรติวอะไร</span>
                        </Link>
                        <p className="mb-2 text-sm font-medium text-foreground">เลือกปีการศึกษา</p>
                        <div className="flex flex-wrap gap-2">
                          {sets.map((e) => (
                            <Link key={e.year} to="/exam/$key" params={{ key: examKey(e) }}
                              className={cn("rounded-xl px-4 py-2 text-primary-foreground transition hover:opacity-90", s.color)}>
                              <span className="block font-display text-lg leading-tight">ปี {e.year}</span>
                              <span className="block text-xs opacity-90">{e.questions.length} ข้อ · {e.minutes} นาที</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
