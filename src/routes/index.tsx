import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import bannerP6 from "@/assets/banner-p6.jpg";
import bannerM3 from "@/assets/banner-m3.jpg";

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

const LEVELS = [
  { to: "/p6" as const, short: "ป.6", full: "ประถมศึกษาปีที่ 6", img: bannerP6 },
  { to: "/m3" as const, short: "ม.3", full: "มัธยมศึกษาปีที่ 3", img: bannerM3 },
];

function Index() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 pb-12 pt-8">
        <h1 className="font-display text-3xl leading-tight sm:text-5xl">ฝึกทำข้อสอบ O-NET<br /><span className="marker">ข้อสอบจริง ทำบนจอได้</span></h1>
        <p className="mt-3 text-muted-foreground">เลือกระดับชั้นของนักเรียน</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <Link key={l.to} to={l.to} className="group overflow-hidden rounded-2xl border-2 border-border bg-card shadow-paper transition hover:-translate-y-0.5 hover:border-primary">
              <img src={l.img} alt={`นักเรียนชั้น${l.full}`} width={1600} height={640} className="h-32 w-full object-cover" />
              <div className="p-5">
                <span className="font-display text-5xl text-primary">{l.short}</span>
                <p className="mt-1 text-lg font-semibold">{l.full}</p>
                <p className="text-sm text-muted-foreground">4 วิชา · ข้อสอบจริงหลายปี</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
