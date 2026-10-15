import "server-only";
import { accessToken, apiUrl } from "./zoho-api";

// What happened to each website lead after the form: the daily check behind
// /api/cron/lead-outcomes. Zoho is only READ here, never changed:
//   - the website's own lead, for its Lead Status, visit tick and drop reason;
//   - Contacts with the same phone or email, and their Deals (Booking,
//     Checked-In, Checked-Out, Deferred / Canceled). The team creates deals
//     against contacts rather than converting leads, so phone and email are
//     the only link back to the lead.
// The result goes into the outcome columns of ff21_leads in Supabase, which
// the ff21_funnel view counts up.

const LOOKBACK_DAYS = 120;
const PER_RUN = 200;

export type Stage =
  | "new"
  | "contacted"
  | "visit_scheduled"
  | "visited"
  | "application"
  | "booked"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "lost";

type LeadRow = { id: string; created_at: string; phone: string | null; email: string | null; zoho_detail: string | null };
type ZohoLead = { id: string; Lead_Status: string | null; Site_Visit_Completed: boolean | null; Lead_Drop_Reason: string | null };
type Contact = { id: string; Phone: string | null; Mobile: string | null; Email: string | null };
type Deal = {
  id: string;
  Stage: string | null;
  Created_Time: string;
  Booking_Received_Date: string | null;
  Check_in_Date: string | null;
  Check_out_Date: string | null;
  Contact_Name: { id: string } | null;
  Current_Room: { name?: string } | null;
};

// --- Zoho, read only ------------------------------------------------------------

async function coql<T>(query: string): Promise<T[]> {
  const res = await fetch(`${apiUrl()}/crm/v8/coql`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ select_query: query }),
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 204) return [];
  const body = (await res.json().catch(() => ({}))) as { data?: T[]; code?: string; message?: string };
  if (!res.ok || !body.data) throw new Error(`Zoho COQL ${res.status} ${body.code ?? ""} ${body.message ?? ""}`.trim());
  return body.data;
}

// COQL wants conditions joined two at a time: ((a or b) or c).
const anyOf = (conds: string[]) => conds.reduce((acc, c) => `(${acc} or ${c})`);

const chunk = <T>(xs: T[], n: number) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

