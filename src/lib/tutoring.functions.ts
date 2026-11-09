import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyzeSubject } from "@/data/analysis";
import { buildTutoringPlan, planConfigSchema, targetLevel } from "./tutoring-plan";
import type { Json } from "@/integrations/supabase/types";

export const saveTutoringPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid().optional(), config: planConfigSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: school, error: roleError } = await context.supabase.rpc("teacher_school", { _user_id: context.userId });
    if (roleError || !school) throw new Error("เฉพาะครูของโรงเรียนเท่านั้น");
    const level = targetLevel(data.config.grade);
    const topics = data.config.subjects.flatMap(subject => analyzeSubject(level, subject).topics.map(t => ({ topic: t.topic, strand: t.strand, subject })));
    const schedule = buildTutoringPlan(data.config, topics);
    const row = { school_code: school, teacher_id: context.userId, title: data.config.title, grade: data.config.grade,
      config: data.config as unknown as Json, schedule: schedule as unknown as Json, updated_at: new Date().toISOString() };
    const query = data.id
      ? context.supabase.from("tutoring_plans").update(row).eq("id", data.id).eq("teacher_id", context.userId)
      : context.supabase.from("tutoring_plans").insert(row);
    const { data: saved, error } = await query.select("id").single();
    if (error || !saved) throw new Error("บันทึกแผนไม่สำเร็จ หรือไม่มีสิทธิ์แก้ไขแผนนี้");
    return { id: saved.id, schedule };
  });