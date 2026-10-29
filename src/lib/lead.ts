import { channelOf } from "./channel";
import { properties } from "./properties";

// Picklist values must match the Zoho CRM web form exactly.
export const genders = ["Female", "Male", "Couple"] as const;
// "Less than 3 months" is below the minimum stay and isn't in Zoho's picklist;
// it reaches the sales team through the summary instead.
export const stays = ["Less than 3 months", "3 months", "6 months", "1 year and more"] as const;
export const sources = ["Google", "Social Media", "Reference", "Housing.com", "MagicBricks", "Walk Ins"] as const;

// Visit requests from Find my home: a day, a part of the day within visiting
// hours, and in person or on video. Zoho's Visit Type picklist uses
// Physical and Virtual.
export const visitWindows = ["Morning", "Afternoon", "Evening"] as const;
export const visitWindowHours: Record<VisitWindow, string> = { Morning: "9am to 12pm", Afternoon: "12pm to 4pm", Evening: "4pm to 8pm" };
export const visitTypes = ["Physical", "Virtual"] as const;
export type VisitWindow = (typeof visitWindows)[number];
export type VisitType = (typeof visitTypes)[number];

// Today in Bangalore, as YYYY-MM-DD.
export const istDay = (at: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(at);

// A visit day the site will pass on: a real date from today to 30 days out.
export function visitDayOk(v: unknown, now = Date.now()): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const t = Date.parse(`${v}T00:00:00Z`);
  const today = Date.parse(`${istDay(now)}T00:00:00Z`);
  return !Number.isNaN(t) && t >= today && t <= today + 30 * 86_400_000;
}

export function visitLabel(day: string, window?: VisitWindow, type?: VisitType) {
  const d = new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const when = [d, window && `${window.toLowerCase()} (${visitWindowHours[window]})`].filter(Boolean).join(", ");
  return type ? `${when}, ${type === "Virtual" ? "on video" : "in person"}` : when;
}

export type Gender = (typeof genders)[number];
export type Stay = (typeof stays)[number];
export type Source = (typeof sources)[number];

export type Touch = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  // Google's ad click ids from iPhones and apps, where gclid isn't allowed.
  gbraid?: string;
  wbraid?: string;
  // The Google Ads campaign a click came from (Google adds it to every ad URL).
  gad_campaignid?: string;
  fbclid?: string;
  landing?: string;
  referrer?: string;
  ts?: number;
};

export type Attribution = { first?: Touch; last?: Touch };

export type Lead = {
  id?: string;
  form: "find-my-home" | "register";
  moveIn?: string;
  budget?: string;
  room?: string;
  places?: string[];
  firstName: string;
  lastName: string;
  // Either may be "" when only the other was valid (Madhvik, 28 Oct 2026:
  // one right is enough). What was typed for the wrong one is in unverified.
  phone: string;
  email: string;
  unverified?: Unverified;
  gender: Gender;
  property: string;
  stay?: Stay;
  visitDay?: string;
  visitWindow?: VisitWindow;
  visitType?: VisitType;
  source: Source;
  referralCode?: string;
  page?: string;
  attribution: Attribution;
};

export type LeadErrors = Partial<Record<keyof Lead, string>>;

const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Indian mobile numbers become +91XXXXXXXXXX; other countries need a leading +.
export function normalizePhone(input: string): string | null {
  const raw = input.replace(/[\s\-().]/g, "");
  if (raw.startsWith("+") && !raw.startsWith("+91")) {
    return /^\+[1-9]\d{7,14}$/.test(raw) ? raw : null;
  }
  let digits = raw.replace(/^\+/, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export function inferSource(a: Attribution | undefined): Source | undefined {
  // The same visit Lead Source goes by, so the pre-filled answer agrees with it.
  const t = campaignTouch(a);
  if (!t) return undefined;
  const hay = `${t.utm_source ?? ""} ${t.referrer ?? ""}`.toLowerCase();
  if (googleClick(t) || /google/.test(hay)) return "Google";
  if (t.fbclid || /facebook|instagram|\bfb\b|\big\b|meta/.test(hay)) return "Social Media";
  if (/housing/.test(hay)) return "Housing.com";
  if (/magicbricks/.test(hay)) return "MagicBricks";
  return undefined;
}

// Attribution as sent by the browser, kept to known string fields.
export const cleanAttribution = (v: unknown): Attribution | undefined => {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const a: Attribution = { first: cleanTouch(o.first), last: cleanTouch(o.last) };
  return a.first || a.last ? a : undefined;
};

function cleanTouch(v: unknown): Touch | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "gad_campaignid", "fbclid", "landing", "referrer"] as const;
  const t: Touch = {};
  for (const k of keys) {
    const s = str(o[k], 300);
    if (s) t[k] = s;
  }
  if (typeof o.ts === "number") t.ts = o.ts;
  return t;
}

