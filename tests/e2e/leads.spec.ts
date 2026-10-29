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
  const res = await request.post("/api/lead", { data: { ...lead, phone: "", email: "nope", property: "nowhere" } });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(Object.keys(body.errors)).toEqual(expect.arrayContaining(["phone", "email", "property"]));
});

// One way to reach them is enough (28 Oct 2026): a wrong email with a good
// phone, or a wrong phone with a good email, still goes through.
test("a lead with only one good contact is accepted", async ({ request }) => {
  for (const data of [{ ...lead, email: "name@gmail.com3" }, { ...lead, phone: "12345" }]) {
    const res = await request.post("/api/lead", { data });
    expect(res.status(), JSON.stringify({ phone: data.phone, email: data.email })).toBe(200);
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
  await page.route("**/api/lead/progress", (route) => route.fulfill({ json: { ok: true } }));
  await page.goto("/find-my-home");
  const contactLeads = () =>
    page.evaluate(() => ((window as unknown as { dataLayer?: { event?: string; lead_id?: string }[] }).dataLayer ?? []).filter((e) => e.event === "contact_lead"));
  for (let i = 0; i < 2; i++) {
    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Last name").fill("Guardrail");
    await page.locator('input[name="phone"]').fill("9876543210");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect.poll(async () => (await contactLeads()).length).toBe(1);
    if (i === 0) await page.getByRole("button", { name: "Previous question" }).click();
  }
  const [counted] = await contactLeads();
  expect(counted.lead_id).toBeTruthy();
});
