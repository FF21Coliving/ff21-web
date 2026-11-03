import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// The lead form is the site's job. These run only on our own build (never
// against the live site): there LEADS_MODE is unset, so leads are checked
// and logged but never sent to Zoho or saved.
test.skip(Boolean(process.env.BASE_URL), "never post leads to a live site");
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "once is enough"));

const lead = {
  firstName: "Test",
  lastName: "Guardrail",
  phone: "9876543210",
  email: "test@example.com",
  gender: "Female",
  property: "kdh-kundanahalli",
  source: "Google",
  elapsedMs: 30_000,
};

test("a complete lead is accepted", async ({ request }) => {
  const res = await request.post("/api/lead", { data: lead });
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, mode: "test" });
});

test("missing details are refused with reasons", async ({ request }) => {
  const res = await request.post("/api/lead", { data: { ...lead, firstName: "", phone: "", property: "nowhere" } });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(Object.keys(body.errors)).toEqual(expect.arrayContaining(["firstName", "phone", "property"]));
});

// Name, mobile number and email are required (30 Oct 2026); the last name is
// optional.
test("name, mobile number and email are required; last name is not", async ({ request }) => {
  const ok = await request.post("/api/lead", { data: { ...lead, lastName: "" } });
  expect(ok.status()).toBe(200);
  for (const data of [{ ...lead, phone: "12345" }, { ...lead, phone: "" }, { ...lead, firstName: "" }, { ...lead, email: "" }, { ...lead, email: "name@gmail.com3" }]) {
    const res = await request.post("/api/lead", { data });
    expect(res.status(), JSON.stringify({ firstName: data.firstName, phone: data.phone, email: data.email })).toBe(422);
  }
});

test("bots get a quiet yes and nothing else", async ({ request }) => {
  const res = await request.post("/api/lead", { data: { ...lead, website: "spam.example" } });
  expect(await res.json()).toEqual({ ok: true });
});

test("Find my home opens on its first question", async ({ page }) => {
  await page.goto("/find-my-home");
  await expect(page.locator("h1, h2").first()).toBeVisible();
  await expect(page.getByRole("button").first()).toBeVisible();
});

// Google Ads counts a lead when the contact details are saved, once per form
// run and with the lead's id, not when the whole form is sent (29 Oct 2026):
// about half of the people who leave a number never send the last step.
test("the ad platforms count a lead at the contact step, once", async ({ page }) => {
  await page.route("**/api/lead/progress", (route) => route.fulfill({ json: { ok: true, lead: true } }));
  await page.goto("/find-my-home");
  const contactLeads = () =>
    page.evaluate(() => ((window as unknown as { dataLayer?: { event?: string; lead_id?: string }[] }).dataLayer ?? []).filter((e) => e.event === "contact_lead"));
  for (let i = 0; i < 2; i++) {
    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Last name").fill("Guardrail");
    await page.locator('input[name="phone"]').fill("9876543210");
    await page.getByLabel("Email").fill("test@example.com");
    const replied = page.waitForResponse("**/api/lead/progress");
    await page.getByRole("button", { name: "Continue" }).click();
    await replied;
    await expect.poll(async () => (await contactLeads()).length).toBe(1);
    // Let the reply's handler run before counting again.
    await page.waitForTimeout(300);
    expect(await contactLeads()).toHaveLength(1);
    if (i === 0) await page.getByRole("button", { name: "Previous question" }).click();
  }
  const [counted] = await contactLeads();
  expect(counted.lead_id).toBeTruthy();
});

// Every dataLayer event, kept across page loads in the tab's sessionStorage,
// so a count covers the form page and /thank-you together.
async function recordEvents(page: Page) {
  await page.addInitScript(() => {
    const dl: unknown[] = [];
    dl.push = (...items: unknown[]) => {
      for (const e of items) {
        const name = (e as { event?: string })?.event;
        if (name) sessionStorage.setItem("test-events", `${sessionStorage.getItem("test-events") ?? ""}${name},`);
      }
      return Array.prototype.push.apply(dl, items);
    };
    (window as unknown as { dataLayer: unknown[] }).dataLayer = dl;
  });
}
const events = (page: Page, name: string) => page.evaluate((n) => (sessionStorage.getItem("test-events") ?? "").split(",").filter((e) => e === n).length, name);

