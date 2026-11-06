import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each([
    "/dashboard", "/bank/p6/math", "/preonet/p6/math/1", "/preonet/m3/sci/2",
    "/exam/p6-math-2568", "/diagnostic/m3/eng", "/drill/p6/math/0",
    "/learn/m3/sci/0", "/analysis/p6/thai", "/develop/m3/sci", "/result/example",
  ])("protects %s without changing its URL", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes(path);
    expect(matches.some((match) => match.routeId === "/_authenticated")).toBe(true);
    expect(matches.at(-1)?.routeId).not.toBe("/_authenticated");
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
