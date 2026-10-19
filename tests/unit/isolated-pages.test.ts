import { it, expect } from "vitest";
import {
  allowedHost,
  allowedLocation,
  ISOLATED_PREVIEW_HOST as host,
} from "../../src/m1/host";
import { deploymentBase } from "../../scripts/isolated-pages-config";

it("permits only the explicitly selected dedicated GitHub hostname", () => {
  expect(allowedHost(host)).toBe(false);
  expect(allowedLocation(host, "/", "/", host)).toBe(true);
  expect(allowedLocation(host, "/index.html", "/", host)).toBe(true);
  for (const wrong of [
    "ct801988.github.io",
    "other.github.io",
    host + ".evil.example",
  ])
    expect(allowedLocation(wrong, "/", "/", wrong)).toBe(
      wrong.endsWith(".evil.example"),
    );
  expect(allowedLocation(host, "/other/", "/", host)).toBe(false);
  expect(allowedLocation(host, "/", "/everyday-athlete/", host)).toBe(false);
});

it("requires exact opt-in for root Pages without weakening project-path validation", () => {
  expect(deploymentBase("1", host, "/")).toBe("/");
  for (const [mode, name, base] of [
    ["1", "ct801988.github.io", "/"],
    ["1", host, "/x/"],
    ["bad", host, "/"],
    ["", host, "/"],
  ])
    expect(() => deploymentBase(mode, name, base)).toThrow();
  expect(deploymentBase("", "", "/everyday-athlete/")).toBe(
    "/everyday-athlete/",
  );
});
