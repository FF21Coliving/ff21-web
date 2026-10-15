"use client";

import type { Attribution, Touch } from "./lead";

const KEY = "ff21_attribution";
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;

export function readAttribution(): Attribution {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Attribution;
  } catch {
    return {};
  }
}

// Records the first and the latest campaign touch, so a lead carries the ad or
// search that brought the visitor even if they register days later.
export function captureAttribution() {
  try {
    const url = new URL(window.location.href);
    const touch: Touch = { landing: url.pathname + url.search, ts: Date.now() };
    for (const k of PARAMS) {
      const v = url.searchParams.get(k);
      if (v) touch[k] = v.slice(0, 300);
    }
    const ref = document.referrer;
    if (ref && !ref.startsWith(window.location.origin)) touch.referrer = ref.slice(0, 300);

    const isCampaign = PARAMS.some((k) => touch[k]) || Boolean(touch.referrer);
    const stored = readAttribution();
    const next: Attribution = {
      first: stored.first ?? touch,
      last: isCampaign ? touch : (stored.last ?? touch),
    };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked (private mode); attribution is best effort.
  }
}
