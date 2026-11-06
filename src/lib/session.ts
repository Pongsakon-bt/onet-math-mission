import { createContext, useContext, useEffect, useState, createElement, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "./account-id";
import { clearLocalProgress, loadAttempts, mergeAttempts, type Attempt, type EssayAnswer } from "./progress";

export type Account = { id: string; first: string; last: string; school: string; schoolName: string; role: Role; grade: string | null; room: string | null };

export async function fetchAccount(): Promise<Account | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: p }, { data: r }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, school_code, grade, room").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);
  if (!p) return null;
  const { data: s } = await supabase.from("schools").select("name").eq("code", p.school_code).maybeSingle();
  const role: Role = r?.some((x) => x.role === "teacher") ? "teacher" : "student";
  return { id: user.id, first: p.first_name, last: p.last_name, school: p.school_code, schoolName: s?.name ?? "", role, grade: p.grade ?? null, room: p.room ?? null };
}

const AccountContext = createContext<Account | null | undefined>(undefined);

/** One app-wide subscriber keeps navigation and protected routes in sync. */
export function AccountProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [acc, setAcc] = useState<Account | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    let revision = 0;
    const load = async () => {
      const current = ++revision;
      const account = await fetchAccount().catch(() => null);
      if (alive && current === revision) { if (!account) clearLocalProgress(); setAcc(account); }
    };
    void load();
    const { data } = supabase.auth.onAuthStateChange((ev) => {
      if (ev !== "SIGNED_IN" && ev !== "SIGNED_OUT" && ev !== "USER_UPDATED") return;
      if (ev === "SIGNED_OUT") { revision++; clearLocalProgress(); setAcc(null); void queryClient.cancelQueries(); queryClient.clear(); }
      // Leave the auth callback before making further auth requests.
      setTimeout(() => {
        if (!alive) return;
        if (ev !== "SIGNED_OUT") {
          void load();
          void queryClient.invalidateQueries();
        }
        void router.invalidate();
      }, 0);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, [router, queryClient]);
  return createElement(AccountContext.Provider, { value: acc }, children);
}

/** Current signed-in account (undefined while loading, null when signed out). */
export function useAccount() {
  return useContext(AccountContext);
}

const toRow = (uid: string, a: Attempt) => ({
  id: a.id, user_id: uid, kind: a.kind, level: a.level, subject: a.subject, label: a.label,
  at: new Date(a.at).toISOString(), ms: a.ms ?? null, items: a.items,
});

/** Copy one attempt to the signed-in student's account (no-op when signed out). */
export async function uploadAttempt(a: Attempt, essays: EssayAnswer[] = []) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("attempts").upsert(toRow(session.user.id, a));
  if (essays.length) {
    await supabase.from("essay_answers").upsert(
      essays.map((e) => ({ ...e, attempt_id: a.id, user_id: session.user.id })),
      { onConflict: "attempt_id,qid", ignoreDuplicates: true },
    );
  }
}

type AttemptRow = { id: string; kind: string; level: string; subject: string; label: string; at: string; ms: number | null; items: unknown };
export const fromRow = (r: AttemptRow): Attempt => ({
  id: r.id, kind: r.kind as Attempt["kind"], level: r.level as Attempt["level"], subject: r.subject as Attempt["subject"],
  label: r.label, at: new Date(r.at).getTime(), items: (r.items ?? []) as Attempt["items"], ...(r.ms ? { ms: r.ms } : {}),
});

/** Signed-in: pull this account's attempts from every device into local storage. Returns null when signed out. */
export async function syncMyAttempts(): Promise<Attempt[] | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase.from("attempts").select("id, kind, level, subject, label, at, ms, items").eq("user_id", session.user.id).limit(2000);
  return mergeAttempts((data ?? []).map(fromRow));
}

/** After sign-in: upload every attempt stored on this device so the teacher can see earlier work. */
export async function uploadLocalAttempts() {
  const { data: { session } } = await supabase.auth.getSession();
  const list = loadAttempts();
  if (!session || !list.length) return;
  await supabase.from("attempts").upsert(list.map((a) => toRow(session.user.id, a)));
}
