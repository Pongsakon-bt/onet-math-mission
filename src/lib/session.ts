import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "./account-id";
import { loadAttempts, type Attempt } from "./progress";

export type Account = { id: string; first: string; last: string; school: string; schoolName: string; role: Role };

export async function fetchAccount(): Promise<Account | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: p }, { data: r }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, school_code").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);
  if (!p) return null;
  const { data: s } = await supabase.from("schools").select("name").eq("code", p.school_code).maybeSingle();
  const role: Role = r?.some((x) => x.role === "teacher") ? "teacher" : "student";
  return { id: user.id, first: p.first_name, last: p.last_name, school: p.school_code, schoolName: s?.name ?? "", role };
}

/** Current signed-in account (undefined while loading, null when signed out). */
export function useAccount() {
  const [acc, setAcc] = useState<Account | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    const load = () => fetchAccount().then((a) => alive && setAcc(a)).catch(() => alive && setAcc(null));
    load();
    const { data } = supabase.auth.onAuthStateChange((ev) => {
      if (ev === "SIGNED_IN" || ev === "SIGNED_OUT" || ev === "USER_UPDATED") load();
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  return acc;
}

const toRow = (uid: string, a: Attempt) => ({
  id: a.id, user_id: uid, kind: a.kind, level: a.level, subject: a.subject, label: a.label,
  at: new Date(a.at).toISOString(), ms: a.ms ?? null, items: a.items,
});

/** Copy one attempt to the signed-in student's account (no-op when signed out). */
export async function uploadAttempt(a: Attempt) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("attempts").upsert(toRow(session.user.id, a));
}

/** After sign-in: upload every attempt stored on this device so the teacher can see earlier work. */
export async function uploadLocalAttempts() {
  const { data: { session } } = await supabase.auth.getSession();
  const list = loadAttempts();
  if (!session || !list.length) return;
  await supabase.from("attempts").upsert(list.map((a) => toRow(session.user.id, a)));
}
