import { cameFromOf, cleanAttribution, genders, isLeadId, leadSourceFor, sources, stays, summarize, utmOf, validateContact, visitOf, type Attribution, type Stay, type VisitType, type VisitWindow } from "@/lib/lead";
import { ownerForLead } from "@/lib/lead-owner";
import { saveLead, saveOpen, type LeadRow } from "@/lib/lead-store";
import { scoreFields, scoreLead } from "@/lib/lead-score";
import { properties } from "@/lib/properties";
import { createZohoLead, makeRef, readRef, updateZohoLead, zohoApiEnabled } from "@/lib/zoho-api";

const MIN_FILL_MS = 2500;
const STEPS = ["you", "where", "movein", "stay", "budget", "room", "who", "home", "visit", "heard"];

const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : undefined) || undefined;

// Saves Find my home as the visitor goes: the contact step first (checked
// like the final form), then each answer as they move on.
export async function POST(request: Request) {
  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  if (!isLeadId(b.id)) return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  if (b.step === "open") {
    await saveOpen(b.id);
    return Response.json({ ok: true });
  }
  const step = STEPS.includes(String(b.step)) ? String(b.step) : undefined;

  const row: LeadRow = { id: b.id, last_step: step, page: str(b.page, 300) };
  // An email that looked wrong: a note in Zoho instead of the field.
  let unverified: { phone?: string; email?: string } | undefined;

  if (step === "you") {
    const checked = validateContact(b);
    if (!checked.ok) return Response.json({ ok: false, errors: checked.errors }, { status: 422 });
    // Bots fill the hidden field or answer faster than a person can type: say
    // yes and save nothing.
    const elapsedMs = typeof b.elapsedMs === "number" ? b.elapsedMs : 0;
    if (b.website || elapsedMs < MIN_FILL_MS) return Response.json({ ok: true });
    const c = checked.contact;
    unverified = c.unverified;
    Object.assign(row, {
      first_name: c.firstName,
      last_name: c.lastName,
      phone: c.phone || undefined,
      email: c.email || undefined,
      source: c.source,
      referral_code: c.referralCode,
      attribution: cleanAttribution(b.attribution),
    });
  }

  const places = Array.isArray(b.places) ? b.places.map((x) => str(x, 60)).filter((x): x is string => Boolean(x)).slice(0, 8) : undefined;
  const source = str(b.source);
  const stay = str(b.stay);
  const gender = str(b.gender);
  const property = str(b.property);
  const visit = visitOf(b);
  const answers = {
    places,
    move_in: str(b.moveIn, 60),
    stay: stay && (stays as readonly string[]).includes(stay) ? stay : undefined,
    budget: str(b.budget, 60),
    room: str(b.room, 60),
    gender: gender && (genders as readonly string[]).includes(gender) ? gender : undefined,
    property: property && properties.some((p) => p.slug === property) ? property : undefined,
    source: source && (sources as readonly string[]).includes(source) ? source : undefined,
    referral_code: str(b.referralCode, 40),
    visit_day: visit.visitDay,
    visit_window: visit.visitWindow,
    visit_type: visit.visitDay ? visit.visitType : undefined,
  };
  for (const [k, v] of Object.entries(answers)) if (v !== undefined) Object.assign(row, { [k]: v });

  // Every save carries all answers so far, so the score is always current.
  // "heard" is the last step: saving it means the visitor is sending the form.
  const score = scoreLead({ moveIn: row.move_in, stay: row.stay, budget: row.budget, property: row.property, source: row.source, referralCode: row.referral_code, finished: step === "heard" });
  row.score = score.score;
  row.qualification = score.qualification;

  // Zoho: create the lead at the contact step, then update only that lead.
  let zohoRef: string | undefined;
  if (zohoApiEnabled()) {
    // The lead goes to the associate for the home it's about (lib/lead-owner.ts):
    // set when it's made (from the page the visit landed on), when they say
    // where they're looking, and once a home is chosen. Not on the steps in
    // between, so a reassignment made in Zoho meanwhile stays put.
    const touch = row.attribution as Attribution | undefined;
    // Every step sends the visit's attribution (only the contact step stores
    // it), so Lead Source follows the ad click on every update too.
    const visit = cleanAttribution(b.attribution);
    const cameFrom = cameFromOf(visit);
    const routes = step === "you" || step === "where" || Boolean(row.property);
    const owner = routes ? ownerForLead({ property: row.property, places: row.places, page: touch?.last?.landing ?? touch?.first?.landing }, b.id) : undefined;
    const zohoAnswers = {
      ownerId: owner?.id,
      ...scoreFields(score),
      property: row.property,
      gender: row.gender,
      stay: row.stay,
      room: row.room,
      referralCode: row.referral_code,
      cameFrom,
      visitDay: row.visit_day,
      visitType: row.visit_type,
      summary: summarize({
        moveIn: row.move_in,
        stay: row.stay as Stay | undefined,
        budget: row.budget,
        room: row.room,
        places: row.places,
        visitDay: row.visit_day,
        visitWindow: row.visit_window as VisitWindow | undefined,
        visitType: row.visit_type as VisitType | undefined,
      }),
    };
    if (step === "you") {
      const created = await createZohoLead({
        ...zohoAnswers,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        email: row.email,
        unverified,
        // A tracked ad click, else their answer (asked at the end), else "Website".
        source: leadSourceFor(visit, row.source, "Website"),
        page: row.page,
        utm: utmOf(row.attribution as Attribution | undefined),
      });
      if (created.ok) zohoRef = makeRef(created.id, created.note);
      else console.error("[lead:zoho] create failed", created.detail);
      row.zoho_status = created.ok ? "created" : "failed";
      row.zoho_detail = created.ok ? created.id : created.detail;
    } else {
      const ref = readRef(b.zohoRef);
      if (ref) {
        // No fallback here: an update without attribution (an old page, or
        // storage cleared mid-form) leaves the Lead Source set at creation
        // alone, and their answer goes in the notes.
        const source = visit ? leadSourceFor(visit, row.source) : undefined;
        const updated = await updateZohoLead(ref, { ...zohoAnswers, source, heardVia: row.source && row.source !== source ? row.source : undefined });
        if (!updated.ok) console.error("[lead:zoho] update failed", updated.detail);
      }
    }
  }

  const saved = await saveLead(row);
  // "lead": a real person's contact details were kept (saved here or sent to
  // Zoho), so the ad platforms may count a lead. Never set on the bot path.
  const lead = step === "you" && (saved.ok || Boolean(zohoRef));
  return Response.json({ ok: saved.ok, zohoRef, lead });
}
