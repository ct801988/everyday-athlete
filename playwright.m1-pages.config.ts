import { defineConfig } from "@playwright/test";
import local from "./playwright.local.config";
export default defineConfig({
  ...local,
  testMatch: "m1-pages.spec.ts",
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/m1/pages-browser-results.json" }],
  ],
  use: {
    ...local.use,
    baseURL: "http://127.0.0.1:5176/fitness-pilot-preview/",
  },
  webServer: {
    command:
      "npm run build:pages && npx vite preview --config vite.pages.config.ts --host 127.0.0.1 --port 5176 --strictPort",
    url: "http://127.0.0.1:5176/fitness-pilot-preview/",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
