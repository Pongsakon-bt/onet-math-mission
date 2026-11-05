import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MousePointerClick, Calculator, ListChecks, Lightbulb } from "lucide-react";
import { p6Exam, m3Exam, type Exam } from "@/data/exams";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ข้อสอบ O-NET คณิต ป.6 และ ม.3 ปี 2568 แบบโต้ตอบ" },
      { name: "description", content: "ทำข้อสอบ O-NET คณิตศาสตร์ ป.6 และ ม.3 ปีการศึกษา 2568 ครบทุกข้อ แบบโต้ตอบ แตะกราฟ เติมตัวเลข พร้อมวิธีทำทีละขั้น" },
      { property: "og:title", content: "ข้อสอบ O-NET คณิต ป.6 และ ม.3 ปี 2568 แบบโต้ตอบ" },
      { property: "og:description", content: "ถอดข้อสอบกระดาษเป็นแบบโต้ตอบ ครบทุกข้อ พร้อมเฉลยและวิธีทำ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-5xl px-4 pt-10 pb-6">
        <p className="font-display text-lg text-primary">โจทย์คณิต<span className="text-highlight-strong">.</span></p>
      </header>
      <section className="mx-auto max-w-5xl px-4 pb-10">
        <p className="mb-3 inline-block rounded-full bg-highlight/40 px-3 py-1 text-sm font-semibold">O-NET ปีการศึกษา 2568</p>
        <h1 className="font-display text-4xl leading-tight sm:text-6xl">
          ข้อสอบคณิตจริง<br />ที่<span className="marker">แตะ ลาก ลองคิด</span>ได้
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          ถอดจากข้อสอบกระดาษครบทุกข้อ ทำบนจอได้ทันที ตรวจคะแนนให้อัตโนมัติ และดูวิธีทำทีละขั้นเมื่อติด
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <ExamCard exam={p6Exam} grade="ป.6" />
          <ExamCard exam={m3Exam} grade="ม.3" />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-4">
          {[
            { icon: MousePointerClick, t: "แตะกราฟอ่านค่า", d: "กราฟเส้น แท่ง วงกลม ตอบสนองเมื่อแตะ" },
            { icon: Calculator, t: "เติมตัวเลข", d: "แป้นตัวเลขแทนการระบายวงกลม" },
            { icon: ListChecks, t: "ใช่ / ไม่ใช่", d: "ข้อเชิงซ้อนตอบทีละข้อย่อย" },
            { icon: Lightbulb, t: "วิธีทำทีละขั้น", d: "เปิดดูทีละขั้นเพื่อคิดต่อเอง" },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-xl border border-border bg-card p-4">
              <I className="mb-2 h-5 w-5 text-primary" />
              <p className="font-semibold">{t}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExamCard({ exam, grade }: { exam: Exam; grade: string }) {
  return (
    <Link
      to="/exam/$level"
      params={{ level: exam.level }}
      className="group relative overflow-hidden rounded-2xl border-2 border-foreground bg-card p-6 shadow-paper transition hover:-translate-y-1"
    >
      <span className="font-display text-7xl text-primary">{grade}</span>
      <p className="mt-2 text-xl font-semibold">{exam.title}</p>
      <p className="text-sm text-muted-foreground">{exam.code}</p>
      <p className="mt-4 text-sm">{exam.questions.length} ข้อ · {exam.minutes} นาที · 100 คะแนน</p>
      <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">
        เริ่มทำข้อสอบ <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
