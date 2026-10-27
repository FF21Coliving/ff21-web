import "server-only";
import { getProperty, homesNear, type Property } from "./properties";
import { homesFor } from "./wix-content";

// Who handles each home's website leads in Zoho, from Madhvik on 27 Oct 2026.
// Each person's first home is their primary; the rest are secondary. Ids are
// the Zoho CRM user ids.
const team = [
  { name: "Sushmita Mitra", id: "639899000047382001", homes: ["PODS", "KORA"] },
  { name: "Tripti Thimmaiah", id: "639899000047379001", homes: ["KDH", "LIT", "PODS"] },
  { name: "Akash Kamboj", id: "639899000184774070", homes: ["WFD", "ITP", "KORA"] },
  { name: "Jatin Sharma", id: "639899000047381001", homes: ["WFD", "ITP", "KORA"] },
  { name: "Aryan", id: "639899000282620150", homes: ["ITP", "WFD", "SJR"] },
  { name: "Amber Fatima", id: "639899000092430001", homes: ["BGM", "PMC", "SJR"] },
  { name: "Ankita Sarkar", id: "639899000233488237", homes: ["HBR", "PMC", "BGM"] },
];

export type Owner = { id: string; name: string };

// A steady number for a lead, so the same lead always lands with the same
// person however often it's saved.
function spread(key: string, n: number) {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % n;
}

// The home's primary person; with two primaries (WFD), or none (LIT, KORA,
// PMC, SJR), leads rotate among the people listed for it.
export function ownerForHome(code: string, key: string): Owner | undefined {
  const primary = team.filter((t) => t.homes[0] === code);
  const pool = primary.length ? primary : team.filter((t) => t.homes.includes(code));
  if (!pool.length) return undefined;
  const t = pool[spread(key, pool.length)];
  return { id: t.id, name: t.name };
}

// The home a lead is about, best guess first: the home they chose, else the
// first home near a place they're searching around, else the home or area
// page their visit landed on. Before any of that, Zoho's own rule assigns the lead.
export function homeForLead(lead: { property?: string; places?: string[]; page?: string }): Property | undefined {
  const chosen = lead.property ? getProperty(lead.property) : undefined;
  if (chosen) return chosen;
  for (const place of lead.places ?? []) {
    const near = homesNear(place);
    if (near.length) return near[0];
  }
  const path = lead.page ? safePath(lead.page) : undefined;
  if (!path) return undefined;
  const fromHome = /^\/properties\/([^/]+)$/.exec(path);
  if (fromHome) return getProperty(fromHome[1]);
  if (path === "/" || path === "/find-my-home" || path.startsWith("/blog") || path.startsWith("/post")) return undefined;
  const homes = homesFor(path);
  return homes.length && homes.length < 10 ? homes[0] : undefined;
}

function safePath(page: string) {
  try {
    return decodeURIComponent(new URL(page, "https://www.ff21.in").pathname);
  } catch {
    return undefined;
  }
}

export function ownerForLead(lead: { property?: string; places?: string[]; page?: string }, key: string): Owner | undefined {
  const home = homeForLead(lead);
  return home ? ownerForHome(home.code, key) : undefined;
}
