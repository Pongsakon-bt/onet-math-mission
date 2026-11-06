import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoUrl from "@/assets/cool-quiz-logo.webp";
const logo = { url: logoUrl };
import { isLevel, isSubject, LEVEL_SHORT, pageHead } from "@/components/subject-ui";
import { SUBJECT_NAMES } from "@/data/catalog";
import { analyzeSubject } from "@/data/analysis";
import { supabase } from "@/integrations/supabase/client";
import { fromRow, useAccount } from "@/lib/session";
import { loadAttempts, type Attempt } from "@/lib/progress";
import { certificateReason, topicSkill } from "@/lib/skill";

export const Route = createFileRoute("/_authenticated/certificate/$level/$subject")({
  validateSearch: (s: Record<string, unknown>) => ({ student: typeof s["student"] === "string" ? (s["student"] as string) : undefined }),
  loader: ({ params }) => {
    if (!isLevel(params.level) || !isSubject(params.subject)) throw notFound();
    return { level: params.level, subject: params.subject };
  },
  head: ({ params }) => pageHead(`เกียรติบัตร ${SUBJECT_NAMES[params.subject as "math"] ?? ""} ${LEVEL_SHORT[params.level as "p6"] ?? ""}`, "เกียรติบัตรความสำเร็จจาก COOL QUIZ : O-NET"),
  component: CertificatePage,
});

function CertificatePage() {
  const { level, subject } = Route.useLoaderData();
  const { student } = Route.useSearch();
  const acc = useAccount();
  const [who, setWho] = useState<{ name: string; attempts: Attempt[] } | null>(null);
  useEffect(() => {
    if (!acc) return;
    if (!student) { setWho({ name: `${acc.first} ${acc.last}`, attempts: loadAttempts() }); return; }
    void Promise.all([
      supabase.from("profiles").select("first_name, last_name").eq("id", student).maybeSingle(),
      supabase.from("attempts").select("id, kind, level, subject, label, at, ms, items").eq("user_id", student).limit(2000),
    ]).then(([p, a]) => setWho({ name: p.data ? `${p.data.first_name} ${p.data.last_name}` : "", attempts: (a.data ?? []).map(fromRow) }));
  }, [acc, student]);

  const cert = useMemo(() => {
    if (!who) return null;
    const rows = analyzeSubject(level, subject).topics.map((t) => ({ skill: topicSkill(who.attempts, level, subject, t.topic).skill }));
    return certificateReason(who.attempts, level, subject, rows);
  }, [who, level, subject]);

  const subj = `${SUBJECT_NAMES[subject]} ชั้น${LEVEL_SHORT[level]}`;
  return (
    <div className="min-h-dvh bg-secondary/40 p-3 sm:p-6">
      <style>{`@media print { @page { size: A4 landscape; margin: 0 } body * { visibility: hidden } .cert, .cert * { visibility: visible } .cert { position: fixed; inset: 0; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important } }`}</style>
      <div className="no-print mx-auto mb-3 flex max-w-4xl items-center justify-between gap-2">
        <Button variant="outline" size="sm" asChild><Link to="/dashboard" search={{ level, subject }}><ArrowLeft /> กลับ</Link></Button>
        {cert && <Button size="sm" onClick={() => { document.title = `เกียรติบัตร ${who?.name} ${subj}`; window.print(); }}><Printer /> พิมพ์ / บันทึก PDF</Button>}
      </div>
      {!who ? <p className="text-center text-muted-foreground">กำลังโหลด...</p> : !cert ? (
        <div className="mx-auto max-w-lg rounded-2xl bg-card p-6 text-center shadow-paper">
          <p className="font-display text-xl">ยังไม่ถึงเกณฑ์รับเกียรติบัตร</p>
          <p className="mt-2 text-muted-foreground">ผ่านครบทุกเรื่องในวิชา หรือทำ PRE O-NET ครั้งที่ 2 ได้ 80% ขึ้นไป</p>
        </div>
      ) : (
        <div className="cert mx-auto flex aspect-[297/210] max-w-4xl flex-col items-center justify-center rounded-2xl border-[10px] border-double border-primary bg-card p-[4%] text-center shadow-paper">
          <img src={logo.url} alt="COOL QUIZ : O-NET" className="h-[18%] w-auto object-contain" />
          <p className="mt-[2%] font-display text-[clamp(1.5rem,4vw,3rem)] text-primary">เกียรติบัตร</p>
          <p className="text-[clamp(.8rem,1.6vw,1.1rem)] text-muted-foreground">มอบให้ไว้เพื่อแสดงว่า</p>
          <p className="mt-[1.5%] border-b-2 border-highlight px-6 pb-1 font-display text-[clamp(1.3rem,3.4vw,2.6rem)]">{who.name}</p>
          {acc?.schoolName && <p className="mt-1 text-[clamp(.8rem,1.5vw,1.05rem)]">โรงเรียน{acc.schoolName}</p>}
          <p className="mt-[2%] max-w-[80%] text-[clamp(.85rem,1.7vw,1.2rem)]">
            {cert.reason === "mastered" ? `ฝึกฝนจนผ่านครบทุกเรื่องในวิชา${subj}` : `ทำแบบทดสอบ PRE O-NET ครั้งที่ 2 วิชา${subj} ได้ระดับดีเยี่ยม (${cert.pct}%)`}
          </p>
          <p className="mt-[3%] text-[clamp(.75rem,1.4vw,1rem)] text-muted-foreground">ให้ไว้ ณ วันที่ {new Date().toLocaleDateString("th-TH", { dateStyle: "long" })}</p>
          <p className="mt-1 font-display text-[clamp(.75rem,1.4vw,1rem)]">COOL QUIZ : O-NET</p>
        </div>
      )}
    </div>
  );
}
