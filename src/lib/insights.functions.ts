import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Average percent per strand across the caller's school (only the averages leave the server). */
export const getSchoolStrandAverage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { level: string; subject: string }) => ({ level: String(d.level).slice(0, 4), subject: String(d.subject).slice(0, 8) }))
  .handler(async ({ data, context }): Promise<{ strands: Record<string, number>; students: number }> => {
    const me = await context.supabase.from("profiles").select("school_code").eq("id", context.userId).maybeSingle();
    const school = me.data?.school_code;
    if (!school) return { strands: {}, students: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: people } = await supabaseAdmin.from("profiles").select("id").eq("school_code", school).eq("active", true).limit(2000);
    const ids = (people ?? []).map((p) => p.id);
    if (!ids.length) return { strands: {}, students: 0 };
    const { data: rows } = await supabaseAdmin.from("attempts").select("user_id, items").in("user_id", ids)
      .eq("level", data.level).eq("subject", data.subject).in("kind", ["pre1", "pre2", "full", "diagnostic", "retest"]).limit(5000);
    // Per student, per strand percent; then average across students so heavy users don't dominate.
    const per = new Map<string, Map<string, { ok: number; n: number }>>();
    for (const r of rows ?? []) {
      const m = per.get(r.user_id) ?? new Map();
      for (const it of (r.items as { strand: string; correct: boolean }[]) ?? []) {
        const v = m.get(it.strand) ?? { ok: 0, n: 0 };
        v.n++; if (it.correct) v.ok++;
        m.set(it.strand, v);
      }
      per.set(r.user_id, m);
    }
    const sum = new Map<string, { s: number; c: number }>();
    for (const m of per.values()) for (const [k, v] of m) {
      const x = sum.get(k) ?? { s: 0, c: 0 };
      x.s += (v.ok / v.n) * 100; x.c++;
      sum.set(k, x);
    }
    return { strands: Object.fromEntries([...sum].map(([k, v]) => [k, Math.round(v.s / v.c)])), students: per.size };
  });

/** Teacher: AI draft score + feedback for one written answer. The teacher still approves the final score. */
export const suggestEssayGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { attempt_id: string; qid: string }) => ({ attempt_id: String(d.attempt_id), qid: String(d.qid) }))
  .handler(async ({ data, context }): Promise<{ ok: true; score: number; feedback: string } | { ok: false; error: string }> => {
    const { data: isTeacher } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "teacher" });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isTeacher && !isAdmin) return { ok: false, error: "เฉพาะครูเท่านั้น" };
    // RLS: a teacher can only read essays from their own school.
    const { data: e } = await context.supabase.from("essay_answers").select("prompt, answer, max_points").eq("attempt_id", data.attempt_id).eq("qid", data.qid).maybeSingle();
    if (!e) return { ok: false, error: "ไม่พบคำตอบนี้" };
    const max = Number(e.max_points) || 0;
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input: [{
          role: "user",
          content: `คุณเป็นครูภาษาไทยที่ตรวจข้อสอบเขียนตอบแนว O-NET ของ สทศ. ตรวจตามรูบริก 3 ด้าน: เนื้อหาตรงคำถาม/ครบถ้วน (50%), การเรียบเรียงลำดับความคิด (30%), การใช้ภาษา สะกดคำ และไวยากรณ์ (20%)
คะแนนเต็ม ${max} คะแนน ให้คะแนนเป็นจำนวนเต็มหรือ .5 ระหว่าง 0 ถึง ${max}
feedback: ภาษาไทย 2-4 ประโยค สุภาพ บอกจุดดี 1 ข้อ และสิ่งที่ควรปรับ พร้อมระบุคะแนนแต่ละด้านสั้น ๆ
คำถาม: ${e.prompt}
คำตอบนักเรียน: ${e.answer}
Return JSON.`,
        }],
        text: { format: { type: "json_schema", name: "grade", strict: true, schema: {
          type: "object", additionalProperties: false, required: ["score", "feedback"],
          properties: { score: { type: "number" }, feedback: { type: "string" } },
        } } },
      });
      const out = (res as unknown as { output?: { type: string; content?: { type: string; text?: string }[] }[] }).output ?? [];
      const text = out.flatMap((o) => o.content ?? []).filter((c) => c.type === "output_text").map((c) => c.text ?? "").join("");
      const g = JSON.parse(text) as { score: number; feedback: string };
      const score = Math.max(0, Math.min(max, Math.round(Number(g.score) * 2) / 2));
      const feedback = String(g.feedback).slice(0, 1000);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("essay_answers").update({ ai_score: score, ai_feedback: feedback }).eq("attempt_id", data.attempt_id).eq("qid", data.qid);
      return { ok: true, score, feedback };
    } catch (err) {
      console.error("suggestEssayGrade", err);
      if (err instanceof GatewayError && err.status === 402) return { ok: false, error: "เครดิต AI หมด" };
      if (err instanceof GatewayError && err.status === 429) return { ok: false, error: "ใช้งานถี่เกินไป ลองใหม่อีกครั้ง" };
      return { ok: false, error: "AI ตรวจไม่สำเร็จ ลองใหม่อีกครั้ง" };
    }
  });
