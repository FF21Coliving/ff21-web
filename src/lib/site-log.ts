"use client";

// FF21's own visit log for the dashboard's Website tab: page views, taps and
// the site's events (form steps, WhatsApp, calls, tours), sent in small
// batches to /api/t. Anonymous: a random id kept in this browser (no cookie),
// never a name, phone or email. Turn it off in a browser with ?notrack (the
// team's own visits), back on with ?track.

type LogEvent = {
  kind: "view" | "click" | "event";
  path: string;
  name?: string;
  target?: string;
  section?: string;
  ref?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  click?: "gclid" | "fbclid";
  first?: boolean; // the visit's first page: where it came from
  at: string;
};

const VISITOR = "ff21_vid";
const SESSION = "ff21_sid";
const OFF = "ff21_notrack";
const IDLE_MS = 30 * 60_000;

const queue: LogEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let listening = false;

const newId = () => (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function off(): boolean {
  const url = new URL(window.location.href);
  const local = store("local");
  if (url.searchParams.has("notrack")) local?.setItem(OFF, "1");
  if (url.searchParams.has("track")) local?.removeItem(OFF);
  return local?.getItem(OFF) === "1" || navigator.webdriver === true;
}

function visitorId(): string {
  const local = store("local");
  let id = local?.getItem(VISITOR);
  if (!id) {
    id = newId();
    local?.setItem(VISITOR, id);
  }
  return id;
}

// A visit ends after 30 minutes without a page view or tap.
function sessionId(): { id: string; fresh: boolean } {
  const s = store("session");
  const now = Date.now();
  try {
    const saved = JSON.parse(s?.getItem(SESSION) ?? "null") as { id: string; t: number } | null;
    if (saved && now - saved.t < IDLE_MS) {
      s?.setItem(SESSION, JSON.stringify({ id: saved.id, t: now }));
      return { id: saved.id, fresh: false };
    }
  } catch {
    // fall through to a new visit
  }
  const id = newId();
  s?.setItem(SESSION, JSON.stringify({ id, t: now }));
  return { id, fresh: true };
}

function flush() {
  if (timer) clearTimeout(timer);
  timer = undefined;
  if (queue.length === 0) return;
  const body = JSON.stringify({ visitor: visitorId(), session: sessionId().id, events: queue.splice(0, 40) });
  const sent = navigator.sendBeacon?.("/api/t", new Blob([body], { type: "application/json" }));
  if (!sent) fetch("/api/t", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => undefined);
  if (queue.length) flush();
}

function push(e: Omit<LogEvent, "at">) {
  if (typeof window === "undefined" || off()) return;
  queue.push({ ...e, at: new Date().toISOString() });
  if (!listening) {
    listening = true;
    // Send what's waiting when the tab is hidden or closed.
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
    window.addEventListener("pagehide", flush);
  }
  if (!timer) timer = setTimeout(flush, 4_000);
}

export function logView(path: string) {
  if (typeof window === "undefined") return;
  const { fresh } = sessionId();
  const view: Omit<LogEvent, "at"> = { kind: "view", path };
  // Where the visit came from, on its first page only (the referrer stays
  // the same as the visitor moves around the site).
  if (fresh) {
    view.first = true;
    const url = new URL(window.location.href);
    const ref = document.referrer;
    if (ref && !ref.startsWith(window.location.origin)) {
      try {
        view.ref = new URL(ref).hostname;
      } catch {
        // not a URL
      }
    }
    view.source = url.searchParams.get("utm_source")?.slice(0, 100) ?? undefined;
    view.medium = url.searchParams.get("utm_medium")?.slice(0, 100) ?? undefined;
    view.campaign = url.searchParams.get("utm_campaign")?.slice(0, 150) ?? undefined;
    view.click = url.searchParams.has("gclid") || url.searchParams.has("gbraid") || url.searchParams.has("wbraid") ? "gclid" : url.searchParams.has("fbclid") ? "fbclid" : undefined;
  }
  push(view);
}

export function logEvent(name: string, target?: string) {
  push({ kind: "event", path: window.location.pathname, name, target });
}

const clean = (s: string | null | undefined, max = 80) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max) || undefined;

// What a link leads to, in words the team reads at a glance.
function targetOf(el: Element): string | undefined {
  const href = el.getAttribute("href");
  if (!href) return undefined;
  if (href.startsWith("tel:")) return "Call";
  if (href.startsWith("mailto:")) return "Email";
  if (/wa\.me|whatsapp\.com/.test(href)) return "WhatsApp";
  try {
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin) return url.pathname;
    if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(url.href)) return "Google Maps";
    return url.hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

// Which part of the page a tap was in: the nearest section's heading id, or
// the header, footer or a dialog.
function sectionOf(el: Element): string | undefined {
  const box = el.closest("[data-track-section], section, header, footer, nav, dialog, aside");
  if (!box) return undefined;
  return clean(box.getAttribute("data-track-section") ?? box.getAttribute("aria-labelledby") ?? box.id ?? "", 60) ?? box.tagName.toLowerCase();
}

export function logClick(e: MouseEvent) {
  const el = (e.target as Element | null)?.closest?.("a, button, [role='button'], summary");
  if (!el || el.closest("[data-notrack]")) return;
  const name = clean(el.getAttribute("data-track") ?? el.getAttribute("aria-label") ?? (el as HTMLElement).innerText ?? el.getAttribute("title"));
  push({ kind: "click", path: window.location.pathname, name: name ?? el.tagName.toLowerCase(), target: targetOf(el), section: sectionOf(el) });
}
