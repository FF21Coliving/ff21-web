import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getProperty } from "./properties";

// Leads go straight into Zoho CRM through its API (LEADS_MODE=zoho-api):
// created when a visitor gives their contact details, then updated as they
// answer more. Rules, agreed with Madhvik:
//   - The site CREATES leads, and UPDATES leads it created itself. Every lead
//     it creates comes back to the browser as a signed reference; an update
//     without a valid signature is refused.
//   - One exception (30 Oct 2026): when a visitor's mobile number is already
//     on a lead, the site doesn't make another one. It updates the latest
//     lead with that number instead: the new answers, a "came back" note at
//     the top of Description (the rest of Description is kept), the
//     "Returned via website" tag, and Lead Status back to the start, so the
//     team sees it as new. The owner, name, phone, email, Lead Source and
//     campaign fields stay as they were.
//   - It writes only the fields listed in toZoho() below, plus Lead Status
//     and tags for returning visitors.
//   - Picklist values are sent exactly as they exist in Zoho (checked 16 Oct 2026).
// The API token needs ZohoCRM.modules.leads.CREATE, .UPDATE and .READ and
// ZohoCRM.coql.READ (finding a returning visitor); the daily outcome check
// (lead-outcomes.ts) also reads contacts and deals.

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
  // Where the visit came from ("Google Ads (campaign 23447782277)"), and the
  // visitor's own answer when Lead Source says something else.
  cameFrom?: string;
  heardVia?: string;
  // An email that looked wrong, sent as a note instead of a field.
  unverified?: { phone?: string; email?: string };
  // The Zoho user who should own the lead (lib/lead-owner.ts). Unset: the
  // owner stays as it is (on a new lead, Zoho's own assignment rule).
  ownerId?: string;
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
    // Zoho needs a last name; when only one name is given it goes there.
    First_Name: i.lastName ? i.firstName : undefined,
    Last_Name: i.lastName || i.firstName,
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
    Description:
      [i.scoreNote, i.summary, i.cameFrom && `Came from: ${i.cameFrom}`, i.heardVia && `Told us they heard via: ${i.heardVia}`].filter(Boolean).join(" | ") || undefined,
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

type ZohoResult = { ok: true; id: string; note?: string } | { ok: false; detail: string; duplicateFields?: string[]; invalidFields?: string[] };

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
    const duplicateFields = duplicatesIn(row);
    return {
      ok: false,
      detail: `${res.status} ${row?.code ?? ""} ${row?.message ?? ""} ${row?.details?.api_name ?? ""} ${errorsOf(row)}`.trim(),
      duplicateFields: duplicateFields.length ? duplicateFields : undefined,
      invalidFields: invalidIn(row).length ? invalidIn(row) : undefined,
    };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

// Every field Zoho calls a duplicate. One clash comes back as DUPLICATE_DATA;
// two at once (phone and email of the same returning visitor) come back as
// MULTIPLE_OR_MULTI_ERRORS with the clashes listed inside, which the site
// once missed and so lost a returning visitor's new enquiry (28 Oct 2026).
function duplicatesIn(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => duplicatesIn(n, found));
  else if (node && typeof node === "object") {
    const o = node as { code?: unknown; details?: { api_name?: unknown } };
    if (o.code === "DUPLICATE_DATA" && typeof o.details?.api_name === "string" && !found.includes(o.details.api_name)) found.push(o.details.api_name);
    Object.values(node).forEach((v) => duplicatesIn(v, found));
  }
  return found;
}

// Which fields Zoho refused and why, for the logs (field names and codes only).
function errorsOf(row: unknown): string {
  const out: string[] = [];
  const walk = (n: unknown) => {
    if (Array.isArray(n)) n.forEach(walk);
    else if (n && typeof n === "object") {
      const o = n as { code?: unknown; details?: { api_name?: unknown } };
      if (typeof o.code === "string" && typeof o.details?.api_name === "string") out.push(`${o.details.api_name}:${o.code}`);
      Object.values(n).forEach(walk);
    }
  };
  walk((row as { details?: unknown } | undefined)?.details);
  return out.length ? `[${[...new Set(out)].join(", ")}]` : "";
}

// Fields Zoho refused as invalid (INVALID_DATA), anywhere in its answer.
function invalidIn(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => invalidIn(n, found));
  else if (node && typeof node === "object") {
    const o = node as { code?: unknown; details?: { api_name?: unknown } };
    if (o.code === "INVALID_DATA" && typeof o.details?.api_name === "string" && !found.includes(o.details.api_name)) found.push(o.details.api_name);
    Object.values(node).forEach((v) => invalidIn(v, found));
  }
  return found;
}

