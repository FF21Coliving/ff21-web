"use client";

import { logEvent } from "./site-log";

type Params = Record<string, string | number | undefined>;

export type TrackEvent = "generate_lead" | "contact_lead" | "form_start" | "find_home_step" | "whatsapp_click" | "call_click" | "view_property" | "video_play";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const mode = process.env.NEXT_PUBLIC_TAG_MODE ?? "off";
const adsId = process.env.NEXT_PUBLIC_GADS_ID;
const adsLeadLabel = process.env.NEXT_PUBLIC_GADS_LEAD_LABEL;

const metaEvents: Partial<Record<TrackEvent, string>> = {
  generate_lead: "Lead",
  whatsapp_click: "Contact",
  call_click: "Contact",
  view_property: "ViewContent",
};

// Every event goes to the dataLayer and FF21's own log. In "gtm" mode the GTM container decides
// where it goes; in "direct" mode we also call GA4, Google Ads and Meta here.
export function track(event: TrackEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  // FF21's own log (the dashboard's Website tab) gets every event too.
  const detail = params.step ?? params.placement ?? params.video ?? params.property;
  logEvent(event, detail === undefined ? undefined : String(detail));

  if (mode !== "direct") return;
  window.gtag?.("event", event, params);
  // Google Ads counts a lead once the visitor's contact details are saved,
  // which is when the lead reaches Zoho: about half never send the last step.
  // The lead's id lets Google drop a repeat of the same lead.
  if (event === "contact_lead" && adsId && adsLeadLabel) {
    window.gtag?.("event", "conversion", { send_to: `${adsId}/${adsLeadLabel}`, transaction_id: params.lead_id });
  }
  const metaEvent = metaEvents[event];
  if (metaEvent) window.fbq?.("track", metaEvent, params);
}
