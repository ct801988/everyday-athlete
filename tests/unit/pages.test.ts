import { it, expect } from "vitest";
import { pagesBase } from "../../scripts/pages-path";
it.each(["/fitness-pilot-preview/", "/everyday-athlete/", "/ea_test-2/"])(
  "accepts exact project base %s",
  (x) => expect(pagesBase(x)).toBe(x),
);
it.each([
  "/",
  "//",
  "/../",
  "/x/y/",
  "/x",
  "https://x/",
  "/x?y/",
  "/WinterStrong/",
  "/x%20y/",
])("rejects unsafe or origin-wide base %s", (x) =>
  expect(() => pagesBase(x)).toThrow(),
);
