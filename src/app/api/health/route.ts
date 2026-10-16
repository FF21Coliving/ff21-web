import { timingSafeEqual } from "node:crypto";

// For the FF21 dashboard's Admin & Connections page. Answers with yes/no for
// each setting this site needs, the modes it runs in, its build, and whether
// its Zoho token still works (with the scopes Zoho reports for it). Never a
// value, key or lead. Locked by WEBSITE_HEALTH_KEY, sent as x-health-key;
// without that setting the route answers 404, as if it didn't exist.

const has = (name: string) => Boolean(process.env[name]?.trim());

function requiredSettings(leadsMode: string, tagMode: string): string[] {
  const names = ["SITE_ENV", "NEXT_PUBLIC_SITE_URL", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY", "CRON_SECRET"];
  if (leadsMode === "zoho-api") names.push("ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN");
  if (leadsMode === "zoho") names.push("ZOHO_XNQSJSDP", "ZOHO_XMIWTLD", "ZOHO_DESCRIPTION_FIELD");
  if (tagMode === "gtm") names.push("NEXT_PUBLIC_GTM_ID");
  if (tagMode === "direct") names.push("NEXT_PUBLIC_GA4_ID", "NEXT_PUBLIC_GADS_ID", "NEXT_PUBLIC_META_PIXEL_ID", "NEXT_PUBLIC_GADS_LEAD_LABEL");
  return names;
}

type ZohoState = { ok: boolean; scopes: string[] | null; error: string | null };

// One token refresh per 10 minutes at most: Zoho limits how often a refresh
// token can be used, and the site's lead flow needs those turns more.
let zohoCache: { at: number; state: ZohoState } | undefined;

async function zohoState(): Promise<ZohoState | null> {
  if (!has("ZOHO_CLIENT_ID") || !has("ZOHO_CLIENT_SECRET") || !has("ZOHO_REFRESH_TOKEN")) return null;
  if (zohoCache && Date.now() - zohoCache.at < 10 * 60_000) return zohoCache.state;
  let state: ZohoState;
  try {
    const q = new URLSearchParams({
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      grant_type: "refresh_token",
    });
    const res = await fetch(`${process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.in"}/oauth/v2/token?${q}`, { method: "POST", signal: AbortSignal.timeout(8_000) });
    const body = (await res.json().catch(() => ({}))) as { access_token?: string; scope?: string; error?: string };
    state = body.access_token
      ? { ok: true, scopes: body.scope ? body.scope.split(/[\s,]+/).filter(Boolean) : null, error: null }
      : { ok: false, scopes: null, error: body.error ?? `HTTP ${res.status}` };
  } catch (err) {
    state = { ok: false, scopes: null, error: err instanceof Error ? err.message : "unknown error" };
  }
  zohoCache = { at: Date.now(), state };
  return state;
}

function keyMatches(given: string | null, want: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const key = process.env.WEBSITE_HEALTH_KEY;
  if (!key) return new Response(null, { status: 404 });
  if (!keyMatches(request.headers.get("x-health-key"), key)) return Response.json({ ok: false }, { status: 401 });

  const leadsMode = process.env.LEADS_MODE ?? "test";
  const tagMode = process.env.NEXT_PUBLIC_TAG_MODE ?? "off";
  const settings = Object.fromEntries(requiredSettings(leadsMode, tagMode).map((name) => [name, has(name)]));
  return Response.json(
    {
      ok: true,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      siteEnv: process.env.SITE_ENV ?? null,
      leadsMode,
      tagMode,
      settings,
      zoho: await zohoState(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
