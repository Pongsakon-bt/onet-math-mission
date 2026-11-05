import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { exams, type Level } from "@/data/exams";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { preloadExamImages } from "@/lib/preload-exam";

export const Route = createFileRoute("/exam/$level")({
  loader: async ({ params }) => {
    if (!(params.level in exams)) throw notFound();
    await preloadExamImages(params.level as Level);
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
  pendingComponent: () => (
    <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-primary" />
      <p className="font-display text-primary">กำลังเตรียมข้อสอบ...</p>
    </div>
  ),
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
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border bg-background [@media(max-height:500px)]:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4">
          <Link to="/" className="font-display text-lg text-primary">โจทย์คณิต<span className="text-highlight-strong">.</span></Link>
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-semibold leading-tight">{exam.title}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">{exam.code} · {exam.examDate}</p>
          </div>
        </div>
      </div>
      <ExamRunner exam={exam} />
    </div>
  );
}
