import { validateLead } from "@/lib/lead";
import { saveLead } from "@/lib/lead-store";
import { scoreLead } from "@/lib/lead-score";
import { backupLead, deliverToZoho } from "@/lib/zoho";
import { readRef } from "@/lib/zoho-api";

const MIN_FILL_MS = 2500;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Bots fill the hidden field or submit faster than a person can type.
  // elapsedMs is measured in the browser, so clock differences don't matter.
  const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : 0;
  if (body.website || elapsedMs < MIN_FILL_MS) {
    return Response.json({ ok: true });
  }

  const result = validateLead(body);
  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  const lead = result.lead;
  const delivery = await deliverToZoho(lead, body.zohoRef);
  // A lead made at the contact step is already in Zoho; if only this last
  // update fails, the visitor has still reached FF21 and sees no error.
  const inZoho = delivery.ok || (delivery.mode === "zoho-api" && Boolean(readRef(body.zohoRef)));
  await backupLead(lead, delivery);
  if (lead.id) {
    const score = scoreLead({ ...lead, finished: true });
    await saveLead({
      score: score.score,
      qualification: score.qualification,
      id: lead.id,
      status: inZoho ? "submitted" : "started",
      last_step: "submitted",
      first_name: lead.firstName,
      last_name: lead.lastName,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      referral_code: lead.referralCode,
      places: lead.places,
      move_in: lead.moveIn,
      stay: lead.stay,
      budget: lead.budget,
      room: lead.room,
      gender: lead.gender,
      property: lead.property,
      visit_day: lead.visitDay,
      visit_window: lead.visitWindow,
      visit_type: lead.visitType,
      attribution: lead.attribution,
      page: lead.page,
      zoho_status: delivery.ok ? delivery.mode : inZoho ? "created" : "failed",
      zoho_detail: delivery.detail,
    });
  }

  if (!delivery.ok) console.error(inZoho ? "[lead] last Zoho update failed (the lead is in Zoho)" : "[lead] Zoho delivery failed", delivery.detail);
  if (!inZoho) {
    return Response.json(
      { ok: false, error: "We couldn't send your details just now. Please try again or message us on WhatsApp." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, mode: delivery.mode });
}
