# FF21 Coliving website

The new ff21.in: Next.js 16 (App Router, Cache Components), Tailwind CSS 4, hosted on Vercel.
Scope 1 of the one-week plan: base site, Find my home (the Zoho lead flow), external tools, final-quality design.

Design tokens and components follow the FF21 Design Blueprint (https://claude.ai/artifact/HUV5EmLVp3wz7K6mnYBeAk). The tokens in `src/app/globals.css` use the same names and values as the blueprint's `tokens.json`; change both together.

## Run it

```bash
npm install
cp .env.example .env.local   # then set SITE_ENV=development
npm run dev                  # http://localhost:3000
```

## Changing the site

Every change goes through a pull request, tests and a review before it reaches
production: see [CONTRIBUTING.md](CONTRIBUTING.md). `npm run check` runs
everything CI runs.

## Where things live

| What | Where |
| --- | --- |
| The 10 homes (rooms, prices, photos, Zoho picklist value) | `src/lib/properties.ts` |
| Contact details, prices, booking terms | `src/lib/site.ts` |
| Amenities, moving-in steps, testimonials, team | `src/lib/content.ts` |
| Photo ids and alt text | `src/lib/photos.ts` |
| Find my home (8-step lead flow) | `src/components/find-home/flow.tsx`, `/find-my-home` (`/register` redirects here) |
| Home cards, explorer, tours, hero film | `src/components/home-card.tsx`, `homes-explorer.tsx`, `tour-button.tsx`, `hero-film.tsx` |
| Lead API (validation, spam checks, Zoho) | `src/app/api/lead/route.ts`, `src/lib/lead.ts`, `src/lib/zoho.ts` |
| Tracking (GTM / GA4 / Ads / Meta) | `src/components/analytics.tsx`, `src/lib/track.ts` |

Photos are still served from Wix's CDN (`static.wixstatic.com`) through a custom image loader.
Move them to our own storage before the Wix plan is cancelled (scope 2).

## Leads

`LEADS_MODE=test` (the default) validates each registration and logs what would be sent; nothing reaches Zoho.

To go live, set `LEADS_MODE=zoho` with the tokens of a Zoho Web-to-Lead form made for this site.
The form on ff21.co.in has Google reCAPTCHA switched on, so its tokens are rejected when posted from here.
Create a copy of that form without reCAPTCHA (this site has its own honeypot and timing checks) and use its `xnQsjsdp` and `xmIwtLD` values.
Field mapping is in `zohoFields()` in `src/lib/zoho.ts`. Add the Description field to the new form and set `ZOHO_DESCRIPTION_FIELD=Description` so move-in, budget, room and workplace reach the sales team.

## Tracking

`NEXT_PUBLIC_TAG_MODE` picks one of:

- `off`: nothing loads (development and previews)
- `gtm`: only GTM-W2P98LL loads; GTM fires GA4, Google Ads and Meta from dataLayer events
- `direct`: GA4, Google Ads and the Meta Pixel load without GTM

Never run both. Events pushed to the dataLayer: `form_start`, `find_home_step`, `contact_lead` (contact details saved: the Google Ads lead conversion), `generate_lead` (form finished), `whatsapp_click`, `call_click`, `view_property`, `video_play`.

## Search engines

Only `SITE_ENV=production` lets search engines index the site. Every other environment sends `noindex` and a blocking robots.txt.
