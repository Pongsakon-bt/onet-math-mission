import { beforeEach, describe, expect, it, vi } from "vitest";
import { isRedirect } from "@tanstack/react-router";
import { canShowDashboard } from "@/lib/access";

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser } } }));
import { Route } from "@/routes/_authenticated/route";

describe("Signed-in access", () => {
  beforeEach(() => getUser.mockReset());

  it("hides the personal dashboard for signed-out and unresolved accounts", () => {
    expect(canShowDashboard(null)).toBe(false);
    expect(canShowDashboard(undefined)).toBe(false);
  });

  it("shows the personal dashboard only for a signed-in account", () => {
    expect(canShowDashboard({ id: "student-1" })).toBe(true);
  });

  it("redirects a signed-out visitor before protected content loads", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const guard = Route.options.beforeLoad;
    if (typeof guard !== "function") throw new Error("Missing auth guard");
    await expect(Promise.resolve().then(() => guard({} as never))).rejects.toSatisfy(
      (error: unknown) => isRedirect(error) && error.options.to === "/login",
    );
  });

  it("allows a user validated by the auth service", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "student-1" } }, error: null });
    const guard = Route.options.beforeLoad;
    if (typeof guard !== "function") throw new Error("Missing auth guard");
    await expect(Promise.resolve().then(() => guard({} as never))).resolves.toBeUndefined();
  });

  it("rejects expired or invalid authentication even if a user is returned", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "student-1" } }, error: new Error("Expired") });
    const guard = Route.options.beforeLoad;
    if (typeof guard !== "function") throw new Error("Missing auth guard");
    await expect(Promise.resolve().then(() => guard({} as never))).rejects.toSatisfy(isRedirect);
  });
});