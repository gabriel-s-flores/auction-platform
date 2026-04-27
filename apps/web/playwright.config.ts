import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: [["list"]],
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5174",
    trace: "on-first-retry",
  },
  webServer: {
    command: "bun run dev -- --host 127.0.0.1 --port 5174",
    env: {
      VITE_API_BASE_URL: "http://127.0.0.1:5174",
      VITE_APP_NAME: "Auction Platform",
    },
    reuseExistingServer: !process.env.CI,
    url: "http://127.0.0.1:5174",
  },
});
