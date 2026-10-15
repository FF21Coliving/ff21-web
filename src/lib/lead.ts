import { properties } from "./properties";

// Picklist values must match the Zoho CRM web form exactly.
export const genders = ["Female", "Male", "Couple"] as const;
// "Less than 3 months" is below the minimum stay and isn't in Zoho's picklist;
// it reaches the sales team through the summary instead.
export const stays = ["Less than 3 months", "3 months", "6 months", "1 year and more"] as const;
export const sources = ["Google", "Social Media", "Reference", "Housing.com", "Magicbricks", "Walk Ins"] as const;

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
  phone: string;
  email: string;
  gender: Gender;
  property: string;
  stay?: Stay;
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
  const t = a?.last ?? a?.first;
  if (!t) return undefined;
  const hay = `${t.utm_source ?? ""} ${t.referrer ?? ""}`.toLowerCase();
  if (t.gclid || /google/.test(hay)) return "Google";
  if (t.fbclid || /facebook|instagram|\bfb\b|\big\b|meta/.test(hay)) return "Social Media";
  if (/housing/.test(hay)) return "Housing.com";
  if (/magicbricks/.test(hay)) return "Magicbricks";
  return undefined;
}

function cleanTouch(v: unknown): Touch | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "landing", "referrer"] as const;
  const t: Touch = {};
  for (const k of keys) {
    const s = str(o[k], 300);
    if (s) t[k] = s;
  }
  if (typeof o.ts === "number") t.ts = o.ts;
  return t;
}

export type Contact = Pick<Lead, "firstName" | "lastName" | "phone" | "email" | "referralCode"> & { source?: Source };

export const isLeadId = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

// The first step of Find my home: who to call. Saved before anything else.
// How they heard of us is asked last, so it is optional here.
export function validateContact(body: unknown): { ok: true; contact: Contact } | { ok: false; errors: LeadErrors } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const errors: LeadErrors = {};
  const firstName = str(b.firstName, 60);
  const lastName = str(b.lastName, 60);
  const email = str(b.email, 120).toLowerCase();
  const phone = normalizePhone(str(b.phone, 30));
  const source = str(b.source) as Source;

  if (!firstName) errors.firstName = "Please add your first name.";
  if (!lastName) errors.lastName = "Please add your last name.";
  if (!phone) errors.phone = "Please add a valid mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Please add a valid email address.";
  if (source && !sources.includes(source)) errors.source = "Please choose how you heard about us.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, contact: { firstName, lastName, phone: phone!, email, source: source || undefined, referralCode: str(b.referralCode, 40) || undefined } };
}

export function validateLead(body: unknown): { ok: true; lead: Lead } | { ok: false; errors: LeadErrors } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const checked = validateContact(b);
  const errors: LeadErrors = checked.ok ? {} : { ...checked.errors };

  const gender = str(b.gender) as Gender;
  const property = str(b.property);
  const stay = str(b.stay) as Stay;
  const places = Array.isArray(b.places) ? b.places.map((x) => str(x, 60)).filter(Boolean).slice(0, 8) : [];

  if (!genders.includes(gender)) errors.gender = "Please choose one.";
  if (!properties.some((p) => p.slug === property)) errors.property = "Please choose a home.";
  if (stay && !stays.includes(stay)) errors.stay = "Please choose a stay length.";
  if (checked.ok && !checked.contact.source) errors.source = "Please tell us how you heard about us.";

  if (!checked.ok || Object.keys(errors).length) return { ok: false, errors };
  const { firstName, lastName, phone, email, referralCode } = checked.contact;
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
      gender,
      property,
      stay: stay || undefined,
      source,
      referralCode,
      page: str(b.page, 300) || undefined,
      attribution: { first: cleanTouch(attribution.first), last: cleanTouch(attribution.last) },
    },
  };
}

// One line for the sales team: the answers Zoho has no picklist for.
export function leadSummary(lead: Lead) {
  const parts: string[] = [];
  if (lead.moveIn) parts.push(`Move-in: ${lead.moveIn}`);
  if (lead.stay) parts.push(`Stay: ${lead.stay}`);
  if (lead.budget) parts.push(`Budget: ${lead.budget}`);
  if (lead.room) parts.push(`Room: ${lead.room}`);
  if (lead.places?.length) parts.push(`Works or studies near: ${lead.places.join(", ")}`);
  parts.push(`Via: ${lead.form === "find-my-home" ? "Find my home" : "Register"} on ff21.in`);
  return parts.join(" | ");
}