// A phone or email that looked wrong, kept as typed so the team can check it.
export type Unverified = { phone?: string; email?: string };

export type Contact = Pick<Lead, "firstName" | "lastName" | "phone" | "email" | "referralCode" | "unverified"> & { source?: Source };

export const isLeadId = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

// The first step of Find my home: who to call. Saved before anything else.
// How they heard of us is asked last, so it is optional here.
export const isEmail = (email: string) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,24}$/.test(email.toLowerCase());

export function validateContact(body: unknown): { ok: true; contact: Contact } | { ok: false; errors: LeadErrors } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const errors: LeadErrors = {};
  const firstName = str(b.firstName, 60);
  const lastName = str(b.lastName, 60);
  const typedEmail = str(b.email, 120);
  const typedPhone = str(b.phone, 30);
  const email = typedEmail.toLowerCase();
  const phone = normalizePhone(typedPhone);
  const source = str(b.source) as Source;

  // A first name and a mobile number are all a lead needs (29 Oct 2026): the
  // team calls or WhatsApps everyone. The last name and email are optional; a
  // typed email that looks wrong goes to Zoho as a note instead of blocking.
  if (!firstName) errors.firstName = "Please add your name.";
  if (!phone) errors.phone = "Please add a valid 10-digit mobile number.";
  // The ending must be letters only: "gmail.com3" got past the old check and
  // Zoho refused it (28 Oct 2026).
  const emailOk = isEmail(email);
  if (source && !sources.includes(source)) errors.source = "Please choose how you heard about us.";
  if (Object.keys(errors).length) return { ok: false, errors };
  const unverified: Unverified = {};
  if (!emailOk && typedEmail) unverified.email = typedEmail;
  return {
    ok: true,
    contact: {
      firstName,
      lastName,
      phone: phone ?? "",
      email: emailOk ? email : "",
      ...(Object.keys(unverified).length ? { unverified } : {}),
      source: source || undefined,
      referralCode: str(b.referralCode, 40) || undefined,
    },
  };
}

export function validateLead(body: unknown): { ok: true; lead: Lead } | { ok: false; errors: LeadErrors } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const checked = validateContact(b);
  const errors: LeadErrors = checked.ok ? {} : { ...checked.errors };

  const gender = str(b.gender) as Gender;
  const property = str(b.property);
  const stay = str(b.stay) as Stay;
  const places = Array.isArray(b.places) ? b.places.map((x) => str(x, 60)).filter(Boolean).slice(0, 8) : [];
  const visit = visitOf(b);

  if (!genders.includes(gender)) errors.gender = "Please choose one.";
  if (!properties.some((p) => p.slug === property)) errors.property = "Please choose a home.";
  if (stay && !stays.includes(stay)) errors.stay = "Please choose a stay length.";
  if (checked.ok && !checked.contact.source) errors.source = "Please tell us how you heard about us.";

  if (!checked.ok || Object.keys(errors).length) return { ok: false, errors };
  const { firstName, lastName, phone, email, referralCode, unverified } = checked.contact;
  const source = checked.contact.source!;

  const attribution = (b.attribution ?? {}) as Record<string, unknown>;
  return {
    ok: true,
    lead: {
      id: isLeadId(b.id) ? b.id : undefined,
      form: b.form === "register" ? "register" : "find-my-home",
      moveIn: str(b.moveIn, 60) || undefined,
      budget: str(b.budget, 60) || undefined,
      room: str(b.room, 60) || undefined,
      places: places.length ? places : undefined,
      firstName,
      lastName,
      phone,
      email,
      unverified,
      gender,
      property,
      stay: stay || undefined,
      ...visit,
      source,
      referralCode,
      page: str(b.page, 300) || undefined,
      attribution: { first: cleanTouch(attribution.first), last: cleanTouch(attribution.last) },
    },
  };
}

