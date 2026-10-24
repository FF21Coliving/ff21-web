import { expect } from "./fixtures";
import type { Page } from "@playwright/test";

// Every page we promise works: the homepage, each home, the main area pages,
// the blog, a post, and the legal pages.
export const homes = [
  "itp-whitefield",
  "wfd-whitefield",
  "kdh-kundanahalli",
  "pods-marathahalli",
  "lit-thubarahalli",
  "bgm-doddanekundi",
  "pmc-mahadevapura",
  "hbr-hennur",
  "kora-koramangala",
  "sjr-sarjapur",
];

export const keyPages = [
  "/",
  "/properties",
  ...homes.map((h) => `/properties/${h}`),
  "/find-my-home",
  "/about",
  "/blog",
  "/blog/what-is-the-difference-between-pg-and-hostel",
  "/luxury-pg-in-bangalore",
  "/coliving-near-koramangala",
  "/coliving-pg-near-marathahalli",
  "/terms-and-conditions",
  "/privacypolicy",
];

// Opens a page and fails on anything a visitor could notice: a non-200
// answer, a JavaScript error (React's hydration errors included), or a
// failed request to our own site. Third-party tags are left out.
export async function openClean(page: Page, path: string) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/googletagmanager|facebook|doubleclick|google-analytics/.test(m.text())) problems.push(`console: ${m.text()}`);
  });
  page.on("response", (r) => {
    const url = new URL(r.url());
    const ours = url.origin === new URL(process.env.BASE_URL ?? "http://localhost:3100").origin;
    if (ours && r.status() >= 400 && !url.pathname.startsWith("/_vercel")) problems.push(`${r.status()} ${url.pathname}`);
  });
  const res = await page.goto(path, { waitUntil: "load" });
  expect(res?.status(), `${path} answers 200`).toBe(200);
  // Give hydration and effects a moment to report.
  await page.waitForTimeout(1500);
  expect(problems, `${path} loads cleanly`).toEqual([]);
  return res!;
}