// Fills the contact step, then answers or skips every question up to "Book now".
async function finishForm(page: Page) {
  await page.route("**/api/lead/progress", (route) => route.fulfill({ json: { ok: true, lead: true } }));
  await page.route("**/api/lead", (route) => route.fulfill({ json: { ok: true, mode: "test" } }));
  await page.goto("/");
  await page.goto("/find-my-home?property=kdh-kundanahalli");
  await page.getByLabel("First name").fill("Test");
  await page.locator('input[name="phone"]').fill("9876543210");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  const bookNow = page.getByRole("button", { name: "Book now" });
  const question = page.locator("h1");
  await expect(question).not.toHaveText("");
  for (let i = 0; i < 12 && !(await bookNow.isVisible()); i++) {
    const asked = await question.textContent();
    const woman = page.getByRole("button", { name: "A woman" });
    const skip = page.getByRole("button", { name: "Skip for now" });
    if (await woman.isVisible()) await woman.click();
    else if (await skip.isVisible()) await skip.click();
    else await page.getByRole("button", { name: "Continue" }).click();
    await expect(question).not.toHaveText(asked ?? "");
  }
  await page.getByRole("list", { name: "How you heard of us" }).getByRole("button").first().click();
  await bookNow.click();
}

// The team's ad conversions fire on an address with "thank-you" in it, as on
// the Wix site (3 Nov 2026): a finished form opens /thank-you as a new page,
// which counts the lead once, even if it's reloaded.
test("a finished form opens /thank-you and counts the lead there, once", async ({ page }) => {
  await recordEvents(page);
  await finishForm(page);
  await page.waitForURL("**/thank-you");
  await expect(page.getByRole("heading", { name: "You're all set, Test." })).toBeVisible();
  await expect(page.getByText("FF21 KDH")).not.toHaveCount(0);
  await expect.poll(() => events(page, "generate_lead")).toBe(1);
  await page.reload();
  await expect(page.getByRole("heading", { name: "You're all set, Test." })).toBeVisible();
  await page.waitForTimeout(500);
  expect(await events(page, "generate_lead")).toBe(1);
  // Back skips the sent form, so it can't be sent twice.
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("without sessionStorage the form thanks people in place, and counts once", async ({ page }) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === "ff21-finished") throw new Error("storage is off");
      return setItem.call(this, key, value);
    };
  });
  await recordEvents(page);
  await finishForm(page);
  await expect(page.getByRole("heading", { name: "You're all set, Test." })).toBeVisible();
  await expect(page).toHaveURL(/\/find-my-home/);
  expect(await events(page, "generate_lead")).toBe(1);
});

test("/thank-you opened on its own thanks the visitor and logs nothing", async ({ page }) => {
  await recordEvents(page);
  const progress: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/lead")) progress.push(r.url());
  });
  await page.goto("/thank-you");
  await expect(page.getByRole("heading", { name: "Thank you." })).toBeVisible();
  await expect(page.getByText("Our team will be in touch to set up your visit")).toBeVisible();
  await page.waitForTimeout(500);
  expect(await events(page, "generate_lead")).toBe(0);
  expect(await events(page, "find_home_step")).toBe(0);
  expect(progress).toEqual([]);
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
});

test("a bot's quiet yes is not counted as a lead", async ({ page }) => {
  await page.route("**/api/lead/progress", (route) => route.fulfill({ json: { ok: true } }));
  await page.goto("/find-my-home");
  await page.getByLabel("First name").fill("Test");
  await page.getByLabel("Last name").fill("Guardrail");
  await page.locator('input[name="phone"]').fill("9876543210");
  await page.getByLabel("Email").fill("test@example.com");
  const replied = page.waitForResponse("**/api/lead/progress");
  await page.getByRole("button", { name: "Continue" }).click();
  await replied;
  await page.waitForTimeout(300);
  const counted = await page.evaluate(() => ((window as unknown as { dataLayer?: { event?: string }[] }).dataLayer ?? []).filter((e) => e.event === "contact_lead").length);
  expect(counted).toBe(0);
});
