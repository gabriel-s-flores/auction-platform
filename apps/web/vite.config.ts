import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isStaging = mode === "staging";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@web": fileURLToPath(new URL("./src", import.meta.url)),
        "@ui": fileURLToPath(new URL("../../packages/ui/src", import.meta.url))
      }
    },
    server: {
      port: isStaging ? 4173 : 5173
    }
  };
});
