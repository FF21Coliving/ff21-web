// Receives the site's own visit log (src/lib/site-log.ts) and saves it to
// Supabase through ff21_track, for the FF21 dashboard's Website tab. Adds the
// device (from the browser's user agent), the city Vercel reads from the
// connection, and where the visit came from. Bots, previews and local
// development are dropped. Always answers 204: analytics never shows an error.

import { channelOf } from "@/lib/channel";

type In = {
  kind?: unknown;
  path?: unknown;
  name?: unknown;
  target?: unknown;
  section?: unknown;
  ref?: unknown;
  source?: unknown;
  medium?: unknown;
  campaign?: unknown;
  click?: unknown;
  at?: unknown;
  first?: unknown;
};

const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|python|curl|wget|httpclient|go-http|node-fetch|axios|vercel|monitor/i;
const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

function deviceOf(ua: string): string {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(request: Request) {
  const done = new Response(null, { status: 204 });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || process.env.VERCEL_ENV !== "production") return done;
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOTS.test(ua)) return done;

  let body: { visitor?: unknown; session?: unknown; events?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done;
  }
  if (!Array.isArray(body.events) || body.events.length === 0) return done;

  const events = (body.events as In[]).slice(0, 40).map((e) => {
    const out = {
      kind: str(e.kind, 10),
      path: str(e.path, 200),
      name: str(e.name, 80),
      target: str(e.target, 200),
      section: str(e.section, 60),
      at: str(e.at, 40),
      ref: str(e.ref, 100),
      source: str(e.source, 100),
      medium: str(e.medium, 100),
      campaign: str(e.campaign, 150),
      channel: undefined as string | undefined,
    };
    if (out.kind === "view" && e.first === true) {
      out.channel = channelOf({ ref: out.ref, source: out.source, medium: out.medium, click: str(e.click, 10) });
    }
    return out;
  });
  const city = request.headers.get("x-vercel-ip-city");

  await fetch(`${url}/rest/v1/rpc/ff21_track`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      p: {
        visitor: str(body.visitor, 40),
        session: str(body.session, 40),
        device: deviceOf(ua),
        city: city ? decodeURIComponent(city).slice(0, 60) : undefined,
        region: request.headers.get("x-vercel-ip-country-region") ?? undefined,
        country: request.headers.get("x-vercel-ip-country") ?? undefined,
        events,
      },
    }),
    signal: AbortSignal.timeout(4_000),
  }).catch(() => undefined);
  return done;
}
