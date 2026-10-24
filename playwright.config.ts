import { defineConfig, devices } from "@playwright/test";

// Two ways to run (see CONTRIBUTING.md):
//   npm test                      builds nothing; starts `next start` on the
//                                 last build and tests it (CI builds first)
//   BASE_URL=https://… npm run smoke   only the @smoke tests, read-only,
//                                 against a live site
const baseURL = process.env.BASE_URL ?? "http://localhost:3100";
const live = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] }, grepInvert: /@desktop-only/ },
  ],
  webServer: live
    ? undefined
    : { command: "npx next start -p 3100", url: baseURL, reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