const duplicateLabels: Record<string, string> = { Phone: "phone", Email: "email", Mobile: "mobile", WhatsApp: "WhatsApp number" };
// Never dropped: Zoho needs a last name, and Description carries the notes.
const keep = new Set(["Last_Name", "Description"]);
// A lead needs one way to reach the person: a refused phone (or mobile) or
// email is only dropped while another of them is still on the lead.
const reach = ["Phone", "Mobile", "WhatsApp", "Email"];
const canDrop = (record: Record<string, unknown>, field: string) =>
  !keep.has(field) && (!reach.includes(field) || reach.some((f) => f !== field && record[f]));

// Every website lead carries this tag (created in Zoho on 15 Oct 2026), so the
// team can keep them in their own list view.
export const WEBSITE_TAG = "New FF21 Website 2026";

// --- returning visitors ----------------------------------------------------

// A reference to a lead the visitor already had carries this note, with the
// time they came back, so every later update only rewrites that visit's note.
const RETURNING = "returning:";
export const RETURNED_TAG = "Returned via website";
// Where the team's new leads start (Lead Management Blueprint).
const NEW_LEAD_STATUS = "01. Site Visit To Be Scheduled";
const END = "[/website]";
const visitStart = (at: string) => {
  const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(at));
  return `[Came back on the website, ${when} IST]`;
};

