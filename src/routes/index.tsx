import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, BarChart3, ClipboardCheck, FileText, LogIn, School, Target } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SUBJECTS } from "@/components/subject-ui";
import { useAccount } from "@/lib/session";
import { canShowDashboard } from "@/lib/access";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COOL QUIZ : O-NET · เข้าสู่ระบบ" },
      {
        name: "description",
        content:
          "COOL QUIZ : O-NET ข้อสอบจริงย้อนหลัง ทำบนจอได้ พร้อมคำใบ้ ครูและนักเรียนสมัครด้วยชื่อ นามสกุล และรหัสโรงเรียน สพฐ. 10 หลัก",
      },
      { property: "og:title", content: "COOL QUIZ : O-NET" },
      {
        property: "og:description",
        content: "ข้อสอบจริงย้อนหลัง ทำบนจอได้ พร้อมคำใบ้ แดชบอร์ดของฉัน วเคราะห์และพัฒนา",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const STATS = [
  { n: "824", label: "ข้อสอบ" },
  { n: "32", label: "ชุด" },
  { n: "4", label: "ปีการศึกษา" },
  { n: "439", label: "เรื่อง" },
];

const STEPS = [
  { icon: Target, t: "เลือกชั้น", d: "ป.6 / ม.3" },
  { icon: ClipboardCheck, t: "เลือกวิชา", d: "ข้อสอบเต็มชุด · ข้อสอบย่อย" },
  { icon: FileText, t: "ทำข้อสอบ", d: "ข้อสอบจริงย้อนหลัง ทำบนจอได้ พร้อมคำใบ้" },
  { icon: BarChart3, t: "วเคราะห์และพัฒนา", d: "ความรู้แต่ละสาระ · เรื่องที่ควรเรียนต่อ" },
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
            <School className="h-3.5 w-3.5" /> PRE O-NET · ป.6 / ม.3
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
            ฝึก · <span className="marker">วัดพื้นฐาน</span> · สอบซ้ำ
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            ข้อสอบจริงย้อนหลัง ทำบนจอได้ พร้อมคำใบ้ ครบ 4 วิชา
            คณิตศาสตร์ ภาษาไทย ภาษาอังกฤษ วิทยาศาสตร์
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-nav-action px-6 py-4 text-base font-bold text-nav-action-foreground shadow-paper transition hover:opacity-90"
            >
              <LogIn className="h-5 w-5" /> เข้าสู่ระบบ
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-foreground/20 px-6 py-4 text-base font-semibold transition hover:bg-secondary"
            >
              สมัครใช้งาน <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            นักเรียนและครูเข้าสู่ระบบด้วยชื่อ นามสกุล และรหัสผ่าน
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

        <h2 className="mb-3 mt-10 font-display text-xl sm:text-2xl">เลือกวิชา</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUBJECTS.map((s) => {
            const I = s.icon;
            return (
              <div key={s.key} className="flex items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 shadow-paper">
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color} text-white`}>
                  <I className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className={`font-display text-lg ${s.text}`}>{s.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ข้อสอบเต็มชุด · ข้อสอบย่อย · วเคราะห์และพัฒนา
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mb-3 mt-10 font-display text-xl sm:text-2xl">เส นทาง</h2>
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
              <h2 className="font-display text-xl sm:text-2xl">ครูและโรงเรียน</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                ครูและนักเรียนสมัครด้วยชื่อ นามสกุล และรหัสโรงเรียน สพฐ. 10 หลัก
                ครูจะเห็นความคืบหน้าของนักเรียนทุกคนที่สมัครด้วยรหัสโรงเรียนเดียวกัน
                และเห็นผลการทำข้อสอบของคุณ
                นักเรียนที่ลืมรหัสผ่าน ให้แจ้งครูของโรงเรียน
                ครูจะตั้งรหัสผ่านใหม่ให้ได้จากหน้าครู
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-foreground/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
              >
                สมัครใช้งาน <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          COOL QUIZ : O-NET · แดชบอร์ดของฉัน · วเคราะห์และพัฒนา
        </p>
      </main>
    </div>
  );
}
