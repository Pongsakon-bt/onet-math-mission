import { describe, it, expect } from "vitest";
import { poolFor, pickIds, withPassageGroups } from "../pool";

describe("mixed practice keeps passage sets together", () => {
  it("picking one passage question brings every sibling, adjacent and in order", () => {
    for (const subject of ["thai", "eng"] as const) {
      const pool = poolFor("m3", subject);
      for (let run = 0; run < 20; run++) {
        const ids = pickIds(pool, subject, 3);
        const qs = ids.map((id) => pool.find((q) => q.id === id)!);
        const keys = qs.map((q) => (q.passage ? `${q.fromYear}|${q.passage}` : q.id));
        for (const k of new Set(keys)) {
          const pos = keys.flatMap((x, i) => (x === k ? [i] : []));
          expect(pos[pos.length - 1]! - pos[0]!).toBe(pos.length - 1);
          const all = pool.filter((q) => q.passage && `${q.fromYear}|${q.passage}` === k);
          if (all.length) expect(pos.length).toBe(all.length);
        }
      }
    }
  });
  it("does not duplicate questions", () => {
    const pool = poolFor("p6", "thai");
    const ids = withPassageGroups(pool, pool.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
