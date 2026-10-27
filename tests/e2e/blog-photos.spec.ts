import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "./fixtures";

// The blog's photos were copied off Wix's image service on 27 Oct 2026 (see
// scripts/photos/build-blog.py), which resized each one on request, often
// taking 0.5–2 s. Every photo a post shows must now be on the site.

type Post = { path: string; image?: string | null; blocks: { t: string; id?: string }[] };
const posts = JSON.parse(readFileSync("src/content/wix/blog.json", "utf8")) as Post[];
// Keep in step with `retired` and `takenDown` in src/lib/wix-content.ts.
const retired = "3a848c_cd0a5381b37143ed89554cbe4a3ac550~mv2.png";
const takenDown = new Set([
  "/blog/pg-near-bagmane-tech-park-for-ladies-under-12000",
  "/blog/pg-near-manyata-tech-park-under-12000-bangalore",
  "/blog/top-10-affordable-pgs-near-brookefield-bangalore",
]);
const file = (id: string, end: string) => `public/blog-photos/${id.split("~")[0]}-${end}`;

test.describe("Blog photos", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "once is enough"));

  test("every photo a post shows is on the site", () => {
    const missing: string[] = [];
    for (const p of posts.filter((p) => !takenDown.has(p.path))) {
      const ids = p.blocks.flatMap((b) => (b.t === "img" && b.id && b.id !== retired ? [b.id] : []));
      for (const id of ids) for (const w of ["640.webp", "1080.webp"]) if (!existsSync(file(id, w))) missing.push(file(id, w));
      const cover = p.image === retired ? ids[0] : p.image;
      if (cover) for (const end of ["640.webp", "1080.webp", "og.jpg"]) if (!existsSync(file(cover, end))) missing.push(file(cover, end));
    }
    expect(missing).toEqual([]);
  });

  test("the blog and area pages load nothing from Wix @smoke", async ({ page, request }) => {
    for (const path of ["/blog", "/blog/list-of-companies-in-bagmane-tech-park-in-2024", "/blog/places-to-visit-near-bangalore-airport", "/luxury-pg-in-bangalore"]) {
      await page.goto(path);
      const wix = await page.locator("img").evaluateAll((els) =>
        els.map((e) => `${e.getAttribute("src") ?? ""} ${e.getAttribute("srcset") ?? ""}`).filter((s) => s.includes("wixstatic.com")),
      );
      expect(wix, `${path} photos from Wix`).toEqual([]);
      // The link-preview picture too, and it must load.
      const og = (await page.locator('meta[property="og:image"]').first().getAttribute("content")) ?? "";
      expect(og, `${path} og:image`).not.toContain("wixstatic.com");
      expect((await request.get(new URL(og).pathname)).status(), `${path} og:image loads`).toBe(200);
    }
  });
});
