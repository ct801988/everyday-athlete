import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: ".data/local-test-build",
    emptyOutDir: true,
    rollupOptions: {
      input: [
        "index.html",
        "tests/local/harness.html",
        "tests/local/m1-harness.html",
      ],
    },
  },
});
