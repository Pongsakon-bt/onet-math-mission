import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { exams, type Level } from "@/data/exams";
import { ExamRunner } from "@/components/exam/ExamRunner";

export const Route = createFileRoute("/exam/$level")({
  loader: ({ params }) => {
    if (!(params.level in exams)) throw notFound();
    return { level: params.level as Level };
  },
  head: ({ loaderData }) => {
    const exam = loaderData ? exams[loaderData.level] : undefined;
    const title = exam ? `${exam.title} ปี 2568 · ทำข้อสอบออนไลน์` : "ไม่พบชุดข้อสอบ";
    const description = exam
      ? `ทำข้อสอบ ${exam.title} ปีการศึกษา 2568 ครบ ${exam.questions.length} ข้อ ตอบแบบโต้ตอบ พร้อมวิธีทำทีละขั้น`
      : "ไม่พบชุดข้อสอบนี้";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ExamPage,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      ไม่พบชุดข้อสอบนี้ <Link to="/" className="underline">กลับหน้าแรก</Link>
    </div>
  ),
});

function ExamPage() {
  const { level } = Route.useLoaderData();
  const exam = exams[level];
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-lg text-primary">โจทย์คณิต<span className="text-highlight-strong">.</span></Link>
          <div className="text-right">
            <p className="font-semibold leading-tight">{exam.title}</p>
            <p className="text-xs text-muted-foreground">{exam.code} · {exam.examDate}</p>
          </div>
        </div>
      </div>
      <ExamRunner exam={exam} />
    </div>
  );
}
