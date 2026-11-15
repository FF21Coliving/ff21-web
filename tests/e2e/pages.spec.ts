import { expect, test } from "./fixtures";
import { homes, keyPages, openClean } from "./helpers";
import { stories, storiesFor } from "../../src/lib/content";
import { photos } from "../../src/lib/photos";
import { properties } from "../../src/lib/properties";
import { prices } from "../../src/lib/site";

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
  // Rent is "from ₹14,000", never a range or a top price (11 Nov 2026).
  expect(text).toContain("Rent starts from ₹14,000 a month");
  expect(text).not.toMatch(/₹12|12K|14K|₹14,000 to/);
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
  // Every video shows somewhere: on the homepage or on a home's page.
  const shown = new Set([...storiesFor(), ...properties.flatMap((p) => storiesFor(p.code, 4))].map((s) => s.id));
  expect(stories.filter((s) => !shown.has(s.id)).map((s) => s.id)).toEqual([]);
  for (const id of ids) {
    for (const ext of ["mp4", "webp", "vtt"]) {
      const res = await request.head(`/videos/story-${id}.${ext}`);
      expect(res.status(), `story-${id}.${ext}`).toBe(200);
    }
  }
  await page.goto("/properties/sjr-sarjapur");
  const first = page.locator("section[aria-labelledby=reviews] figure:has(video)").first();
  await expect(first.locator("source")).toHaveAttribute("src", `/videos/story-${storiesFor("SJR", 4)[0].id}.mp4`);
  await expect(page.locator("section[aria-labelledby=reviews] figure:has(video)")).toHaveCount(4);
});

// Wix's image service resizes on request, often 0.5–2 s a photo, so the
// homepage, every home and Find my home use only the site's own photos.
test("key pages load no photos from Wix @smoke", async ({ page }) => {
  test.setTimeout(90_000);
  for (const path of ["/", ...homes.map((h) => `/properties/${h}`), "/find-my-home"]) {
    await page.goto(path);
    const wix = await page.locator("img").evaluateAll((els) =>
      els.map((e) => `${e.getAttribute("src") ?? ""} ${e.getAttribute("srcset") ?? ""}`).filter((s) => s.includes("wixstatic.com")),
    );
    expect(wix, `${path} photos from Wix`).toEqual([]);
  }
});

// The same, for photos a page shows only later (Find my home's later steps).
test("every listed photo is one of the site's own", () => {
  const all = [...Object.values(photos), ...properties.flatMap((p) => [p.hero, ...(p.tourCover ? [p.tourCover] : []), ...p.gallery])];
  expect(all.filter((ph) => !ph.id.startsWith("/photos/")).map((ph) => ph.id)).toEqual([]);
});

// FF21 isn't a "student PG"; Wix's old /bangalore-student-pg keeps its URL only.
test("no page is called a student PG @smoke", async ({ page }) => {
  for (const path of ["/bangalore-student-pg", "/properties"]) {
    await page.goto(path);
    expect(await page.locator("h1, a").allTextContents(), path).not.toContainEqual(expect.stringMatching(/student pg/i));
    expect((await page.locator('meta[name="description"]').getAttribute("content")) ?? "", path).not.toMatch(/student pg/i);
  }
});

test("every home shows a price and its meals @smoke", async ({ page }) => {
  await page.goto("/properties/wfd-whitefield");
  await expect(page.locator("p", { hasText: "Meals at FF21 WFD:" })).toContainText("weekends included");
  await page.goto("/properties/kdh-kundanahalli");
  await expect(page.locator("p", { hasText: "Meals at FF21 KDH:" })).toContainText("Monday to Friday");
  await expect(page.locator("body")).not.toContainText("₹12,000");
});

// Each home's starting rent, from FF21's price sheet (17 Oct 2026).
const sheet: Record<string, string> = { WFD: "₹14,000", PODS: "₹14,000", KDH: "₹15,750", HBR: "₹15,750", BGM: "₹15,750", PMC: "₹16,450", LIT: "₹17,000", KORA: "₹17,300", SJR: "₹17,800" };

test("every home's page shows its own starting rent @smoke", async ({ page }) => {
  expect(Object.keys(sheet).sort()).toEqual(properties.map((p) => p.code).sort());
  for (const p of properties) {
    await page.goto(`/properties/${p.slug}`);
    await expect(page.getByText(`From ${sheet[p.code]} a month, per person`), p.code).toBeVisible();
    expect(await page.locator('meta[name="description"]').getAttribute("content"), p.code).toContain(`from ${sheet[p.code]} a month`);
  }
});

test("home cards and the lowest rent agree with the price sheet", async ({ page }) => {
  expect(Math.min(...properties.map((p) => p.from))).toBe(prices.rentFrom);
  await page.goto("/properties");
  for (const p of properties) {
    await expect(page.locator(`a[href="/properties/${p.slug}"]`).filter({ hasText: "a month" }).first(), p.code).toContainText(`From ${sheet[p.code]} a month`);
  }
});

test("old Wix price cards read \"Starts from\" each home's own rent", async ({ page }) => {
  await page.goto("/properties-near-office-techparks");
  const text = ((await page.locator("main").textContent()) ?? "").replace(/\s+/g, " ");
  expect(text).toContain("Starts from");
  expect(text).not.toMatch(/at from|for from|from from|INR ?\d/);
  for (const [heading, price] of [["FF21 PODS", "₹14,000"], ["FF21 BGM", "₹15,750"], ["FF21 LIT", "₹17,000"], ["FF21 Kora", "₹17,300"], ["FF21 PMC", "₹16,450"], ["FF21 HBR", "₹15,750"]]) {
    expect(text, heading).toMatch(new RegExp(`${heading}.{0,200}?Starts from ?${price}`));
  }
  await page.goto("/pg-near-hoodi");
  const hoodi = (await page.locator("main").textContent()) ?? "";
  // FF21 PMC's three room cards, each from PMC's starting rent.
  expect(hoodi.match(/Price: from ₹16,450/g)).toHaveLength(3);
  expect(hoodi).not.toMatch(/Price: from ₹1[0-57-9]|INR ?\d/);
});

test("FF21 ITP is gone, and its pages go to its neighbours @smoke", async ({ page }) => {
  await page.goto("/properties/itp-whitefield");
  await expect(page).toHaveURL(/\/properties\/wfd-whitefield$/);
  await page.goto("/coliving-pgs-near-itpl");
  await expect(page).toHaveURL(/\/pg-near-itpl-bangalore$/);
  for (const path of ["/properties", "/luxury-pg-in-bangalore", "/whitefield-zhub"]) {
    await page.goto(path);
    expect((await page.locator("body").textContent()) ?? "", path).not.toMatch(/FF21[- ]ITP\b/);
  }
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
