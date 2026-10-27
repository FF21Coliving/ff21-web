import { expect, test } from "./fixtures";
import { keyPages, openClean } from "./helpers";

// @smoke tests are read-only and also run against the live site after every
// production deploy and every morning (.github/workflows/production-check.yml).

for (const path of keyPages) {
  test(`${path} loads cleanly @smoke`, async ({ page }) => {
    await openClean(page, path);
    await expect(page.locator("h1")).toHaveCount(1);
    // Find my home is a focused page, without the site's header and footer.
    if (path === "/find-my-home") return;
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer")).toContainText("Sherwood Longstay Pvt Ltd");
  });
}

test("pages fit a phone screen @smoke", async ({ page }, info) => {
  test.skip(info.project.name !== "phone");
  for (const path of ["/", "/properties/kdh-kundanahalli", "/coliving-pg-near-marathahalli", "/find-my-home"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} has no sideways scroll`).toBeLessThanOrEqual(1);
  }
});

test("homepage states the facts @smoke", async ({ page }) => {
  await page.goto("/");
  // textContent, not innerText: sections below the first screen aren't
  // rendered until they're near (content-visibility), but they're there.
  const text = (await page.locator("body").textContent()) ?? "";
  expect(text).toContain("₹12K");
  expect(text).toContain("12,559");
  expect(text).not.toMatch(/11,?200/);
  expect(text).not.toMatch(/meals every day/i);
  await expect(page.locator("#faq details")).toHaveCount(12);
});

test("resident videos: every file is there, and a home's own come first @smoke", async ({ page, request }) => {
  await page.goto("/");
  const ids = await page.locator("section[aria-labelledby=reviews-title] figure video source").evaluateAll((els) =>
    els.map((e) => /story-(.+)\.mp4$/.exec(e.getAttribute("src") ?? "")?.[1]),
  );
  expect(ids).toHaveLength(8);
  for (const id of ids) {
    for (const ext of ["mp4", "webp", "vtt"]) {
      const res = await request.head(`/videos/story-${id}.${ext}`);
      expect(res.status(), `story-${id}.${ext}`).toBe(200);
    }
  }
  await page.goto("/properties/sjr-sarjapur");
  const first = page.locator("section[aria-labelledby=reviews] figure:has(video)").first();
  await expect(first.locator("source")).toHaveAttribute("src", "/videos/story-naina.mp4");
  await expect(page.locator("section[aria-labelledby=reviews] figure:has(video)")).toHaveCount(4);
});

test("every home shows a price and its meals @smoke", async ({ page }) => {
  await page.goto("/properties/itp-whitefield");
  await expect(page.locator("p", { hasText: "Meals at FF21 ITP:" })).toContainText("weekends included");
  await page.goto("/properties/kdh-kundanahalli");
  await expect(page.locator("p", { hasText: "Meals at FF21 KDH:" })).toContainText("Monday to Friday");
  await expect(page.locator("body")).toContainText("₹15,750");
});

test("structured data parses on key pages @smoke", async ({ page }) => {
  for (const path of ["/", "/properties/kdh-kundanahalli", "/coliving-pg-near-marathahalli", "/blog/what-is-the-difference-between-pg-and-hostel"]) {
    await page.goto(path);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length, `${path} has structured data`).toBeGreaterThan(0);
    for (const b of blocks) expect(() => JSON.parse(b), `${path} JSON-LD`).not.toThrow();
  }
});

test("search basics: title, description, canonical @smoke", async ({ page }) => {
  for (const path of keyPages) {
    await page.goto(path);
    await expect(page, `${path} title`).toHaveTitle(/\S/);
    expect(await page.locator('meta[name="description"]').getAttribute("content"), `${path} description`).toBeTruthy();
    expect(await page.locator('link[rel="canonical"]').getAttribute("href"), `${path} canonical`).toBeTruthy();
  }
});
