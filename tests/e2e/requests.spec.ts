import type { Page, Request } from "@playwright/test";
import { expect, test } from "./fixtures";
import { storiesFor } from "../../src/lib/content";

// Every request counts against the site's Vercel CDN plan, which it outgrew in
// November 2026 (about 70 requests a visit). These keep the fixes in place.

// A page's data fetched in the background (no link is clicked in these tests).
const isPrefetch = (r: Request) => r.url().includes("_rsc=");

async function scrollToBottom(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1500);
}

test("links don't load their pages until someone shows interest", async ({ page }) => {
  const prefetches: string[] = [];
  page.on("request", (r) => isPrefetch(r) && prefetches.push(r.url()));
  for (const path of ["/", "/properties/kdh-kundanahalli"]) {
    await page.goto(path);
    await scrollToBottom(page);
  }
  expect(prefetches).toEqual([]);
});

test("hovering a home card loads that home's page in the background @desktop-only", async ({ page }) => {
  await page.goto("/properties");
  const prefetches: string[] = [];
  page.on("request", (r) => isPrefetch(r) && prefetches.push(new URL(r.url()).pathname));
  await page.locator('a[href="/properties/pmc-mahadevapura"]').last().hover();
  await expect.poll(() => prefetches).toContain("/properties/pmc-mahadevapura");
});

// Clips with their own words on screen keep captions off unless turned on.
test("video captions load only when a video is played", async ({ page }) => {
  const captions: string[] = [];
  page.on("request", (r) => r.url().endsWith(".vtt") && captions.push(new URL(r.url()).pathname));
  await page.goto("/");
  await scrollToBottom(page);
  expect(captions).toEqual([]);
  const id = storiesFor().find((s) => !s.onScreen)!.id;
  const story = page.locator(`section[aria-labelledby=reviews-title] figure:has(source[src="/videos/story-${id}.mp4"])`);
  await story.scrollIntoViewIfNeeded();
  await story.getByRole("button").click();
  await expect.poll(() => captions).toContain(`/videos/story-${id}.vtt`);
});

test("the favicon is one browsers keep for 30 days @smoke", async ({ page, request }) => {
  await page.goto("/");
  const icons = await page.locator('link[rel="icon"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(icons).toContain("/brand/ff21-favicon-48.ico");
  const icon = await request.get("/brand/ff21-favicon-48.ico");
  expect(icon.status()).toBe(200);
  expect(icon.headers()["cache-control"]).toContain("max-age=2592000");
  const old = await request.get("/favicon.ico", { maxRedirects: 0 });
  expect(old.status()).toBe(308);
  expect(old.headers()["location"]).toBe("/brand/ff21-favicon-48.ico");
});
