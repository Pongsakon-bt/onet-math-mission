import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import bannerP6 from "@/assets/banner-p6.jpg";
import bannerM3 from "@/assets/banner-m3.jpg";
import { FileCheck2, Smartphone, Target, School, Lightbulb, TrendingUp } from "lucide-react";
import { SUBJECTS } from "@/components/subject-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COOL QUIZ : O-NET · ฝึกข้อสอบ O-NET จริง ป.6 และ ม.3" },
      { name: "description", content: "COOL QUIZ : O-NET ฝึกทำข้อสอบ O-NET ป.6 และ ม.3 ทั้ง 4 วิชา คณิตศาสตร์ ภาษาไทย ภาษาอังกฤษ วิทยาศาสตร์ แบบโต้ตอบ" },
      { property: "og:title", content: "COOL QUIZ : O-NET" },
      { property: "og:description", content: "ฝึกทำข้อสอบ O-NET 4 วิชา แบบโต้ตอบ พร้อมคำใบ้" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const LEVELS = [
  { to: "/p6" as const, short: "ป.6", full: "ประถมศึกษาปีที่ 6", img: bannerP6 },
  { to: "/m3" as const, short: "ม.3", full: "มัธยมศึกษาปีที่ 3", img: bannerM3 },
];

const FEATURES = [
  { icon: FileCheck2, title: "ข้อสอบจริง 824 ข้อ", text: "ข้อสอบ O-NET จริง 4 ปี (2565–2568) ครบ 4 วิชา ทั้ง ป.6 และ ม.3" },
  { icon: Smartphone, title: "ทำบนมือถือได้สบาย", text: "หน้าจอเดียว ไม่ต้องเลื่อน แตะข้ามข้อได้ ซูมดูรูปโจทย์ได้" },
  { icon: Lightbulb, title: "ใบ้ ไม่เฉลย", text: "ติดตรงไหนกดดูคำใบ้ได้ วิธีทำเต็มเปิดให้ดูหลังส่งคำตอบ" },
  { icon: Target, title: "รู้ว่าต้องติวเรื่องไหน", text: "แยกผลทุกเรื่องเป็น ดี · พอใช้ · ต้องติว จากการสอบครั้งแรก" },
  { icon: TrendingUp, title: "ฝึกรายเรื่อง 20 ข้อ", text: "แบบฝึกหลายรูปแบบต่อเรื่อง พร้อมคะแนนสกิล 0–100" },
  { icon: School, title: "ครูติดตามได้ทั้งโรงเรียน", text: "สมัครด้วยรหัสโรงเรียน 10 หลัก ครูเห็นคะแนนและตรวจข้อเขียนได้" },
];

const STEPS = [
  { n: "1", title: "เลือกชั้นและวิชา", text: "ป.6 หรือ ม.3 แล้วเลือก 1 ใน 4 วิชา" },
  { n: "2", title: "สอบ PRE O-NET ครั้งที่ 1", text: "40 ข้อ วัดพื้นฐาน ทำครั้งเดียว" },
  { n: "3", title: "ดูผลและฝึกเรื่องที่อ่อน", text: "ระบบบอกเรื่องที่ต้องติว แล้วฝึกทีละเรื่อง" },
  { n: "4", title: "สอบซ้ำ ดูพัฒนาการ", text: "ทำครั้งที่ 2 และข้อสอบจริงรายปี เทียบคะแนน" },
];

const STATS = [
  { v: "824", l: "ข้อสอบจริง" }, { v: "32", l: "ชุดข้อสอบ" }, { v: "4", l: "ปีการศึกษา" }, { v: "439", l: "เรื่องที่วิเคราะห์" },
];

function Index() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <section>
          <p className="font-semibold text-primary">COOL QUIZ : O-NET</p>
          <h1 className="mt-1 font-display text-3xl leading-tight sm:text-5xl">ฝึกข้อสอบ O-NET จริง<br /><span className="marker">รู้จุดอ่อน ติวตรงเรื่อง</span></h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">สำหรับนักเรียน ป.6 และ ม.3 ทำข้อสอบจริงบนมือถือ ระบบวิเคราะห์ให้ว่าเรื่องไหนเก่งแล้ว เรื่องไหนต้องฝึกเพิ่ม และครูติดตามผลได้ทั้งโรงเรียน</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <span key={s.key} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-primary-foreground ${s.color}`}><s.icon className="h-4 w-4" />{s.name}</span>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <Link key={l.to} to={l.to} className="group overflow-hidden rounded-2xl border-2 border-border bg-card shadow-paper transition hover:-translate-y-0.5 hover:border-primary">
              <img src={l.img} alt={`นักเรียนชั้น${l.full}`} width={1600} height={640} className="h-32 w-full object-cover" />
              <div className="flex items-end justify-between p-5">
                <div>
                  <span className="font-display text-5xl text-primary">{l.short}</span>
                  <p className="mt-1 text-lg font-semibold">{l.full}</p>
                </div>
                <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">เริ่มเลย →</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="font-display text-3xl text-primary">{s.v}</p>
              <p className="text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl sm:text-3xl">ทำไมต้อง COOL QUIZ</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-paper">
                <f.icon className="h-7 w-7 text-primary" />
                <p className="mt-2 font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl sm:text-3xl">เรียนอย่างไร 4 ขั้นตอน</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl border-2 border-border bg-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">{s.n}</span>
                <p className="mt-3 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-2xl bg-secondary p-6 text-center">
          <h2 className="font-display text-2xl">ครูและโรงเรียน</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">สมัครด้วยรหัสโรงเรียน สพฐ. 10 หลัก ครูคนแรกเปิดระบบหลังบ้านของโรงเรียน ดูแดชบอร์ดคะแนนนักเรียนทุกคน</p>
          <Link to="/p6" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground">เริ่มใช้งาน</Link>
        </section>
      </main>
    </div>
  );
}
