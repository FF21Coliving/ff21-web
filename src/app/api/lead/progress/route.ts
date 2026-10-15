import { genders, isLeadId, sources, stays, summarize, utmOf, validateContact, type Attribution, type Stay } from "@/lib/lead";
import { saveLead, type LeadRow } from "@/lib/lead-store";
import { properties } from "@/lib/properties";
import { createZohoLead, makeRef, readRef, updateZohoLead, zohoApiEnabled } from "@/lib/zoho-api";

const MIN_FILL_MS = 2500;
const STEPS = ["you", "where", "movein", "stay", "budget", "room", "who", "home", "heard"];

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
  const step = STEPS.includes(String(b.step)) ? String(b.step) : undefined;

  const row: LeadRow = { id: b.id, last_step: step, page: str(b.page, 300) };

  if (step === "you") {
    const checked = validateContact(b);
    if (!checked.ok) return Response.json({ ok: false, errors: checked.errors }, { status: 422 });
    // Bots fill the hidden field or answer faster than a person can type: say
    // yes and save nothing.
    const elapsedMs = typeof b.elapsedMs === "number" ? b.elapsedMs : 0;
    if (b.website || elapsedMs < MIN_FILL_MS) return Response.json({ ok: true });
    const c = checked.contact;
    Object.assign(row, {
      first_name: c.firstName,
      last_name: c.lastName,
      phone: c.phone,
      email: c.email,
      source: c.source,
      referral_code: c.referralCode,
      attribution: b.attribution && typeof b.attribution === "object" ? b.attribution : undefined,
    });
  }

  const places = Array.isArray(b.places) ? b.places.map((x) => str(x, 60)).filter((x): x is string => Boolean(x)).slice(0, 8) : undefined;
  const source = str(b.source);
  const stay = str(b.stay);
  const gender = str(b.gender);
  const property = str(b.property);
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
  };
  for (const [k, v] of Object.entries(answers)) if (v !== undefined) Object.assign(row, { [k]: v });

  // Zoho: create the lead at the contact step, then update only that lead.
  let zohoRef: string | undefined;
  if (zohoApiEnabled()) {
    const zohoAnswers = {
      property: row.property,
      gender: row.gender,
      stay: row.stay,
      room: row.room,
      referralCode: row.referral_code,
      summary: summarize({ moveIn: row.move_in, stay: row.stay as Stay | undefined, budget: row.budget, room: row.room, places: row.places }),
    };
    if (step === "you") {
      const created = await createZohoLead({
        ...zohoAnswers,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        email: row.email,
        // Asked at the end; until then, what the visit tells us, or "Website".
        source: row.source ?? "Website",
        page: row.page,
        utm: utmOf(row.attribution as Attribution | undefined),
      });
      if (created.ok) zohoRef = makeRef(created.id);
      else console.error("[lead:zoho] create failed", created.detail);
      row.zoho_status = created.ok ? "created" : "failed";
      row.zoho_detail = created.ok ? created.id : created.detail;
    } else {
      const id = readRef(b.zohoRef);
      if (id) {
        const updated = await updateZohoLead(id, { ...zohoAnswers, source: row.source });
        if (!updated.ok) console.error("[lead:zoho] update failed", updated.detail);
      }
    }
  }

  const saved = await saveLead(row);
  return Response.json({ ok: saved.ok, zohoRef });
}
