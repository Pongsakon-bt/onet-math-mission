import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { accountEmail, isSchoolCode, type Role } from "./account-id";
import { asGrade, cleanRoom } from "./assignments";

const grade = asGrade;

const cleanName = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, 60);

/** Signed-in user edits their own first/last name (and, for students, grade/room). Renaming also moves the internal sign-in email. */
export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { first: string; last: string; grade?: string; room?: string }) => ({
    first: cleanName(d.first), last: cleanName(d.last), grade: d.grade === undefined ? undefined : grade(d.grade), room: cleanRoom(d.room ?? ""),
  }))
  .handler(async ({ data, context }) => {
    if (!data.first || !data.last) return { ok: false as const, error: "กรุณากรอกชื่อและนามสกุล" };
    const { data: p } = await context.supabase.from("profiles").select("first_name, last_name, school_code").eq("id", context.userId).maybeSingle();
    if (!p) return { ok: false as const, error: "ไม่พบบัญชี" };
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    const role: Role = roles?.some((r) => r.role === "teacher") ? "teacher" : "student";
    if (role === "student" && data.grade === null) return { ok: false as const, error: "กรุณาเลือกชั้น" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (p.first_name !== data.first || p.last_name !== data.last) {
      const email = await accountEmail(role, data.first, data.last, p.school_code);
      const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, { email, email_confirm: true });
      if (error) return { ok: false as const, error: "มีบัญชีชื่อนี้ในโรงเรียนแล้ว" };
    }
    const patch: { first_name: string; last_name: string; grade?: string; room?: string | null } = { first_name: data.first, last_name: data.last };
    if (role === "student" && data.grade) { patch.grade = data.grade; patch.room = data.room; }
    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", context.userId);
    return error ? { ok: false as const, error: "บันทึกไม่สำเร็จ" } : { ok: true as const };
  });

/** Signed-in student sets their own grade and room. */
export const setMyClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { grade: string; room: string }) => ({ grade: grade(d.grade), room: cleanRoom(d.room) }))
  .handler(async ({ data, context }) => {
    if (!data.grade) return { ok: false as const, error: "กรุณาเลือกชั้น" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("profiles").update({ grade: data.grade, room: data.room }).eq("id", context.userId);
    return error ? { ok: false as const, error: "บันทึกไม่สำเร็จ" } : { ok: true as const };
  });

/** Teacher: move a student in their own school to another class, or close/reopen the account. */
export const teacherUpdateStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { studentId: string; grade?: string; room?: string; active?: boolean }) => ({
    studentId: String(d.studentId), grade: d.grade === undefined ? undefined : grade(d.grade),
    room: d.room === undefined ? undefined : cleanRoom(d.room), active: typeof d.active === "boolean" ? d.active : undefined,
  }))
  .handler(async ({ data, context }) => {
    const { data: school } = await context.supabase.rpc("teacher_school", { _user_id: context.userId });
    if (!school) return { ok: false as const, error: "เฉพาะครูเท่านั้น" };
    // RLS only shows profiles/roles inside the teacher's school.
    const { data: stu } = await context.supabase.from("profiles").select("id, school_code").eq("id", data.studentId).maybeSingle();
    const { data: role } = await context.supabase.from("user_roles").select("role").eq("user_id", data.studentId).eq("role", "student").maybeSingle();
    if (!stu || stu.school_code !== school || !role) return { ok: false as const, error: "ไม่พบนักเรียนคนนี้ในโรงเรียนของคุณ" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { grade?: string | null; room?: string | null; active?: boolean } = {};
    if (data.grade !== undefined) patch.grade = data.grade;
    if (data.room !== undefined) patch.room = data.room;
    if (data.active !== undefined) {
      patch.active = data.active;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.studentId, { ban_duration: data.active ? "none" : "876000h" });
      if (error) return { ok: false as const, error: "เปลี่ยนสถานะบัญชีไม่สำเร็จ" };
    }
    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.studentId);
    return error ? { ok: false as const, error: "บันทึกไม่สำเร็จ" } : { ok: true as const };
  });

/** Admin: move an account to another school (sign-in identity follows the school code). */
export const adminMoveSchool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; school: string }) => ({ userId: String(d.userId), school: String(d.school ?? "").trim() }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { ok: false as const, error: "เฉพาะผู้ดูแลระบบ" };
    if (!isSchoolCode(data.school)) return { ok: false as const, error: "รหัสโรงเรียนต้องเป็นตัวเลข 10 หลัก" };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const [{ data: school }, { data: p }, { data: roles }] = await Promise.all([
      db.from("schools").select("code, name").eq("code", data.school).maybeSingle(),
      db.from("profiles").select("first_name, last_name").eq("id", data.userId).maybeSingle(),
      db.from("user_roles").select("role").eq("user_id", data.userId),
    ]);
    if (!school) return { ok: false as const, error: "ไม่พบรหัสโรงเรียนนี้" };
    if (!p) return { ok: false as const, error: "ไม่พบบัญชี" };
    const role: Role = roles?.some((r) => r.role === "teacher") ? "teacher" : "student";
    const email = await accountEmail(role, p.first_name, p.last_name, data.school);
    const { error: e1 } = await db.auth.admin.updateUserById(data.userId, { email, email_confirm: true });
    if (e1) return { ok: false as const, error: "ย้ายไม่สำเร็จ (อาจมีชื่อนี้ในโรงเรียนปลายทางแล้ว)" };
    await db.from("teacher_classes").delete().eq("teacher_id", data.userId);
    const { error } = await db.from("profiles").update({ school_code: data.school, room: null }).eq("id", data.userId);
    return error ? { ok: false as const, error: "ย้ายไม่สำเร็จ" } : { ok: true as const, name: school.name };
  });
