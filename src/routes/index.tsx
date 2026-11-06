import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, BarChart3, ClipboardList, FileText, GraduationCap, LogIn, School, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SUBJECTS } from "@/components/subject-ui";
import { useAccount } from "@/lib/session";
import { canShowDashboard } from "@/lib/access";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COOL QUIZ : O-NET · ฝึกทำขอกสอบ O-NET ป.6 และ ม.3" },
      {
        name: "description",
        content:
          "COOL QUIZ : O-NET รวมขอสอบ O-NET ตัวจริง 824 ขอ 32 ชุด 4 ปการศึกษา ครบ 4 วิชา คณิต ภาษาไทย อังกฤษ วิทยาศาสตร พรอมแดชบอรดวเิคราะหจดทีควรพฒนา ตองเขาสระบบกอนจิงจะเห็นขอสอบ",
      },
      { property: "og:title", content: "COOL QUIZ : O-NET" },
      {
        property: "og:description",
        content: "ฝึกทำขอสอบ O-NET ป.6 และ ม.3 ดวยขอสอบตัวจริง 824 ขอ พรอมแดชบอรดวเิคราะหจดทีควรพฒนา",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const STATS = [
  { n: "824", label: "ขอสอบตัวจิง" },
  { n: "32", label: "ชุดขอสอบ" },
  { n: "4", label: "ปการศึกษา 2565–2568" },
  { n: "439", label: "หวัขอวเิคราะห" },
];

const SUBJECT_QUIZ: Record<string, { q: number; t: number; blurb: string }> = {
  math: { q: 140, t: 59, blurb: "พนืฐาน คณิต บัญญัตตรไิยางศ เรขาคณิต สถิต" },
  thai: { q: 208, t: 136, blurb: "อานเขยียน หลักภาษา วรรณคดี" },
  eng: { q: 256, t: 105, blurb: "ไวยากรณ ศัพท์ อานเขาใจ" },
  sci: { q: 220, t: 139, blurb: "ฟสิก เคมี ชววิทยา ดินและอวกาศ" },
};

const STEPS = [
  { icon: GraduationCap, t: "1. เลอกระดบ", d: "ป.6 หรือ ม.3 แลวเลอกวิชาทจะฝก" },
  { icon: ClipboardList, t: "2. ทำขอสอบ", d: "เลอกขอไดอิสระ ขามได พรอมคูใบระหวางทำ" },
  { icon: Sparkles, t: "3. ดวธิีทำ", d: "หลวสงคำตอบ ระบบ/show วธิีทำและคำใบ" },
  { icon: BarChart3, t: "4. วเิคราะห", d: "แดชบอรดบอกเรองทดี พอใช และตองตว" },
];

/** Signed-in users go straight to their dashboard; visitors see a public intro only — no exam content. */
function Index() {
  const account = useAccount();
  const navigate = useNavigate();
  useEffect(() => {
    if (canShowDashboard(account)) {
      void navigate({ to: "/dashboard", search: { level: "p6", subject: "math" }, replace: true });
    }
  }, [account, navigate]);

  return (
    <div className="level-grid-background min-h-dvh">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
        <section className="rounded-3xl border-2 border-foreground/15 bg-card p-6 shadow-paper sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
            <School className="h-3.5 w-3.5" /> ระบบฝกทำขอสอบ O-NET สำหรับโรงเรียน
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
            ฝกทำ <span className="marker">O-NET</span> ดวยขอสอบตัวจิง
            <br className="hidden sm:block" /> ครบทง ป.6 และ ม.3
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            รวมขอสอบจากแบบทดสอบจริง 4 วิชา 4 ปการศึกษา ทำบนจอไดเลอกขอไดอิสระ
            มีคูใบระหว่างทำ และแสดงวธิีทำหลังสงคำตอบ
            แดชบอรดชวยวาดานทควรตองพัฒนา
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-nav-action px-6 py-4 text-base font-bold text-nav-action-foreground shadow-paper transition hover:opacity-90"
            >
              <LogIn className="h-5 w-5" /> เขาสระบบเพอทำขอสอบ
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-foreground/20 px-6 py-4 text-base font-semibold transition hover:bg-secondary"
            >
              สมครใชงาน <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ตองเขาสระบบกอนจิงจะเห็นช้น วิชา และขอสอบ ทงหมด
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card px-4 py-3 text-center shadow-paper">
              <div className="font-display text-2xl sm:text-3xl">{s.n}</div>
              <div className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </section>

        <h2 className="mb-3 mt-10 font-display text-xl sm:text-2xl">4 วิชา ประจำระบบ</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUBJECTS.map((s) => {
            const I = s.icon;
            const info = SUBJECT_QUIZ[s.key];
            return (
              <div key={s.key} className="flex items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 shadow-paper">
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color} text-white`}>
                  <I className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className={`font-display text-lg ${s.text}`}>{s.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {info.q} ขอ · {info.t} หวัขอ
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{info.blurb}</p>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mb-3 mt-10 font-display text-xl sm:text-2xl">เส นทางการเร ยน</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => {
            const I = s.icon;
            return (
              <div key={s.t} className="rounded-2xl border border-border bg-card p-4 shadow-paper">
                <I className="h-5 w-5 text-primary" />
                <h3 className="mt-2 font-display text-base">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            );
          })}
        </div>

        <section className="mt-10 rounded-3xl border-2 border-foreground/15 bg-card p-6 shadow-paper sm:p-8">
          <div className="flex items-start gap-3">
            <FileText className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-display text-xl sm:text-2xl">สวนของครู และโรงเรียน</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                สมครดวยรหัสโรงเรียน 10 หลัก ของ สพฐ. แลวดแูดชบอรดรวมของโรงเรียน
                ดรูายชอื นกเรยี น รายวิชา และรายคน
                มอบหมายงานได และสงออกสรุปเป็น PDF ได
                ครูสามารถรีเซตรหัสผานนกเรยี นไดดวย
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-foreground/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
              >
                สมครโรงเรียน <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          COOL QUIZ : O-NET · ขอสอบทั้งหมดนำมาจากแบบทดสอบจริง ตองเขาสระบบกอนจิงจึงจะเห็น
        </p>
      </main>
    </div>
  );
}
