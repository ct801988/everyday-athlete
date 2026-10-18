import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { pagesBase } from "./scripts/pages-path.ts";
export default defineConfig({
  plugins: [react()],
  base: pagesBase(),
  build: { outDir: ".data/pages-build", emptyOutDir: true },
});
