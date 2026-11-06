<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->
- Exam overview groups question topics into curriculum strands via regex rules in src/data/strands.ts — new topics need no data edits, only a rule if they fall into the wrong strand.
- Student progress is saved to localStorage (src/lib/progress.ts) and, when signed in, mirrored to the `attempts` table — teachers read it via RLS scoped by `teacher_school()`.
- Accounts have no real email: src/lib/account-id.ts derives a deterministic internal email from role + name + OBEC school code; accounts are created only by the `registerAccount` server function (public sign-up is disabled) so the school code is always validated against `schools`.
- Sign-in needs only role + name + password: `signInByName` finds matching profiles server-side and returns a session; sign-up confirms the school from its 10-digit code, and the first teacher of a school creates its `school_sites` row (school back office).
- Essay answers live in `essay_answers`; students insert only, teachers of the same school may update just score/comment (column grants + trigger resets grading fields on insert).
- Per-topic drills (20 mixed-format questions) are AI-written once by `getDrillSet` and cached in `drill_sets` so every student gets the same set; skill/unlock rules live in src/lib/skill.ts (tested).

## Project rules
- Assessment, learning, analysis, results and personal dashboard routes live under the client-only _authenticated gate while preserving their public URL paths, so signed-out navigation cannot mount exam content. AccountProvider owns the sole auth-change subscriber so menus and route access update together.
- Shared headers use BrandHomeLink for consistent logo rendering and navigation to the home page.
- PRE O-NET sets come from `pickPreOnet` and use only stand-alone questions (no shared passage/picture), because split linked questions lose their context.
- Unlocking yearly sets, round 2 and analysis is gated by a finished `pre1` attempt (`isPreUnlocked` in src/lib/skill.ts), so the gate lives in one tested place.
- Exam screens recolour `--primary` to the subject colour via `subjectVars`, so components keep using `primary` tokens.
- Admin role (app_role 'admin') signs in with first name "admin"; all admin data goes through src/lib/admin.functions.ts, which checks has_role before using the service client, so RLS stays school-scoped for everyone else.
- Classes: students carry `profiles.grade/room/active`; teacher class picking (`teacher_classes`) and assignments were removed from the UI (tables kept unused); class label helpers live in src/lib/assignments.ts. Keep school management simple. Profile school/active changes go only through server functions in src/lib/classes.functions.ts (a trigger blocks direct edits), because the sign-in email is derived from the school code.
- Predicted score, certificate rules live in src/lib/prediction.ts and skill.ts (tested); school averages and AI essay drafts go through src/lib/insights.functions.ts, which returns only aggregates and lets the teacher keep the final score.
- LevelOverview accepts chart content between subject cards and overall analysis; FourSubjectRadar reuses attemptPct for cross-subject scores to keep dashboard summaries consistent.
