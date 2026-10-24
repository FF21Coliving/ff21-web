import { included } from "@/components/icons";
import { faqs } from "@/lib/content";
import { properties } from "@/lib/properties";
import { site } from "@/lib/site";

// /llms.txt: a plain summary of FF21 for AI assistants (llmstxt.org), built
// from the same data as the pages, so it never says something they don't.

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> FF21 runs coliving homes for young working professionals and students in Bangalore, since ${site.founded}. One monthly rent covers a furnished room, breakfast and dinner on weekdays, WiFi, housekeeping, laundry and utilities, with taxes included. ${site.residents.toLocaleString("en-IN")} FFers (residents) have lived at FF21 so far.`,
    "",
    `- Homes: ${properties.length}, across Whitefield, Marathahalli, Mahadevapura, Kundanahalli, Thubarahalli, Doddanekundi, HBR Layout, Koramangala and Sarjapur`,
    `- Rent starts from ${inr(Math.min(...properties.map((p) => p.from)))} a month per person`,
    `- Included in the rent: ${included.map((i) => (i.label === "WiFi" ? i.label : i.label.toLowerCase())).join(", ")}`,
    `- Meals: breakfast and dinner Monday to Friday at every home; FF21 ITP and FF21 WFD also serve weekend meals`,
    `- Open to all genders`,
    `- Call ${site.phoneDisplay} · WhatsApp ${site.whatsappDisplay} · ${site.email}`,
    `- Elsewhere: [Instagram](${site.instagram}) · [Facebook](${site.facebook}) · [LinkedIn](${site.linkedin}) · [YouTube](${site.youtube})`,
    "",
    "## Homes",
    "",
    ...properties.map((p) => `- [FF21 ${p.code}, ${p.area}](${site.url}/properties/${p.slug}): ${p.tagline}. Rooms: ${p.rooms.map((r) => r.name).join(", ")}. From ${inr(p.from)} a month.`),
    "",
    "## Questions",
    "",
    ...faqs.map((f) => `- ${f.q} ${f.a}`),
    "",
    "## Pages",
    "",
    `- [All homes](${site.url}/properties): every home with photos, rooms and prices`,
    `- [Find my home](${site.url}/find-my-home): a short form that matches a visitor to a home and books a visit`,
    `- [About FF21](${site.url}/about)`,
    `- [Blog](${site.url}/blog): guides to living and working in Bangalore`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
