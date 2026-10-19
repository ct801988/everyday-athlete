import { defineConfig } from "@playwright/test";
import m1 from "./playwright.m1.config";
export default defineConfig({
  ...m1,
  testMatch: [
    "m1-ui.spec.ts",
    "m1-storage.spec.ts",
    "visual-v2.spec.ts",
    "m1-units.spec.ts",
  ],
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/visual-v2-final/browser-results.json" }],
  ],
});
