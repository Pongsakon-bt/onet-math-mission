import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MIN_PASSWORD } from "./account-id";

/** Verify caller is admin (via their own RLS-scoped client), then return the privileged client. */
async function adminClient(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const amIAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return !!data;
  });

/** Everything the admin page needs: schools in use, users, attempts summary, essays. */
export const adminOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminClient(context);
    const [{ data: profiles }, { data: roles }, { data: attempts }, { data: essays }] = await Promise.all([
      db.from("profiles").select("id, first_name, last_name, school_code, created_at").order("created_at", { ascending: false }).limit(5000),
      db.from("user_roles").select("user_id, role"),
      db.from("attempts").select("user_id, kind, level, subject, label, at, items").order("at", { ascending: false }).limit(5000),
      db.from("essay_answers").select("attempt_id, qid, user_id, no, prompt, max_points, answer, score, comment, created_at").order("created_at", { ascending: false }).limit(2000),
    ]);
    const codes = [...new Set((profiles ?? []).map((p) => p.school_code))];
    const { data: schools } = codes.length
      ? await db.from("schools").select("code, name, amphoe, province").in("code", codes)
      : { data: [] as { code: string; name: string; amphoe: string | null; province: string | null }[] };
    const attemptSummary = (attempts ?? []).map((a) => {
      const items = (a.items as { correct?: boolean }[]) ?? [];
      const ok = items.filter((i) => i?.correct).length;
      return { user_id: a.user_id, kind: a.kind, level: a.level, subject: a.subject, label: a.label, at: a.at, pct: items.length ? Math.round((ok / items.length) * 100) : null };
    });
    return { profiles: profiles ?? [], roles: roles ?? [], attempts: attemptSummary, essays: essays ?? [], schools: schools ?? [] };
  });

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; password: string }) => ({ userId: String(d.userId), password: String(d.password ?? "") }))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    if (data.password.length < MIN_PASSWORD) return { ok: false as const, error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัว` };
    const { error } = await db.auth.admin.updateUserById(data.userId, { password: data.password });
    return error ? { ok: false as const, error: "ตั้งรหัสผ่านใหม่ไม่สำเร็จ" } : { ok: true as const };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => ({ userId: String(d.userId) }))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    if (data.userId === context.userId) return { ok: false as const, error: "ลบบัญชีแอดมินของตัวเองไม่ได้" };
    await db.from("essay_answers").delete().eq("user_id", data.userId);
    await db.from("attempts").delete().eq("user_id", data.userId);
    const { error } = await db.auth.admin.deleteUser(data.userId);
    return error ? { ok: false as const, error: "ลบบัญชีไม่สำเร็จ" } : { ok: true as const };
  });

export const adminGradeEssay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { attemptId: string; qid: string; score: number | null; comment: string }) => ({
    attemptId: String(d.attemptId), qid: String(d.qid), score: d.score == null ? null : Number(d.score), comment: String(d.comment ?? "").slice(0, 2000),
  }))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    const { error } = await db.from("essay_answers").update({ score: data.score, comment: data.comment || null })
      .eq("attempt_id", data.attemptId).eq("qid", data.qid);
    return error ? { ok: false as const, error: "บันทึกคะแนนไม่สำเร็จ (ตรวจช่วงคะแนน)" } : { ok: true as const };
  });
