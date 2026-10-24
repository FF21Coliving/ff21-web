import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

// Tests never reach the ad and analytics tags, so checks against the live
// site don't show up as visits in GA4, Google Ads or Meta.
const trackers = /googletagmanager\.com|google-analytics\.com|doubleclick\.net|googleadservices\.com|facebook\.(com|net)|connect\.facebook/;

export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route(trackers, (route) => route.abort());
    await provide(page);
  },
});
