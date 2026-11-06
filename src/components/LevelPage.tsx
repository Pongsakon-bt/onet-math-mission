import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Clock, Library, Lock, Target } from "lucide-react";
import { yearsFor, examKey, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { preloadExamImages } from "@/lib/preload-exam";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/SiteNav";
import { SUBJECTS } from "@/components/subject-ui";
import { loadAttempts } from "@/lib/progress";
import { attemptPct, preRound1 } from "@/lib/skill";
import bannerP6 from "@/assets/banner-p6.webp";
import bannerM3 from "@/assets/banner-m3.webp";

const INFO: Record<Level, { short: string; full: string; banner: string; tag: string }> = {
  p6: { short: "ป.6", full: "ประถมศึกษาปีที่ 6", banner: bannerP6, tag: "ข้อสอบจริงย้อนหลัง ทำบนจอได้ พร้อมคำใบ้" },
  m3: { short: "ม.3", full: "มัธยมศึกษาปีที่ 3", banner: bannerM3, tag: "เตรียมสอบ O-NET ม.3 ด้วยข้อสอบจริงหลายปี" },
};

export function LevelPage({ level }: { level: Level }) {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [pre, setPre] = useState<Record<string, number | null>>({});
  const info = INFO[level];

  useEffect(() => {
    const all = loadAttempts();
    setPre(Object.fromEntries(SUBJECTS.map((s) => { const a = preRound1(all, level, s.key); return [s.key, a ? attemptPct(a) : null]; })));
    for (const s of SUBJECTS) for (const e of yearsFor(level, s.key)) {
      const key = examKey(e);
      router.preloadRoute({ to: "/exam/$key", params: { key } }).catch(() => {});
      preloadExamImages(key, 15000);
    }
  }, [router, level]);

  return (
    <div className="level-grid-background min-h-dvh">
      <SiteNav level={level} />
      <main className="mx-auto max-w-5xl px-4 pb-12 pt-4">
        <section className="relative overflow-hidden rounded-3xl border border-border shadow-paper">
          <img src={info.banner} alt={`นักเรียนชั้น${info.full}`} width={1600} height={640} className="h-48 w-full object-cover sm:h-64" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-5 sm:p-8">
            <span className={cn("font-display text-5xl leading-none sm:text-6xl", level === "p6" ? "text-level-p6-strong" : "text-level-m3-strong")}>{info.short}</span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl">{info.full}</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">{info.tag}</p>
          </div>
        </section>

        <h2 className="mb-3 mt-6 font-display text-xl">เลือกวิชา</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUBJECTS.map((s) => {
            const I = s.icon;
            const sets = yearsFor(level, s.key);
            const open = subject === s.key;
            const score = pre[s.key] ?? null;
            const unlocked = score !== null;
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
                  <div className="animate-in fade-in grid grid-cols-2 gap-2 border-t border-border p-3">
                    <Link to="/bank/$level/$subject" params={{ level, subject: s.key }}
                      className={cn("flex min-h-36 flex-col justify-between rounded-xl p-3 text-primary-foreground transition hover:opacity-90", s.color)}>
                      <Library className="h-7 w-7" />
                      <div>
                        <p className="font-display text-lg leading-tight">PRE O-NET</p>
                        <p className="mt-1 text-xs opacity-90">{unlocked ? `ครั้งที่ 1 ได้ ${score}% · ทำรายปี/ครั้งที่ 2 ได้แล้ว` : "เริ่มที่ครั้งที่ 1 (40 ข้อ)"}</p>
                      </div>
                    </Link>
                    {unlocked ? (
                      <Link to="/develop/$level/$subject" params={{ level, subject: s.key }}
                        className="flex min-h-36 flex-col justify-between rounded-xl border-2 border-current bg-card p-3 transition hover:bg-secondary">
                        <Target className="h-7 w-7" />
                        <div>
                          <p className="font-display text-lg leading-tight">วิเคราะห์และพัฒนา</p>
                          <p className="mt-1 text-xs text-muted-foreground">สกิลรายเรื่อง · ข้อสอบย่อย</p>
                        </div>
                      </Link>
                    ) : (
                      <div aria-disabled className="flex min-h-36 flex-col justify-between rounded-xl border-2 border-dashed border-border bg-muted p-3 text-muted-foreground">
                        <Lock className="h-7 w-7" />
                        <div>
                          <p className="font-display text-lg leading-tight">วิเคราะห์และพัฒนา</p>
                          <p className="mt-1 text-xs">ทำ PRE O-NET ครั้งที่ 1 เพื่อปลดล็อก</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
