import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getProperty } from "./properties";

// Leads go straight into Zoho CRM through its API (LEADS_MODE=zoho-api):
// created when a visitor gives their contact details, then updated as they
// answer more. Rules, agreed with Madhvik:
//   - The site only ever CREATES leads, and UPDATES leads it created itself.
//     Every lead it creates comes back to the browser as a signed reference;
//     an update without a valid signature is refused, so the site can never be
//     pointed at an existing lead.
//   - It writes only the fields listed in toZoho() below. Nothing else in Zoho
//     (fields, picklists, workflows, other records) is read or changed.
//   - Picklist values are sent exactly as they exist in Zoho (checked 16 Oct 2026).
// The API token needs ZohoCRM.modules.leads.CREATE and .UPDATE; the daily
// outcome check (lead-outcomes.ts) also reads leads, contacts and deals.

const accountsUrl = () => process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.in";
export const apiUrl = () => process.env.ZOHO_API_URL ?? "https://www.zohoapis.in";

export const zohoApiEnabled = () =>
  process.env.LEADS_MODE === "zoho-api" && Boolean(process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_SECRET && process.env.ZOHO_REFRESH_TOKEN);

// --- the signed reference -------------------------------------------------

// Signed with ZOHO_REF_SECRET if set, otherwise with a key derived from the
// client secret, so no extra secret is needed.
const refKey = () => process.env.ZOHO_REF_SECRET || (process.env.ZOHO_CLIENT_SECRET ? createHmac("sha256", process.env.ZOHO_CLIENT_SECRET).update("ff21-lead-ref").digest("hex") : "");
const sign = (id: string) => createHmac("sha256", refKey()).update(`ff21-lead:${id}`).digest("base64url");

// A lead created without its phone or email (another Zoho lead already has
// it) carries a note saying so; the note rides in the reference so every
// later update keeps it at the top of Description.
export type ZohoRef = { id: string; note?: string };

export const makeRef = (id: string, note?: string) =>
  note ? `${id}.${sign(`${id}\n${note}`)}.${Buffer.from(note).toString("base64url")}` : `${id}.${sign(id)}`;

// The Zoho record (and its note) inside a reference, only if the site signed it.
export function readRef(ref: unknown): ZohoRef | undefined {
  if (typeof ref !== "string" || !refKey()) return undefined;
  const [id, sig, encoded] = ref.split(".");
  if (!id || !sig || !/^\d{6,25}$/.test(id)) return undefined;
  const note = encoded ? Buffer.from(encoded, "base64url").toString("utf8") : undefined;
  const want = Buffer.from(sign(note ? `${id}\n${note}` : id));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got) ? { id, note } : undefined;
}

// --- the record --------------------------------------------------------------

export type ZohoLeadInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  source?: string;
  referralCode?: string;
  property?: string; // site slug
  gender?: string;
  stay?: string;
  room?: string;
  // A requested visit (YYYY-MM-DD, Physical or Virtual); the team confirms it.
  visitDay?: string;
  visitType?: string;
  summary?: string;
  // The website's first guess (lib/lead-score.ts): Hot, Warm or Cold, and why.
  qualification?: string;
  scoreNote?: string;
  page?: string;
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string; gclid?: string };
};

// Zoho's Minimum Stay picklist counts days.
const stayValues: Record<string, string> = {
  "Less than 3 months": "Less than 90",
  "3 months": "90",
  "6 months": "180",
  "1 year and more": "1 year or more",
};

export function toZoho(i: ZohoLeadInput): Record<string, string> {
  const home = i.property ? getProperty(i.property) : undefined;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ff21.in";
  const r: Record<string, string | undefined> = {
    First_Name: i.firstName,
    Last_Name: i.lastName,
    Phone: i.phone,
    Email: i.email,
    Lead_Source: i.source,
    Referral_Code: i.referralCode,
    FF21_Property: home?.zohoValue,
    FF21_Property_Name1: home?.code,
    Property_Page: home ? `${site}/properties/${home.slug}` : undefined,
    Gender: i.gender,
    Minimum_Stay: i.stay ? stayValues[i.stay] : undefined,
    Room_Type_Requirement: i.room,
    Site_Visit_Schedule_Date: i.visitDay,
    Visit_Type: i.visitDay ? i.visitType : undefined,
    Lead_Qualification: i.qualification,
    Description: [i.scoreNote, i.summary].filter(Boolean).join(" | ") || undefined,
    Campaign_Source1: i.utm?.source,
    Campaign_Medium: i.utm?.medium,
    Campaign_Name: i.utm?.campaign,
    Campaign_Term: i.utm?.term,
    Campaign_Content: i.utm?.content,
    GCLID: i.utm?.gclid,
  };
  return Object.fromEntries(Object.entries(r).filter((e): e is [string, string] => typeof e[1] === "string" && e[1] !== ""));
}

