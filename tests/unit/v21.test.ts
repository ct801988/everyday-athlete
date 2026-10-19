import { describe, it, expect } from "vitest";
import { createModel } from "../../src/m1/model";
import { groupedOrder, exerciseFacts } from "../../src/m1/presentation";
import { lifecycle, record, elapsed } from "../../src/m1/actions";
import { verifiedRelease } from "../../src/m1/release";
describe("V2.1 factual presentation without schema mutation", () => {
  it("three manual group members stay adjacent in pinned order; ungroup restores order and identity", () => {
    const d = createModel(),
      s = d.sessions[0],
      original = structuredClone(s);
    for (const i of [0, 2, 4]) s.performances[i].group = "A";
    const ordered = groupedOrder(s.performances);
    expect(ordered.map((p) => p.id)).toEqual(
      [0, 2, 4, 1, 3, 5].map((i) => s.performances[i].id),
    );
    expect(s.prescription).toEqual(original.prescription);
    expect(s.performances.map((p) => p.id)).toEqual(
      original.performances.map((p) => p.id),
    );
    for (const p of s.performances) p.group = null;
    expect(groupedOrder(s.performances)).toEqual(original.performances);
  });
  it("partial summary counts only confirmed actual work, never drafts or elapsed effort", () => {
    const d = createModel(),
      s = d.sessions[0],
      p = s.performances[0];
    lifecycle(d, s, "begin", 1000);
    p.rows[0].draft = { weight: "20.123456", amount: "8", rir: "" };
    record(s, p, p.rows[0], 2000, d);
    s.performances[1].rows[0].draft.amount = "10";
    lifecycle(d, s, "pause", 3000);
    expect(elapsed(s, 100000).seconds).toBe(2);
    expect(exerciseFacts(s)).toMatchObject({
      prescribed: 6,
      performed: 1,
      highlights: [{ sets: 1 }],
    });
  });
  it("release claims require exact revision and matching build base", () => {
    expect(
      verifiedRelease({
        revision: "local-uncommitted",
        datasetSchema: 3,
        base: "/",
      }),
    ).toBeNull();
    expect(
      verifiedRelease({
        revision: "a".repeat(40),
        datasetSchema: 3,
        base: "/",
      }),
    ).not.toBeNull();
    expect(
      verifiedRelease({
        revision: "a".repeat(40),
        datasetSchema: 3,
        base: "/other/",
      }),
    ).toBeNull();
  });
});
