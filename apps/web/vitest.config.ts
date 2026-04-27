import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@web": fileURLToPath(new URL("./src", import.meta.url)),
      "@ui": fileURLToPath(new URL("../../packages/ui/src", import.meta.url)),
    },
  },
  test: {
    css: true,
    environment: "happy-dom",
    env: {
      VITE_API_BASE_URL: "http://localhost:3333",
      VITE_APP_NAME: "Auction Platform",
    },
    exclude: ["**/e2e/**", "**/dist/**", "**/node_modules/**"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