// --- the API -------------------------------------------------------------------

let token: { value: string; until: number } | undefined;

export async function accessToken() {
  if (token && token.until > Date.now() + 60_000) return token.value;
  const q = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    grant_type: "refresh_token",
  });
  const res = await fetch(`${accountsUrl()}/oauth/v2/token?${q}`, { method: "POST", signal: AbortSignal.timeout(8_000) });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!body.access_token) throw new Error(`Zoho token refused: ${body.error ?? res.status}`);
  token = { value: body.access_token, until: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return token.value;
}

type ZohoResult = { ok: true; id: string; note?: string } | { ok: false; detail: string; duplicateField?: string };

async function call(method: "POST" | "PUT", path: string, record: Record<string, unknown>, trigger: string[]): Promise<ZohoResult> {
  try {
    const res = await fetch(`${apiUrl()}/crm/v8/${path}`, {
      method,
      headers: { Authorization: `Zoho-oauthtoken ${await accessToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: [record], trigger }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => ({}))) as { data?: { status?: string; code?: string; message?: string; details?: { id?: string; api_name?: string } }[] };
    const row = body.data?.[0];
    if (row?.status === "success" && row.details?.id) return { ok: true, id: row.details.id };
    return {
      ok: false,
      detail: `${res.status} ${row?.code ?? ""} ${row?.message ?? ""} ${row?.details?.api_name ?? ""}`.trim(),
      duplicateField: row?.code === "DUPLICATE_DATA" ? row.details?.api_name : undefined,
    };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

const duplicateLabels: Record<string, string> = { Phone: "phone", Email: "email", Mobile: "mobile" };

// Every website lead carries this tag (created in Zoho on 15 Oct 2026), so the
// team can keep them in their own list view.
export const WEBSITE_TAG = "New FF21 Website 2026";

// A new lead. Runs the same workflow rules a web-form lead would. If Zoho says
// a unique field (phone or email) matches an existing lead, that lead is left
// alone: the new lead is created without that field (a phone moves to Mobile),
// and Description says which existing value it matched, so the team can link
// them.
export async function createZohoLead(input: ZohoLeadInput): Promise<ZohoResult> {
  const record = toZoho(input);
  const notes: string[] = [];
  let tag = true;
  for (let attempt = 0; attempt < 4; attempt++) {
    const payload: Record<string, unknown> = notes.length ? { ...record, Description: [`Returning? ${notes.join("; ")}.`, record.Description].filter(Boolean).join(" | ") } : { ...record };
    if (tag) payload.Tag = [{ name: WEBSITE_TAG }];
    const result = await call("POST", "Leads", payload, ["workflow"]);
    if (result.ok) return notes.length ? { ...result, note: `Returning? ${notes.join("; ")}.` } : result;
    const field = result.duplicateField;
    if (field && record[field] && duplicateLabels[field]) {
      notes.push(`Same ${duplicateLabels[field]} as an existing lead: ${record[field]}`);
      // Zoho allows one lead per Phone (and Email); Mobile has no such rule,
      // so the number stays on the lead where the team can call it.
      if (field === "Phone") record.Mobile = record.Phone;
      delete record[field];
      continue;
    }
    // The tag is a nice-to-have: if Zoho refuses it, save the lead without it.
    if (tag && /tag|scope|permission/i.test(result.detail)) {
      console.error("[lead:zoho] tag refused, saving without it", result.detail);
      tag = false;
      continue;
    }
    return result;
  }
  return { ok: false, detail: "could not create the lead" };
}

// More answers for a lead the site created (from readRef only). No rules
// re-run, so the sales team's automations fire once, on creation. Phone and
// email were set when the lead was made (or left out because another lead has
// them, which sending them again would make Zoho refuse), so updates never
// send them; the note about a returning visitor stays first in Description.
export function updateZohoLead(ref: ZohoRef, input: ZohoLeadInput) {
  const record = toZoho(input);
  delete record.Phone;
  delete record.Email;
  if (ref.note) record.Description = [ref.note, record.Description].filter(Boolean).join(" | ");
  return call("PUT", `Leads/${ref.id}`, record, []);
}
