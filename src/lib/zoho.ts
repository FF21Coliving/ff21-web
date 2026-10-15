import "server-only";
import { leadSummary, utmOf, type Lead } from "./lead";
import { getProperty } from "./properties";
import { createZohoLead, readRef, updateZohoLead, zohoApiEnabled, type ZohoLeadInput } from "./zoho-api";

// Leads go to Zoho CRM through the same Web-to-Lead form ff21.co.in uses.
// LEADS_MODE=test (the default) logs the payload and sends nothing.
//
// The current form has Google reCAPTCHA switched on, so Zoho will reject
// posts that don't carry a captcha token. Before going live, create a web form
// for the new site without reCAPTCHA (this site has its own spam checks) and
// put its xnQsjsdp / xmIwtLD tokens in the environment.

export type DeliveryResult = { ok: boolean; mode: "test" | "zoho" | "zoho-api"; detail?: string; ref?: string };

export function zohoFields(lead: Lead): Record<string, string> {
  const property = getProperty(lead.property);
  const last = lead.attribution.last ?? lead.attribution.first;
  // Move-in, budget, room and workplace go in one text field once the new
  // Zoho form includes it (set ZOHO_DESCRIPTION_FIELD, e.g. "Description").
  const descriptionField = process.env.ZOHO_DESCRIPTION_FIELD;
  return {
    ...(descriptionField ? { [descriptionField]: leadSummary(lead) } : {}),
    "First Name": lead.firstName,
    "Last Name": lead.lastName,
    Phone: lead.phone,
    Email: lead.email,
    LEADCF13: lead.gender,
    "Lead Source": lead.source,
    LEADCF9: property?.zohoValue ?? "",
    LEADCF183: lead.stay && lead.stay !== "Less than 3 months" ? lead.stay : "-None-",
    LEADCF202: lead.referralCode ?? "",
    LEADCF57: "0",
    zc_gad: last?.gclid ?? "",
  };
}

export const zohoInput = (lead: Lead): ZohoLeadInput => ({
  firstName: lead.firstName,
  lastName: lead.lastName,
  phone: lead.phone,
  email: lead.email,
  source: lead.source,
  referralCode: lead.referralCode,
  property: lead.property,
  gender: lead.gender,
  stay: lead.stay,
  room: lead.room,
  summary: leadSummary(lead),
  page: lead.page,
  utm: utmOf(lead.attribution),
});

// zohoRef: the signed reference the site handed out when it created this
// lead at the contact step. With it, the lead is updated; without it (or if
// it doesn't check out), a new lead is created. Never anything else.
export async function deliverToZoho(lead: Lead, zohoRef?: unknown): Promise<DeliveryResult> {
  if (zohoApiEnabled()) {
    const id = readRef(zohoRef);
    const result = id ? await updateZohoLead(id, zohoInput(lead)) : await createZohoLead(zohoInput(lead));
    return result.ok ? { ok: true, mode: "zoho-api" } : { ok: false, mode: "zoho-api", detail: result.detail };
  }
  const fields = zohoFields(lead);
  if (process.env.LEADS_MODE !== "zoho") {
    console.info("[lead:test] would send to Zoho", JSON.stringify({ ...fields, _summary: leadSummary(lead) }));
    return { ok: true, mode: "test" };
  }

  const xnQsjsdp = process.env.ZOHO_XNQSJSDP;
  const xmIwtLD = process.env.ZOHO_XMIWTLD;
  if (!xnQsjsdp || !xmIwtLD) return { ok: false, mode: "zoho", detail: "Zoho form tokens are not set" };

  const returnURL = process.env.ZOHO_RETURN_URL ?? "https://www.ff21.in/find-my-home";
  const body = new URLSearchParams({
    xnQsjsdp,
    xmIwtLD,
    actionType: process.env.ZOHO_ACTION_TYPE ?? "TGVhZHM=",
    returnURL,
    ...fields,
  });

  try {
    const res = await fetch(process.env.ZOHO_WEBTOLEAD_URL ?? "https://crm.zoho.in/crm/WebToLeadForm", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const location = res.headers.get("location") ?? "";
    // Zoho answers a good submission by redirecting to returnURL.
    if (res.status >= 300 && res.status < 400 && location.startsWith(returnURL)) return { ok: true, mode: "zoho" };
    const text = (await res.text().catch(() => "")).slice(0, 300);
    return { ok: false, mode: "zoho", detail: `Zoho answered ${res.status} ${location} ${text}` };
  } catch (err) {
    return { ok: false, mode: "zoho", detail: err instanceof Error ? err.message : String(err) };
  }
}

// Optional second copy of every lead (for example a Google Sheet webhook), so a
// Zoho outage never loses one.
export async function backupLead(lead: Lead, delivery: DeliveryResult) {
  const url = process.env.LEAD_BACKUP_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receivedAt: new Date().toISOString(), delivery, lead }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch (err) {
    console.error("[lead:backup] failed", err);
  }
}