// The visit fields of a request, kept only if they make sense together.
export function visitOf(b: Record<string, unknown>): Pick<Lead, "visitDay" | "visitWindow" | "visitType"> {
  if (!visitDayOk(b.visitDay)) return {};
  const window = visitWindows.find((w) => w === b.visitWindow);
  const type = visitTypes.find((t) => t === b.visitType) ?? "Physical";
  return { visitDay: b.visitDay, visitWindow: window, visitType: type };
}

// One line for the sales team: the answers Zoho has no picklist for.
export function summarize(a: Pick<Lead, "moveIn" | "stay" | "budget" | "room" | "places" | "visitDay" | "visitWindow" | "visitType">, form: Lead["form"] = "find-my-home") {
  const parts: string[] = [];
  if (a.visitDay) parts.push(`Visit requested: ${visitLabel(a.visitDay, a.visitWindow, a.visitType)}`);
  if (a.moveIn) parts.push(`Move-in: ${a.moveIn}`);
  if (a.stay) parts.push(`Stay: ${a.stay}`);
  if (a.budget) parts.push(`Budget: ${a.budget}`);
  if (a.room) parts.push(`Room: ${a.room}`);
  if (a.places?.length) parts.push(`Works or studies near: ${a.places.join(", ")}`);
  parts.push(`Via: ${form === "find-my-home" ? "Find my home" : "Register"} on ff21.in`);
  return parts.join(" | ");
}

export const leadSummary = (lead: Lead) => summarize(lead, lead.form);

// UTM tags and ad click ids from the visit, for Zoho's campaign fields.
// The campaign behind a lead: the latest visit that carried one. A return
// visit straight from Google search carries none, and taking it would lose
// the ad click that brought the visitor first (28 Oct 2026).
const googleClick = (t?: Touch) => Boolean(t && (t.gclid || t.gbraid || t.wbraid));
const hasCampaign = (t?: Touch) => Boolean(t && (t.utm_source || t.utm_medium || t.utm_campaign || t.gad_campaignid || t.fbclid || googleClick(t)));
const campaignTouch = (a: Attribution | undefined) => (hasCampaign(a?.last) ? a?.last : hasCampaign(a?.first) ? a?.first : (a?.last ?? a?.first));

// Untagged ad clicks still say where they came from: a Google click id means
// Google Ads (campaign from gad_campaignid), fbclid means Meta.
export function utmOf(a: Attribution | undefined) {
  const t = campaignTouch(a);
  if (!t) return undefined;
  const google = googleClick(t);
  return {
    source: t.utm_source ?? (google ? "google" : t.fbclid ? "meta" : undefined),
    medium: t.utm_medium ?? (google ? "cpc" : undefined),
    campaign: t.utm_campaign ?? t.gad_campaignid,
    term: t.utm_term,
    content: t.utm_content,
    gclid: t.gclid,
  };
}

// The channel the lead's campaign visit came through, the same way the
// dashboard's Website tab names it (lib/channel.ts).
export function leadChannel(a: Attribution | undefined): string {
  const t = campaignTouch(a);
  if (!t) return "Direct";
  return channelOf({ ref: t.referrer, source: t.utm_source, medium: t.utm_medium, click: googleClick(t) ? "gclid" : t.fbclid ? "fbclid" : undefined });
}

// Zoho's Lead Source for a website lead (Madhvik, 28 Oct 2026): a tracked ad
// click decides it (Google Ads as "Google", like the old Wix form; Meta ads as
// "Meta Ads"; Instagram and other Meta links as "Social Media"); otherwise what
// the visitor told us, else `fallback`. Their own answer still goes in the
// notes (see zohoInput), so nothing is lost when the two differ.
export function leadSourceFor(a: Attribution | undefined, said: string | undefined, fallback?: string): string | undefined {
  const channel = a ? leadChannel(a) : "";
  if (channel === "Google Ads") return "Google";
  if (channel === "Meta Ads") return "Meta Ads";
  if (["Instagram", "Facebook", "Meta (ads or posts)"].includes(channel)) return "Social Media";
  return said ?? fallback;
}

// A short line for the notes: where the visit came from.
export function cameFromOf(a: Attribution | undefined): string | undefined {
  if (!a?.first && !a?.last) return undefined;
  const campaign = utmOf(a)?.campaign;
  return `${leadChannel(a)}${campaign ? ` (campaign ${campaign})` : ""}`;
}
