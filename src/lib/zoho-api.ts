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
// The API token needs only ZohoCRM.modules.leads.CREATE and .UPDATE.

const accountsUrl = () => process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.in";
const apiUrl = () => process.env.ZOHO_API_URL ?? "https://www.zohoapis.in";

export const zohoApiEnabled = () =>
  process.env.LEADS_MODE === "zoho-api" &&
  Boolean(process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_SECRET && process.env.ZOHO_REFRESH_TOKEN && process.env.ZOHO_REF_SECRET);

// --- the signed reference -------------------------------------------------

const sign = (id: string) => createHmac("sha256", process.env.ZOHO_REF_SECRET ?? "").update(`ff21-lead:${id}`).digest("base64url");

export const makeRef = (id: string) => `${id}.${sign(id)}`;

// The Zoho record id inside a reference, only if the site signed it.
export function readRef(ref: unknown): string | undefined {
  if (typeof ref !== "string" || !process.env.ZOHO_REF_SECRET) return undefined;
  const [id, sig] = ref.split(".");
  if (!id || !sig || !/^\d{6,25}$/.test(id)) return undefined;
  const want = Buffer.from(sign(id));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got) ? id : undefined;
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
  summary?: string;
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
    Description: i.summary,
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

async function accessToken() {
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

type ZohoResult = { ok: true; id: string } | { ok: false; detail: string };

async function call(method: "POST" | "PUT", path: string, record: Record<string, string>, trigger: string[]): Promise<ZohoResult> {
  try {
    const res = await fetch(`${apiUrl()}/crm/v8/${path}`, {
      method,
      headers: { Authorization: `Zoho-oauthtoken ${await accessToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: [record], trigger }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => ({}))) as { data?: { status?: string; code?: string; message?: string; details?: { id?: string } }[] };
    const row = body.data?.[0];
    if (row?.status === "success" && row.details?.id) return { ok: true, id: row.details.id };
    return { ok: false, detail: `${res.status} ${row?.code ?? ""} ${row?.message ?? ""}`.trim() };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

// A new lead. Runs the same workflow rules a web-form lead would.
export const createZohoLead = (input: ZohoLeadInput) => call("POST", "Leads", toZoho(input), ["workflow"]);

// More answers for a lead the site created (id from readRef only). No rules
// re-run, so the sales team's automations fire once, on creation.
export const updateZohoLead = (id: string, input: ZohoLeadInput) => call("PUT", `Leads/${id}`, toZoho(input), []);
