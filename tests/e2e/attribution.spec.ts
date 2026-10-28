import { expect, test } from "./fixtures";
import { channelOf } from "../../src/lib/channel";
import { cameFromOf, inferSource, leadChannel, leadSourceFor, utmOf, type Attribution } from "../../src/lib/lead";

// Which source a website lead gets in Zoho (28 Oct 2026): a tracked ad click
// decides it; otherwise the visitor's answer; otherwise "Website".
test.describe("Lead attribution", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "once is enough"));

  const google: Attribution = { first: { gclid: "abc", gad_campaignid: "23447782277", landing: "/?gclid=abc" } };
  const iphone: Attribution = { first: { gbraid: "xyz", gad_campaignid: "22420203810", landing: "/" } };
  const metaAd: Attribution = { first: { utm_source: "ig", utm_medium: "paid", utm_campaign: "120250318974920307", fbclid: "f1" } };
  const instagram: Attribution = { first: { referrer: "https://l.instagram.com/" } };
  const search: Attribution = { first: { referrer: "https://www.google.com/" } };

  test("an ad click decides the Lead Source, whatever the visitor answered", () => {
    expect(leadSourceFor(google, "Reference", "Website")).toBe("Google");
    expect(leadSourceFor(iphone, "Walk Ins", "Website")).toBe("Google");
    expect(leadSourceFor(metaAd, "Google", "Website")).toBe("Meta Ads");
    expect(leadSourceFor(instagram, undefined, "Website")).toBe("Social Media");
  });

  test("without an ad click, the visitor's answer, else Website", () => {
    expect(leadSourceFor(search, "Reference", "Website")).toBe("Reference");
    expect(leadSourceFor(search, undefined, "Website")).toBe("Website");
    expect(leadSourceFor(undefined, undefined, "Website")).toBe("Website");
    // Updates have no fallback, so they never overwrite the source with "Website".
    expect(leadSourceFor(search, undefined)).toBeUndefined();
  });

  test("untagged Google ad clicks fill the campaign fields", () => {
    expect(utmOf(google)).toMatchObject({ source: "google", medium: "cpc", campaign: "23447782277", gclid: "abc" });
    expect(utmOf(iphone)).toMatchObject({ source: "google", medium: "cpc", campaign: "22420203810" });
    expect(cameFromOf(iphone)).toBe("Google Ads (campaign 22420203810)");
  });

  test("a later visit from Google search keeps the ad click that came first", () => {
    const back: Attribution = { first: google.first, last: { referrer: "https://www.google.com/", landing: "/find-my-home" } };
    expect(leadChannel(back)).toBe("Google Ads");
    expect(leadSourceFor(back, "Social Media", "Website")).toBe("Google");
  });

  test("the pre-filled answer agrees with the ad that brought them", () => {
    const back: Attribution = { first: metaAd.first, last: { referrer: "https://www.google.com/" } };
    expect(inferSource(back)).toBe("Social Media");
    expect(inferSource(iphone)).toBe("Google");
  });

  test("only Meta's own sources count as Meta Ads", () => {
    expect(channelOf({ source: "digital", medium: "cpc" })).toBe("Other ads");
    expect(channelOf({ source: "ig", medium: "paid" })).toBe("Meta Ads");
    expect(channelOf({ source: "facebook_ads", medium: "cpc" })).toBe("Meta Ads");
  });
});
