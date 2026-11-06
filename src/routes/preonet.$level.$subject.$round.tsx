import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { QuizSession } from "@/components/exam/QuizSession";
import { LEVEL_SHORT, isLevel, isSubject, pageHead, subjectUi } from "@/components/subject-ui";
import { SUBJECT_NAMES } from "@/data/catalog";
import { loadAttempts } from "@/lib/progress";
import { PRE_SIZE, preRound1 } from "@/lib/skill";

export const Route = createFileRoute("/preonet/$level/$subject/$round")({
  loader: ({ params }) => {
    if (!isLevel(params.level) || !isSubject(params.subject) || !["1", "2"].includes(params.round)) throw notFound();
    return { level: params.level, subject: params.subject, round: params.round as "1" | "2" };
  },
  head: ({ params }) => {
    const name = `${SUBJECT_NAMES[params.subject as "math"] ?? ""} ${LEVEL_SHORT[params.level as "p6"] ?? ""}`;
    return pageHead(`PRE O-NET ครั้งที่ ${params.round} ${name}`, `สอบ PRE O-NET ${name} ${PRE_SIZE} ข้อ จากข้อสอบ O-NET จริง พร้อมผลวิเคราะห์`);
  },
  component: PrePage,
});

function PrePage() {
  const { level, subject, round } = Route.useLoaderData();
  const [status, setStatus] = useState<{ done1?: string } | null>(null);
  useEffect(() => setStatus({ done1: preRound1(loadAttempts(), level, subject)?.id }), [level, subject]);
  const title = `PRE O-NET ครั้งที่ ${round} · ${subjectUi(subject).name} ${LEVEL_SHORT[level]}`;
  const back = <Link to="/bank/$level/$subject" params={{ level, subject }} className="font-semibold underline">กลับหน้า PRE O-NET</Link>;

  let body;
  if (!status) body = <div className="flex flex-1 items-center justify-center text-muted-foreground">กำลังเตรียมข้อสอบ...</div>;
  else if (round === "1" && status.done1)
    body = (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-display text-xl">ทำ PRE O-NET ครั้งที่ 1 ไปแล้ว</p>
        <p className="text-muted-foreground">ครั้งที่ 1 ทำได้ครั้งเดียว ฝึกซ้ำได้ที่ครั้งที่ 2</p>
        <Link to="/result/$id" params={{ id: status.done1 }} className="font-semibold underline">ดูผลครั้งที่ 1</Link>
        {back}
      </div>
    );
  else if (round === "2" && !status.done1)
    body = (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <p className="font-display text-xl">ต้องทำครั้งที่ 1 ให้เสร็จก่อน</p>
        {back}
      </div>
    );
  else
    body = (
      <QuizSession
        sid={`pre${round}-${level}-${subject}`}
        kind={round === "1" ? "pre1" : "pre2"}
        level={level} subject={subject} title={title}
        preSize={PRE_SIZE} askSave={round === "2"}
      />
    );

  return (
    <PageShell title={title} sub={round === "1" ? "ทำได้ครั้งเดียว ตั้งใจทำนะ" : "บันทึกผลหรือสอบใหม่ได้"} subject={subject}>
      {body}
    </PageShell>
  );
}
