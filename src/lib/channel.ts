// Where a website visit came from, for the dashboard's Website tab.

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|baidu)\./;
const SOCIAL: [RegExp, string][] = [
  [/instagram\./, "Instagram"],
  [/facebook\.|fb\.me|fb\.com/, "Facebook"],
  [/youtube\.|youtu\.be/, "YouTube"],
  [/linkedin\.|lnkd\.in/, "LinkedIn"],
  [/t\.co$|twitter\.|x\.com$/, "X"],
  [/whatsapp\.|wa\.me/, "WhatsApp"],
];

// Where a visit came from, from its first page: an ad click id or campaign
// tags first, then the site that linked here, else Direct.
export function channelOf(e: { ref?: string; source?: string; medium?: string; click?: string }): string {
  const src = (e.source ?? "").toLowerCase();
  const med = (e.medium ?? "").toLowerCase();
  const ref = (e.ref ?? "").toLowerCase();
  const paid = /cpc|ppc|paid|ads?$|display|cpm/.test(med);
  if (e.click === "gclid" || (paid && /google|adwords|youtube/.test(src))) return "Google Ads";
  if ((e.click === "fbclid" && paid) || (paid && /facebook|instagram|meta|^(fb|ig)$/.test(src))) return "Meta Ads";
  if (paid) return "Other ads";
  if (src) {
    if (/instagram|^ig$/.test(src)) return "Instagram";
    if (/facebook|^fb$/.test(src)) return "Facebook";
    if (/google/.test(src)) return med === "organic" ? "Google search" : "Google (tagged)";
    if (/whatsapp/.test(src)) return "WhatsApp";
    if (/mail|newsletter/.test(src + med)) return "Email";
    return "Tagged link";
  }
  // Meta adds fbclid to links from both ads and posts; without campaign tags
  // the two can't be told apart.
  if (e.click === "fbclid") return "Meta (ads or posts)";
  if (ref) {
    if (SEARCH.test(ref)) return /google/.test(ref) ? "Google search" : "Other search";
    for (const [re, name] of SOCIAL) if (re.test(ref)) return name;
    if (/ff21\./.test(ref)) return "FF21's other sites";
    return "Other sites";
  }
  return "Direct";
}
