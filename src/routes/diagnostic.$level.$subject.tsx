import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { QuizSession } from "@/components/exam/QuizSession";
import { SUBJECT_NAMES, type Level } from "@/data/catalog";
import type { Subject } from "@/data/exam-types";
import { strandsFor } from "@/data/strands";

const LEVEL_NAMES: Record<Level, string> = { p6: "ป.6", m3: "ม.3" };

export const Route = createFileRoute("/diagnostic/$level/$subject")({
  validateSearch: (s: Record<string, unknown>) => ({ strand: s['strand'] === undefined ? undefined : Number(s['strand']) }),
  loader: ({ params }) => {
    if (!(params.level in LEVEL_NAMES) || !(params.subject in SUBJECT_NAMES)) throw notFound();
    return { level: params.level as Level, subject: params.subject as Subject };
  },
  head: ({ params }) => {
    const name = `${SUBJECT_NAMES[params.subject as Subject] ?? ""} ${LEVEL_NAMES[params.level as Level] ?? ""}`;
    const title = `วัดความรู้พื้นฐาน ${name} · PRE O-NET`;
    const description = `แบบวัดความรู้พื้นฐาน ${name} สุ่มจากข้อสอบ O-NET จริง ครบทุกสาระ พร้อมผลวิเคราะห์รายสาระ`;
    return {
      meta: [
        { title }, { name: "description", content: description },
        { property: "og:title", content: title }, { property: "og:description", content: description },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: DiagnosticPage,
});

function DiagnosticPage() {
  const { level, subject } = Route.useLoaderData();
  const { strand } = Route.useSearch();
  const strandName = strand !== undefined ? strandsFor(subject)[strand] : undefined;
  const name = `${SUBJECT_NAMES[subject]} ${LEVEL_NAMES[level]}`;
  const title = strandName ? `สอบซ้ำ: ${strandName}` : `วัดความรู้พื้นฐาน ${name}`;
  return (
    <PageShell subject={subject} title={title} sub={strandName ? name : "สุ่มสาระละ 4 ข้อจากข้อสอบจริง"}>
      <QuizSession
        key={`${level}-${subject}-${strand ?? "all"}`}
        sid={`${strandName ? "retest" : "diag"}-${level}-${subject}${strand !== undefined ? `-${strand}` : ""}`}
        kind={strandName ? "retest" : "diagnostic"}
        level={level} subject={subject} title={title}
        perStrand={strandName ? 6 : 4} strand={strandName}
      />
    </PageShell>
  );
}
