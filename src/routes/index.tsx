import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Calculator, BookOpen, Languages, FlaskConical, Clock } from "lucide-react";
import { exams, type Level } from "@/data/exams";
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
  useEffect(() => {
    for (const l of ["p6", "m3"] as const) {
      router.preloadRoute({ to: "/exam/$level", params: { level: l } }).catch(() => {});
      preloadExamImages(l, 15000);
    }
  }, [router]);

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto max-w-5xl px-4 pt-8 pb-4">
        <p className="font-display text-2xl text-primary">PRE O-NET<span className="text-highlight-strong">.</span></p>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-12">
        <h1 className="font-display text-3xl leading-tight sm:text-5xl">ฝึกทำข้อสอบ O-NET<br /><span className="marker">ข้อสอบจริง ทำบนจอได้</span></h1>
        <p className="mt-3 text-muted-foreground">เลือกระดับชั้นของนักเรียน</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <button key={l.level} onClick={() => setLevel(l.level)}
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
                const ready = s.key === "math";
                const body = (
                  <>
                    <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-primary-foreground", s.color)}><I className="h-7 w-7" /></span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-lg font-semibold", s.text)}>{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        รหัสวิชา {s.code[level]} · {ready ? `${exams[level].questions.length} ข้อ · ${exams[level].minutes} นาที` : "รอไฟล์ข้อสอบปี 2568"}
                      </p>
                    </div>
                    {ready ? <ArrowRight className={cn("h-5 w-5 shrink-0", s.text)} /> : <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />}
                  </>
                );
                const cls = "flex items-center gap-3 rounded-2xl border-2 bg-card p-4 transition";
                return ready ? (
                  <Link key={s.key} to="/exam/$level" params={{ level }} className={cn(cls, "border-subj-math hover:-translate-y-0.5 shadow-paper")}>{body}</Link>
                ) : (
                  <div key={s.key} className={cn(cls, "border-dashed border-border opacity-70")} aria-disabled>{body}</div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
