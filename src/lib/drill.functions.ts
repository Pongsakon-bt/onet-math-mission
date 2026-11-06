import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Question } from "@/data/exam-types";

type Input = { level: string; subject: string; topic: string };
type Raw = { type: "mcq" | "multi" | "numeric" | "truefalse"; prompt: string; choices: string[]; answer: number; answers: number[]; tf: { text: string; answer: boolean }[]; unit: string; hint: string; explanation: string };

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["type", "prompt", "choices", "answer", "answers", "tf", "unit", "hint", "explanation"],
        properties: {
          type: { type: "string", enum: ["mcq", "multi", "numeric", "truefalse"] },
          prompt: { type: "string" },
          choices: { type: "array", items: { type: "string" } },
          answer: { type: "number" },
          answers: { type: "array", items: { type: "number" } },
          tf: { type: "array", items: { type: "object", additionalProperties: false, required: ["text", "answer"], properties: { text: { type: "string" }, answer: { type: "boolean" } } } },
          unit: { type: "string" },
          hint: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
  },
} as const;

function toQuestion(r: Raw, i: number, topic: string, key: string): Question | null {
  const base = { id: `${key}-${i + 1}`, no: i + 1, topic, points: 1, prompt: r.prompt.trim(), steps: [r.explanation], hints: r.hint ? [r.hint] : [] };
  if (!base.prompt) return null;
  if (r.type === "mcq" && r.choices.length >= 3 && r.answer >= 1 && r.answer <= r.choices.length)
    return { ...base, type: "mcq", choices: r.choices.map((text) => ({ text })), answer: r.answer };
  if (r.type === "multi" && r.choices.length >= 4 && r.answers.length >= 2 && r.answers.every((a) => a >= 1 && a <= r.choices.length))
    return { ...base, type: "multi", choices: r.choices.map((text) => ({ text })), answers: [...new Set(r.answers)] };
  if (r.type === "numeric" && Number.isFinite(r.answer)) return { ...base, type: "numeric", answer: r.answer, ...(r.unit ? { unit: r.unit } : {}) };
  if (r.type === "truefalse" && r.tf.length >= 2)
    return { ...base, type: "truefalse", items: r.tf.map((t, k) => ({ label: String.fromCharCode(65 + k), text: t.text, answer: t.answer })) };
  return null;
}

/** Returns the shared 20-question drill for a topic; writes it with AI the first time anyone opens it. */
export const getDrillSet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Input) => d)
  .handler(async ({ data, context }): Promise<{ items: Question[]; error?: string }> => {
    const { level, subject, topic } = data;
    const existing = await context.supabase.from("drill_sets").select("items").eq("level", level).eq("subject", subject).eq("topic", topic).maybeSingle();
    if (existing.data) return { items: existing.data.items as unknown as Question[] };

    const { analyzeSubject } = await import("@/data/analysis");
    const { yearsFor } = await import("@/data/catalog");
    const { baseTopic } = await import("@/data/analysis");
    if (level !== "p6" && level !== "m3") return { items: [], error: "ไม่พบระดับชั้น" };
    if (!["math", "thai", "eng", "sci"].includes(subject)) return { items: [], error: "ไม่พบวิชา" };
    const lv = level as "p6" | "m3";
    const sj = subject as "math" | "thai" | "eng" | "sci";
    if (!analyzeSubject(lv, sj).topics.some((t) => t.topic === topic)) return { items: [], error: "ไม่พบเรื่องนี้" };

    const examples = yearsFor(lv, sj).flatMap((e) => e.questions.filter((q) => baseTopic(q.topic) === topic).map((q) => `- (${e.year}) ${q.prompt}${"choices" in q ? " | ตัวเลือก: " + q.choices.map((c) => c.text ?? "").join(" / ") : ""}`)).slice(0, 5).join("\n");
    const lvName = lv === "p6" ? "ประถมศึกษาปีที่ 6" : "มัธยมศึกษาปีที่ 3";
    const subjName = { math: "คณิตศาสตร์", thai: "ภาษาไทย", eng: "ภาษาอังกฤษ", sci: "วิทยาศาสตร์" }[sj];

    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    let raw: Raw[] = [];
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input: [{
          role: "user",
          content: `แต่งข้อสอบฝึกใหม่ 20 ข้อ วิชา${subjName} ชั้น${lvName} เรื่อง "${topic}" ให้สอดคล้องแนวข้อสอบ O-NET ของ สทศ. ระดับความยากจากง่ายไปยาก
${sj === "eng" ? "โจทย์และตัวเลือกเขียนเป็นภาษาอังกฤษ ส่วน hint และ explanation เป็นภาษาไทย" : "เขียนเป็นภาษาไทย"}
คละรูปแบบ: mcq (4 ตัวเลือก, answer = เลขตัวเลือก 1-4) ประมาณ 11 ข้อ, multi (5 ตัวเลือก เลือก 2 คำตอบ, answers = เลขตัวเลือก) 3 ข้อ, ${sj === "math" || sj === "sci" ? "numeric (คำตอบเป็นตัวเลข, ใส่ unit ถ้ามี) 3 ข้อ" : "mcq เพิ่ม 3 ข้อ"}, truefalse (tf 3-4 ข้อความ ถูก/ผิด) 3 ข้อ
ฟิลด์ที่ไม่ใช้ให้ใส่ค่าว่าง ([] / 0 / "") ห้ามอ้างถึงรูปภาพ ทุกข้อต้องมีคำตอบที่ถูกต้องแน่นอนเพียงชุดเดียว ตรวจคำนวณซ้ำก่อนตอบ
hint = คำใบ้ที่ไม่บอกคำตอบ, explanation = วิธีคิดสั้น ๆ พร้อมคำตอบ
ใช้สัญลักษณ์เศษส่วนแบบ {a/b} และยกกำลังแบบ ^{n}
ตัวอย่างข้อสอบจริงเรื่องนี้:\n${examples}\nReturn JSON.`,
        }],
        text: { format: { type: "json_schema", name: "drill", strict: true, schema: SCHEMA } },
      });
      const out = (res as unknown as { output?: { type: string; content?: { type: string; text?: string }[] }[] }).output ?? [];
      const text = out.flatMap((o) => o.content ?? []).filter((c) => c.type === "output_text").map((c) => c.text ?? "").join("");
      raw = (JSON.parse(text) as { items: Raw[] }).items;
    } catch (e) {
      console.error("drill generation failed", e instanceof GatewayError ? e.code : e);
      return { items: [], error: "ระบบแต่งข้อสอบไม่สำเร็จ ลองใหม่อีกครั้ง" };
    }
    const key = `drill-${lv}-${sj}-${encodeURIComponent(topic).slice(0, 40)}`;
    const items = raw.map((r, i) => toQuestion(r, i, topic, key)).filter((q): q is Question => !!q).slice(0, 20).map((q, i) => ({ ...q, no: i + 1, id: `${key}-${i + 1}` }));
    if (items.length < 10) return { items: [], error: "ระบบแต่งข้อสอบไม่สำเร็จ ลองใหม่อีกครั้ง" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("drill_sets").upsert({ level: lv, subject: sj, topic, items: items as never }, { onConflict: "level,subject,topic", ignoreDuplicates: true });
    const saved = await supabaseAdmin.from("drill_sets").select("items").eq("level", lv).eq("subject", sj).eq("topic", topic).maybeSingle();
    return { items: (saved.data?.items as unknown as Question[]) ?? items };
  });
