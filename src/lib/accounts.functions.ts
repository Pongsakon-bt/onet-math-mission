import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { accountEmail, isSchoolCode, MIN_PASSWORD, sha256Hex, type Role } from "./account-id";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public: school name for a 10-digit OBEC code (OBEC school list). */
export const lookupSchool = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => ({ code: String(d.code ?? "").trim() }))
  .handler(async ({ data }) => {
    if (!isSchoolCode(data.code)) return null;
    const { data: s } = await publicClient().from("schools").select("code, name, amphoe, province").eq("code", data.code).maybeSingle();
    return s;
  });

type RegisterInput = { role: Role; first: string; last: string; school: string; password: string };

function cleanName(s: unknown) {
  return String(s ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
}

/** Public: create a teacher or student account tied to a real OBEC school. Teachers get a one-time recovery code. */
export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator((d: RegisterInput) => ({
    role: (d.role === "teacher" ? "teacher" : "student") as Role,
    first: cleanName(d.first), last: cleanName(d.last),
    school: String(d.school ?? "").trim(), password: String(d.password ?? ""),
  }))
  .handler(async ({ data }) => {
    if (!data.first || !data.last) return { ok: false as const, error: "กรุณากรอกชื่อและนามสกุล" };
    if (!isSchoolCode(data.school)) return { ok: false as const, error: "รหัสโรงเรียนต้องเป็นตัวเลข 10 หลัก" };
    if (data.password.length < MIN_PASSWORD) return { ok: false as const, error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัว` };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: school } = await supabaseAdmin.from("schools").select("code").eq("code", data.school).maybeSingle();
    if (!school) return { ok: false as const, error: "ไม่พบรหัสโรงเรียนนี้ในรายชื่อโรงเรียน สพฐ." };

    const email = await accountEmail(data.role, data.first, data.last, data.school);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email, password: data.password, email_confirm: true });
    if (error || !created.user) {
      const dup = /already|registered|exists/i.test(error?.message ?? "");
      return { ok: false as const, error: dup ? "มีบัญชีชื่อนี้ในโรงเรียนนี้แล้ว ลองเข้าสู่ระบบ" : "สมัครไม่สำเร็จ ลองใหม่อีกครั้ง" };
    }
    const id = created.user.id;
    const p = await supabaseAdmin.from("profiles").insert({ id, first_name: data.first, last_name: data.last, school_code: data.school });
    const r = await supabaseAdmin.from("user_roles").insert({ user_id: id, role: data.role });
    if (p.error || r.error) {
      await supabaseAdmin.auth.admin.deleteUser(id);
      return { ok: false as const, error: "สมัครไม่สำเร็จ ลองใหม่อีกครั้ง" };
    }
    let recovery: string | null = null;
    if (data.role === "teacher") {
      recovery = String(crypto.getRandomValues(new Uint32Array(1))[0]! % 100000000).padStart(8, "0");
      await supabaseAdmin.from("account_recovery").insert({ user_id: id, code_hash: await sha256Hex(`${id}:${recovery}`) });
    }
    return { ok: true as const, recovery };
  });

/** Public: teacher sets a new password with name + school code + the recovery code shown at sign-up. */
export const resetTeacherPassword = createServerFn({ method: "POST" })
  .inputValidator((d: { first: string; last: string; school: string; recovery: string; password: string }) => ({
    first: cleanName(d.first), last: cleanName(d.last), school: String(d.school ?? "").trim(),
    recovery: String(d.recovery ?? "").replace(/\D/g, ""), password: String(d.password ?? ""),
  }))
  .handler(async ({ data }) => {
    const fail = { ok: false as const, error: "ข้อมูลไม่ตรงกัน ตรวจชื่อ นามสกุล รหัสโรงเรียน และรหัสกู้คืนอีกครั้ง" };
    if (data.password.length < MIN_PASSWORD) return { ok: false as const, error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัว` };
    if (!isSchoolCode(data.school) || data.recovery.length !== 8) return fail;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = await accountEmail("teacher", data.first, data.last, data.school);
    const { data: prof } = await supabaseAdmin.from("profiles").select("id").eq("school_code", data.school).eq("first_name", data.first).eq("last_name", data.last);
    for (const p of prof ?? []) {
      const { data: rec } = await supabaseAdmin.from("account_recovery").select("code_hash").eq("user_id", p.id).maybeSingle();
      if (rec && rec.code_hash === (await sha256Hex(`${p.id}:${data.recovery}`))) {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(p.id);
        if (u.user?.email !== email) continue;
        const { error } = await supabaseAdmin.auth.admin.updateUserById(p.id, { password: data.password });
        return error ? { ok: false as const, error: "ตั้งรหัสผ่านใหม่ไม่สำเร็จ" } : { ok: true as const };
      }
    }
    return fail;
  });

/** Teacher only: set a new password for a student in the teacher's own school. */
export const resetStudentPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { studentId: string; password: string }) => ({ studentId: String(d.studentId), password: String(d.password ?? "") }))
  .handler(async ({ data, context }) => {
    if (data.password.length < MIN_PASSWORD) return { ok: false as const, error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัว` };
    const { data: school } = await context.supabase.rpc("teacher_school", { _user_id: context.userId });
    if (!school) return { ok: false as const, error: "เฉพาะครูเท่านั้น" };
    // RLS: the teacher can only see profiles/roles inside their own school.
    const { data: stu } = await context.supabase.from("profiles").select("id, school_code").eq("id", data.studentId).maybeSingle();
    const { data: role } = await context.supabase.from("user_roles").select("role").eq("user_id", data.studentId).eq("role", "student").maybeSingle();
    if (!stu || stu.school_code !== school || !role) return { ok: false as const, error: "ไม่พบนักเรียนคนนี้ในโรงเรียนของคุณ" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.studentId, { password: data.password });
    return error ? { ok: false as const, error: "ตั้งรหัสผ่านใหม่ไม่สำเร็จ" } : { ok: true as const };
  });