async function request<T>(path: string, init?: RequestInit): Promise<T | undefined> {
  try {
    const res = await fetch(`${apiUrl()}/crm/v8/${path}`, {
      ...init,
      headers: { Authorization: `Zoho-oauthtoken ${await accessToken()}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 204) return undefined;
    return (await res.json().catch(() => undefined)) as T | undefined;
  } catch (err) {
    console.error("[lead:zoho] read failed", err instanceof Error ? err.message : err);
    return undefined;
  }
}

// The latest lead with this mobile number in Phone or Mobile, whatever its
// format ("+919…", "9…", "0…" or "90134 42509"). Undefined when there is none
// or Zoho can't be asked; the visitor then gets a new lead, never none.
export async function findLeadByPhone(phone: string): Promise<string | undefined> {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return undefined;
  for (const d of [digits, `${digits.slice(0, 5)} ${digits.slice(5)}`]) {
    const body = await request<{ data?: { id?: string }[] }>("coql", {
      method: "POST",
      body: JSON.stringify({ select_query: `select id, Created_Time from Leads where (Phone like '%${d}' or Mobile like '%${d}') order by Created_Time desc limit 1` }),
    });
    const id = body?.data?.[0]?.id;
    if (id) return id;
  }
  return undefined;
}

// Puts this visit's note at the top of the lead's Description and keeps the
// rest, replacing only an earlier copy of the same visit's note.
async function withVisitNote(id: string, at: string, text: string | undefined) {
  const body = await request<{ data?: { Description?: string | null }[] }>(`Leads/${id}?fields=Description`);
  const start = visitStart(at);
  let rest = body?.data?.[0]?.Description ?? "";
  const from = rest.indexOf(start);
  if (from >= 0) {
    const to = rest.indexOf(END, from);
    rest = (rest.slice(0, from) + (to >= 0 ? rest.slice(to + END.length) : "")).trim();
  }
  return [`${start} ${text ?? ""} ${END}`, rest].filter(Boolean).join("\n\n").slice(0, 32_000);
}

// The fields a returning visit may change: their new answers, never who they
// are, who owns them or where they first came from.
function returningFields(input: ZohoLeadInput) {
  const record: Record<string, unknown> = toZoho(input);
  for (const f of ["Phone", "Email", "First_Name", "Last_Name", "Lead_Source", "Campaign_Source1", "Campaign_Medium", "Campaign_Name", "Campaign_Term", "Campaign_Content", "GCLID"]) delete record[f];
  return record;
}

// The visitor came back: update their latest lead and show it to the team as
// new. Lead Status and the tag are nice-to-haves; if Zoho refuses either
// (the blueprint may lock the status), the answers and the note still land.
async function returnToLead(id: string, input: ZohoLeadInput, at: string): Promise<ZohoResult> {
  const record = returningFields(input);
  record.Description = await withVisitNote(id, at, record.Description as string | undefined);
  let result = await call("PUT", `Leads/${id}`, { ...record, Lead_Status: NEW_LEAD_STATUS }, ["workflow"]);
  if (!result.ok) {
    console.error("[lead:zoho] returning visitor: saving without the status reset after", result.detail);
    result = await call("PUT", `Leads/${id}`, record, ["workflow"]);
  }
  if (!result.ok) return result;
  await addTags(id, [WEBSITE_TAG, RETURNED_TAG]);
  return { ok: true, id, note: `${RETURNING}${at}` };
}

// Adds tags without touching the ones the lead already has (an update's Tag
// field could replace them). Best effort: the note says it all anyway.
async function addTags(id: string, names: string[]) {
  const body = await request<{ data?: { status?: string; message?: string }[] }>("Leads/actions/add_tags", {
    method: "POST",
    body: JSON.stringify({ tags: names.map((name) => ({ name })), ids: [id] }),
  });
  if (body?.data?.[0]?.status !== "success") console.error("[lead:zoho] returning visitor: tags not added", body?.data?.[0]?.message ?? "no answer");
}

// A new lead. Runs the same workflow rules a web-form lead would. If Zoho says
// a unique field (phone or email) matches an existing lead, that lead is left
// alone: the new lead is created without that field (a phone moves to Mobile
// and WhatsApp number),
// and Description says which existing value it matched, so the team can link
// them.
export async function createZohoLead(input: ZohoLeadInput): Promise<ZohoResult> {
  const existing = input.phone ? await findLeadByPhone(input.phone) : undefined;
  if (existing) {
    const back = await returnToLead(existing, input, new Date().toISOString());
    if (back.ok) return back;
    console.error("[lead:zoho] couldn't update the returning visitor's lead, making a new one", back.detail);
  }
  const record: Record<string, unknown> = withOwner(toZoho(input), input.ownerId);
  // An email that looked wrong starts the notes, so it travels in the
  // lead's signed ref and every later update keeps it (review, 28 Oct 2026).
  const notes: string[] = [
    ...(input.unverified?.phone ? [`Phone as typed, please check: ${input.unverified.phone}`] : []),
    ...(input.unverified?.email ? [`Email as typed, please check: ${input.unverified.email}`] : []),
  ];
  let tag = true;
  for (let attempt = 0; attempt < 8; attempt++) {
    const note = notes.length ? `${notes.join("; ")}.` : "";
    const payload: Record<string, unknown> = note ? { ...record, Description: [note, record.Description].filter(Boolean).join(" | ") } : { ...record };
    if (tag) payload.Tag = [{ name: WEBSITE_TAG }];
    const result = await call("POST", "Leads", payload, ["workflow"]);
    if (result.ok) return note ? { ...result, note } : result;
    const clashes = (result.duplicateFields ?? []).filter((f) => record[f] && duplicateLabels[f]);
    if (clashes.length) {
      for (const field of clashes) {
        const first = !notes.some((n) => n.startsWith("Returning?"));
        notes.push(`${first ? "Returning? " : ""}Same ${duplicateLabels[field]} as an existing lead: ${record[field]}`);
        // Zoho allows one lead per Phone (and Email); Mobile has no such rule,
        // so the number moves there. A Zoho custom function in FF21's new-lead
        // automations then clears Mobile when Phone is empty (seen 29 Oct
        // 2026), so it also goes in "WhatsApp number", which nothing clears:
        // a lead must never reach the team without a number to call.
        if (field === "Phone") {
          record.Mobile = record.Phone;
          record.WhatsApp = record.Phone;
        }
        delete record[field];
      }
      continue;
    }
    // A field Zoho calls invalid (an email typed as "name@gmail.com3") must
    // not cost the whole lead: save it without that field and keep what was
    // typed in Description, so the team still has the phone (28 Oct 2026).
    const refused = (result.invalidFields ?? []).filter((f) => record[f] !== undefined && f !== "Tag" && f !== "Owner");
    let dropped = false;
    for (const field of refused) {
      if (!canDrop(record, field)) continue;
      notes.push(`Zoho refused the ${field.replace(/_/g, " ").toLowerCase()} as typed: ${String(record[field])}`);
      delete record[field];
      dropped = true;
    }
    if (dropped) continue;
    // The tag is a nice-to-have: if Zoho refuses it, save the lead without it.
    if (tag && /\bTag\b|scope|permission/i.test(result.detail)) {
      console.error("[lead:zoho] tag refused, saving without it", result.detail);
      tag = false;
      continue;
    }
    // So is the owner. Whatever Zoho says (a refused owner may come back as
    // a permission error that never names it), try once more without one:
    // Zoho's own rule then assigns the lead instead of the lead being lost.
    if (record.Owner) {
      console.error("[lead:zoho] saving without the owner after", result.detail);
      delete record.Owner;
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
export async function updateZohoLead(ref: ZohoRef, input: ZohoLeadInput) {
  // A returning visitor's lead: their new answers and this visit's note only.
  if (ref.note?.startsWith(RETURNING)) {
    const record = returningFields(input);
    record.Description = await withVisitNote(ref.id, ref.note.slice(RETURNING.length), record.Description as string | undefined);
    return call("PUT", `Leads/${ref.id}`, record, []);
  }
  const record = toZoho(input);
  delete record.Phone;
  delete record.Email;
  if (ref.note) record.Description = [ref.note, record.Description].filter(Boolean).join(" | ");
  const result = await call("PUT", `Leads/${ref.id}`, withOwner(record, input.ownerId), []);
  if (result.ok || !input.ownerId) return result;
  console.error("[lead:zoho] updating without the owner after", result.detail);
  return call("PUT", `Leads/${ref.id}`, record, []);
}

// The lead's owner as Zoho wants it: a user lookup.
function withOwner(record: Record<string, string>, ownerId?: string): Record<string, unknown> {
  return ownerId ? { ...record, Owner: { id: ownerId } } : record;
}
