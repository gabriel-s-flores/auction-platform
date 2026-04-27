import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@auction/shared-types": fileURLToPath(
        new URL("../shared-types/src/index.ts", import.meta.url)
      ),
      "@ui": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
    },
  },
  test: {
    css: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
