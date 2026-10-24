import { readFileSync } from "node:fs";
import { expect, test } from "./fixtures";

// Search traffic depends on these: every old Wix URL and every URL Google
// sends visitors to must keep answering, and every sitemap URL must load.
// Plain requests (no browser), on one project only.

const legacy = readFileSync("tests/fixtures/legacy-urls.txt", "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

test.describe("URLs", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "once is enough"));

  test("every old URL still answers @smoke @after-deploy", async ({ request }) => {
    test.setTimeout(240_000);
    const broken: string[] = [];
    const queue = [...legacy];
    await Promise.all(
      Array.from({ length: 8 }, async () => {
        for (let path = queue.shift(); path; path = queue.shift()) {
          const res = await request.get(path, { maxRedirects: 2 });
          if (res.status() !== 200) broken.push(`${res.status()} ${path}`);
        }
      }),
    );
    expect(broken, "old URLs that no longer load").toEqual([]);
  });

  test("every sitemap URL loads, and nothing in it redirects", async ({ request, baseURL }) => {
    test.setTimeout(240_000);
    const xml = await (await request.get("/sitemap.xml")).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(urls.length).toBeGreaterThan(300);
    const bad: string[] = [];
    const queue = [...urls];
    await Promise.all(
      Array.from({ length: 8 }, async () => {
        for (let path = queue.shift(); path; path = queue.shift()) {
          const res = await request.get(new URL(path, baseURL).toString(), { maxRedirects: 0 });
          if (res.status() !== 200) bad.push(`${res.status()} ${path}`);
        }
      }),
    );
    expect(bad, "sitemap URLs that don't answer 200").toEqual([]);
  });

  test("robots.txt matches where the site runs @smoke", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    if (process.env.EXPECT_INDEXABLE === "1") {
      expect(robots).toContain("Allow: /");
      expect(robots).toContain("Sitemap: https://www.ff21.in/sitemap.xml");
    } else {
      expect(robots).toContain("Disallow: /");
    }
  });
});
