/**
 * Accounts sign in with first name + last name + 10-digit OBEC school code + password (no real email).
 * Each account gets a deterministic internal email derived from those fields. Shared by browser and server.
 */
export type Role = "teacher" | "student";

const norm = (s: string) => s.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();

export async function accountEmail(role: Role, first: string, last: string, school: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${norm(first)}|${norm(last)}`);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const hex = [...hash.slice(0, 10)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${role === "teacher" ? "t" : "s"}${school}.${hex}@preonet.app`;
}

export async function sha256Hex(s: string): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return [...hash].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const isSchoolCode = (s: string) => /^\d{10}$/.test(s);
export const MIN_PASSWORD = 8;
