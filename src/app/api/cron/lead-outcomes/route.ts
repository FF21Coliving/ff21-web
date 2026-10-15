import { syncLeadOutcomes } from "@/lib/lead-outcomes";
import { zohoApiEnabled } from "@/lib/zoho-api";

// Runs once a day (vercel.json). Vercel sends CRON_SECRET as a bearer token;
// anything else is turned away, and nothing runs without the secret set.
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  if (!zohoApiEnabled()) return Response.json({ ok: false, error: "Zoho API is not set up" }, { status: 503 });
  try {
    const result = await syncLeadOutcomes();
    console.info("[lead:outcomes]", JSON.stringify(result));
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[lead:outcomes] failed", detail);
    return Response.json({ ok: false, error: detail }, { status: 500 });
  }
}
