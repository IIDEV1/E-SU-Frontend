import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? "5173");
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    baseURL,
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_API_URL: process.env.E2E_API_URL ?? "http://127.0.0.1:8000/api/v1",
    },
  },
});