const last10 = (phone: string | null | undefined) => {
  const d = (phone ?? "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : undefined;
};
const safeEmail = (email: string | null | undefined) => {
  const e = (email ?? "").trim().toLowerCase();
  return /^[^\s'"\\()]+@[^\s'"\\()]+$/.test(e) ? e : undefined;
};

async function readZohoLeads(ids: string[]) {
  const out = new Map<string, ZohoLead>();
  for (const part of chunk(ids, 50)) {
    const rows = await coql<ZohoLead>(`select id, Lead_Status, Site_Visit_Completed, Lead_Drop_Reason from Leads where id in (${part.join(", ")}) limit 200`);
    for (const r of rows) out.set(r.id, r);
  }
  return out;
}

async function readContacts(leads: LeadRow[]) {
  const contacts: Contact[] = [];
  // Up to three conditions a lead; eight leads keeps a query under COQL's 25.
  for (const part of chunk(leads, 8)) {
    const conds = part.flatMap((l) => {
      const p = last10(l.phone);
      const e = safeEmail(l.email);
      return [...(p ? [`Phone like '%${p}'`, `Mobile like '%${p}'`] : []), ...(e ? [`Email = '${e}'`] : [])];
    });
    if (conds.length) contacts.push(...(await coql<Contact>(`select id, Phone, Mobile, Email from Contacts where ${anyOf(conds)} limit 200`)));
  }
  return contacts;
}

async function readDeals(contactIds: string[]) {
  const deals: Deal[] = [];
  for (const part of chunk([...new Set(contactIds)], 50)) {
    deals.push(
      ...(await coql<Deal>(
        `select id, Stage, Created_Time, Booking_Received_Date, Check_in_Date, Check_out_Date, Contact_Name, Current_Room from Deals where Contact_Name in (${part.join(", ")}) limit 200`,
      )),
    );
  }
  return deals;
}

// --- deciding the stage ---------------------------------------------------------

const dealRank: Record<string, number> = { "Checked-Out": 4, "Checked-In": 3, Booking: 2, "Deferred / Canceled": 1 };
const dealStage: Record<string, Stage> = { "Checked-Out": "checked_out", "Checked-In": "checked_in", Booking: "booked", "Deferred / Canceled": "cancelled" };

// Lead Status has grown over the years; group its values by what they mean.
export function stageFromLead(status: string | null | undefined, visited: boolean | null | undefined): Stage {
  const s = (status ?? "").toLowerCase();
  if (/checkedin|checked in|moved-in|resident$|agreement signed/.test(s) && !/ex.?resident/.test(s)) return "checked_in";
  if (/^booked|reservation made|deposit received/.test(s)) return "booked";
  if (/not interested|found a flat|found another|lost|junk|not qualified|do not call|over 30|under 18|no vacancy|not in desired|reservation canc/.test(s)) return "lost";
  if (/application|ris received|agreement sent|pre-qualified|convert to deal/.test(s)) return "application";
  if (visited || /visit completed/.test(s)) return "visited";
  if (/visit scheduled|meeting scheduled|rescheduled/.test(s)) return "visit_scheduled";
  if (s && s !== "new") return "contacted";
  return "new";
}

// --- the run --------------------------------------------------------------------

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are needed");
  return { url, headers: { apikey: key, "Content-Type": "application/json" } };
}

export async function syncLeadOutcomes() {
  const db = supabase();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();
  // Oldest-checked first, so every lead gets its turn when there are many.
  const q = new URLSearchParams({
    select: "id,created_at,phone,email,zoho_detail",
    created_at: `gte.${since}`,
    or: "(stage.is.null,stage.neq.checked_out)",
    order: "outcome_checked_at.asc.nullsfirst,created_at.asc",
    limit: String(PER_RUN),
  });
  const res = await fetch(`${db.url}/rest/v1/ff21_leads?${q}`, { headers: db.headers, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Supabase read ${res.status} ${(await res.text()).slice(0, 200)}`);
  const leads = (await res.json()) as LeadRow[];
  if (!leads.length) return { checked: 0, stages: {} };

  const zohoIds = leads.map((l) => l.zoho_detail).filter((id): id is string => Boolean(id && /^\d{6,25}$/.test(id)));
  const zohoLeads = await readZohoLeads(zohoIds);
  const contacts = await readContacts(leads);
  const deals = await readDeals(contacts.map((c) => c.id));

  const now = new Date().toISOString();
  const stages: Record<string, number> = {};
  const updates = leads.map((l) => {
    const p = last10(l.phone);
    const e = safeEmail(l.email);
    const mine = contacts.filter((c) => (p && (last10(c.Phone) === p || last10(c.Mobile) === p)) || (e && safeEmail(c.Email) === e));
    const matchedBy = mine.length ? (p && mine.some((c) => last10(c.Phone) === p || last10(c.Mobile) === p) ? "phone" : "email") : null;
    // Only deals that began after the enquiry (a day's grace): an old stay
    // by the same person isn't this lead's booking.
    const after = Date.parse(l.created_at) - 86_400_000;
    const ids = new Set(mine.map((c) => c.id));
    const deal = deals
      .filter((d) => d.Contact_Name && ids.has(d.Contact_Name.id) && Date.parse(d.Created_Time) >= after)
      .sort((a, b) => (dealRank[b.Stage ?? ""] ?? 0) - (dealRank[a.Stage ?? ""] ?? 0) || Date.parse(b.Created_Time) - Date.parse(a.Created_Time))[0];
    const z = l.zoho_detail ? zohoLeads.get(l.zoho_detail) : undefined;
    const stage = deal?.Stage && dealStage[deal.Stage] ? dealStage[deal.Stage] : stageFromLead(z?.Lead_Status, z?.Site_Visit_Completed);
    stages[stage] = (stages[stage] ?? 0) + 1;
    return {
      id: l.id,
      stage,
      zoho_lead_status: z?.Lead_Status ?? null,
      visit_done: z?.Site_Visit_Completed ?? null,
      lost_reason: z?.Lead_Drop_Reason ?? null,
      deal_id: deal?.id ?? null,
      deal_stage: deal?.Stage ?? null,
      deal_room: deal?.Current_Room?.name ?? null,
      booked_on: deal ? (deal.Booking_Received_Date ?? deal.Created_Time.slice(0, 10)) : null,
      checked_in_on: deal?.Check_in_Date ?? null,
      checked_out_on: deal?.Check_out_Date ?? null,
      matched_by: deal ? matchedBy : null,
      outcome_checked_at: now,
    };
  });

  const save = await fetch(`${db.url}/rest/v1/ff21_leads?on_conflict=id`, {
    method: "POST",
    headers: { ...db.headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(updates),
    signal: AbortSignal.timeout(15_000),
  });
  if (!save.ok) throw new Error(`Supabase save ${save.status} ${(await save.text()).slice(0, 200)}`);
  return { checked: leads.length, stages };
}
