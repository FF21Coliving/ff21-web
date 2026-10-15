import "server-only";

// Every Find my home answer is saved to Supabase the moment the visitor moves
// on, so the team has the lead even if they drop off halfway. Rows are written
// through one database function (ff21_save_lead) that merges each save into the
// row for that visit; the leads table itself has no public access.
//
// SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are server-side only (no
// NEXT_PUBLIC_ prefix): the browser talks to /api/lead, never to Supabase.

export type LeadRow = {
  id: string;
  status?: "started" | "submitted";
  last_step?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  source?: string;
  referral_code?: string;
  places?: string[];
  move_in?: string;
  stay?: string;
  budget?: string;
  room?: string;
  gender?: string;
  property?: string;
  attribution?: unknown;
  page?: string;
  zoho_status?: string;
  zoho_detail?: string;
  score?: number;
  qualification?: string;
  visit_day?: string;
  visit_window?: string;
  visit_type?: string;
};

// Someone opened Find my home (no personal details): the top of the drop-off
// chart, so it shows how many leave before giving their contact details.
export async function saveOpen(id: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/rpc/ff21_form_opened`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ p_id: id }),
    signal: AbortSignal.timeout(4_000),
  }).catch(() => undefined);
}

export async function saveLead(row: LeadRow): Promise<{ ok: boolean; skipped?: boolean }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.info("[lead:store] Supabase not configured; would save", JSON.stringify({ id: row.id, step: row.last_step, status: row.status }));
    return { ok: true, skipped: true };
  }
  // Drop empty values so a later save never blanks an earlier answer.
  const p = Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)));
  try {
    const res = await fetch(`${url}/rest/v1/rpc/ff21_save_lead`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ p }),
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) {
      console.error("[lead:store] save failed", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[lead:store] save failed", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}
