import { CalendarClock, Check, MapPin, Play, ShieldCheck, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaMap } from "@/components/area-map";
import { BookingCard } from "@/components/booking-card";
import { HomeCard } from "@/components/home-card";
import { PhotoGrid } from "@/components/photo-grid";
import { highlightIcons, included, roomIcons, termIcons } from "@/components/icons";
import { Accent, AmenityList, Reviews, SectionHeader } from "@/components/sections";
import { SectionNav } from "@/components/section-nav";
import { StoryVideos } from "@/components/story-videos";
import { ShareButton } from "@/components/share-button";
import { Tag } from "@/components/tag";
import { TourTrigger } from "@/components/tour-player";
import { TrackView } from "@/components/track-view";
import { button, container, listingTitle } from "@/components/ui";
import { ogImage } from "@/lib/photos";
import { pins } from "@/lib/schema";
import { fromPrice, getProperty, mealsAt, properties, roomKindLabels, roomKindOf, roomKinds, tourCover, zones, type Property } from "@/lib/properties";
import { inr, site, terms } from "@/lib/site";
import { areaPagesFor, landingName } from "@/lib/wix-content";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

// The home's area, and the wider area people search for when it differs:
// "Whiterose Layout, Whitefield", "Kundanahalli, Marathahalli".
function placeName(p: Property) {
  const zone = zones.find((z) => z.id === p.zone)?.label;
  return zone && zone !== p.area && !p.area.includes(zone) ? `${p.area}, ${zone}` : p.area;
}

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) return {};
  const from = fromPrice(p);
  return {
    title: `FF21 ${p.code}: coliving in ${placeName(p)}`,
    description: `${p.tagline}. Furnished rooms with meals, WiFi and housekeeping${from ? ` from ${inr(from)} a month` : ""}. Visit any day, 9am to 8pm.`,
    alternates: { canonical: `/properties/${p.slug}` },
    openGraph: { images: [{ url: ogImage(p.hero), width: 1200, height: 630, alt: p.hero.alt }] },
  };
}

function jsonLd(p: Property) {
  const from = fromPrice(p);
  const url = `${site.url}/properties/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        "@id": `${url}#home`,
        name: `FF21 ${p.code}, ${p.area}`,
        description: `${p.tagline}. Coliving with meals, WiFi and housekeeping included.`,
        url,
        // Structured data needs a full URL; the site's own photos are paths.
        image: new URL(ogImage(p.hero), site.url).href,
        telephone: site.phone,
        ...(from ? { priceRange: `From ${inr(from)} per month` } : {}),
        address: { "@type": "PostalAddress", addressLocality: `${p.area}, Bangalore`, addressRegion: "Karnataka", addressCountry: "IN" },
        ...(pins[p.slug] ? { geo: { "@type": "GeoCoordinates", latitude: pins[p.slug][0], longitude: pins[p.slug][1] }, hasMap: p.maps } : {}),
        amenityFeature: included.map((i) => ({ "@type": "LocationFeatureSpecification", name: i.label, value: true })),
        parentOrganization: { "@type": "Organization", name: site.name, url: site.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Homes", item: `${site.url}/properties` },
          { "@type": "ListItem", position: 2, name: `FF21 ${p.code}`, item: url },
        ],
      },
    ],
  };
}

// Every home is built ahead of time (generateStaticParams), so the page comes
// in one piece: its rooms, prices and photos are in the HTML itself, which
// search engines and AI crawlers that don't run scripts read directly.
// Unknown addresses answer a real 404.
export const instant = false;

export default async function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) notFound();

  const from = fromPrice(p);
  const kinds = roomKinds(p);
  const zone = zones.find((z) => z.id === p.zone)!;
  const title = `FF21 ${p.code} · ${p.area}`;
  const areas = areaPagesFor(p.code);
  const others = [...properties.filter((o) => o.slug !== p.slug && o.zone === p.zone), ...properties.filter((o) => o.zone !== p.zone)].slice(0, 4);
  const highlights = [
    { icon: Wallet, title: "Zero deposit option", body: "Or pay two months' rent as deposit. Your choice." },
    { icon: CalendarClock, title: "Visit any day", body: `${site.visitHours[0].toUpperCase()}${site.visitHours.slice(1)}, in person or on video.` },
    { icon: ShieldCheck, title: "Safe around the clock", body: "CCTV and security staff, 24 hours a day." },
  ];
  const tourLink = "inline-flex h-10 shrink-0 whitespace-nowrap items-center gap-2 rounded-full border border-line-soft px-4 text-[14.5px] font-semibold text-ink transition-colors hover:border-ink";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p)).replace(/</g, "\\u003c") }} />
      <TrackView event="view_property" params={{ property: p.code }} />

      <div className={`${container} pt-4 md:pt-6`}>
        <nav aria-label="Breadcrumb" className="text-[14px] text-ink-3">
          <Link href="/properties" className="font-medium transition-colors hover:text-ink">Homes</Link>
          <span aria-hidden className="mx-2">›</span>
          <span>{zone.label}</span>
          <span aria-hidden className="mx-2">›</span>
          <span aria-current="page" className="text-ink">FF21 {p.code}</span>
        </nav>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[30px] font-extrabold leading-[34px] tracking-[-0.03em] text-ink md:text-[44px] md:leading-[48px]">
              FF21 {p.code} · <Accent>{p.area}</Accent>
            </h1>
            <p className="mt-2 text-[17px] text-ink-2">{p.tagline}</p>
            <div className="no-scrollbar -mx-6 mt-4 flex gap-2 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:px-0">
              <Tag icon={highlightIcons[p.slug]} tone="tint">
                {p.highlight}
              </Tag>
              {kinds.map((k) => (
                <Tag key={k} icon={roomIcons[k]} tone="mist">
                  {roomKindLabels[k]}
                </Tag>
              ))}
              <Tag icon={Check} tone="mist">
                All-inclusive
              </Tag>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {p.tour && (
              <TourTrigger home={p} className={tourLink}>
                <Play aria-hidden className="h-4 w-4 fill-current" />
                Watch the tour
              </TourTrigger>
            )}
            <a href={p.maps} target="_blank" rel="noopener noreferrer" className={tourLink}>
              <MapPin aria-hidden className="h-4 w-4" />
              Map
            </a>
            <ShareButton title={title} />
          </div>
        </div>

        <div id="photos" className="mt-6 scroll-mt-40">
          <PhotoGrid photos={[p.hero, ...p.gallery]} slug={p.slug} title={title} />
        </div>
        <SectionNav
          watch="photos"
          items={[
            { id: "photos", label: "Photos" },
            { id: "rooms", label: "Rooms" },
            { id: "offers", label: "Amenities" },
            ...(p.tour ? [{ id: "tour", label: "Tour" }] : []),
            { id: "where", label: "Location" },
            { id: "know", label: "Things to know" },
          ]}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-20">
          <div className="min-w-0">
            <section aria-labelledby="summary" className="pb-12">
              <h2 id="summary" className={listingTitle}>Coliving in {p.area}, Bangalore</h2>
              <p className="mt-1 text-[16px] text-ink-2">{kinds.length ? `${kinds.map((k) => roomKindLabels[k]).join(", ")} rooms` : "Rooms on request"} · Furnished · One rent, everything included</p>

              <div className="mt-8 rounded-2xl bg-blue-50 p-6 md:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[22px] font-bold tracking-[-0.02em] text-ink">Included in your rent</h3>
                  <p className="text-[14px] font-medium text-blue-ink">{from ? `From ${inr(from)} a month, per person` : "Per person, per month"}</p>
                </div>
                <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                  {included.map((i) => (
                    <li key={i.label} className="flex flex-col gap-2.5">
                      <span className="pebble grid h-11 w-11 place-items-center bg-surface text-ink">
                        <i.icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span className="text-[15px] font-semibold leading-5 text-ink">{i.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[15px] text-ink-2">
                  <span className="font-semibold text-ink">Meals at FF21 {p.code}:</span> {mealsAt(p)}
                </p>
              </div>

              <ul className="mt-10 space-y-6">
                {highlights.map((h) => (
                  <li key={h.title} className="flex gap-5">
                    <span className="pebble grid h-12 w-12 shrink-0 place-items-center bg-blue-50 text-ink">
                      <h.icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="font-sans text-[16px] font-semibold text-ink">{h.title}</h3>
                      <p className="text-[15px] text-ink-2">{h.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section id="rooms" aria-labelledby="rooms-title" className="scroll-mt-40 py-12">
              <h2 id="rooms-title" className={listingTitle}>Rooms at FF21 {p.code}</h2>
              <p className="mt-1 text-[15px] text-ink-2">Per person, per month. Meals, taxes and charges included.</p>
              {p.rooms.length ? (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {p.rooms.map((r) => {
                    const kind = roomKindOf(r.name);
                    return (
                      <li key={r.name} className="flex flex-col rounded-2xl border border-line p-6 transition-colors hover:border-line-soft">
                        {kind && (
                          <Tag icon={roomIcons[kind]} tone="mist" size="sm" className="self-start">
                            {roomKindLabels[kind]}
                          </Tag>
                        )}
                        <h3 className="mt-4 text-[20px] font-bold tracking-[-0.015em] text-ink">{r.name}</h3>
                        <p className="mt-1 text-[15px] leading-6 text-ink-2">{r.description}</p>
                        <p className="mt-5 text-[15px] text-ink-2">
                          {r.price ? (
                            <>
                              <span className="tabular font-display text-[24px] font-bold text-ink">{inr(r.price)}</span> a month
                            </>
                          ) : (
                            "Price on request"
                          )}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-6 rounded-2xl bg-mist p-6 text-[16px] text-ink-2">Ask us for this home&apos;s room types and prices when you book a visit.</p>
              )}
            </section>

            <section id="offers" aria-labelledby="offers-title" className="cv-auto scroll-mt-40 py-12">
              <h2 id="offers-title" className={listingTitle}>What every FF21 home offers</h2>
              <div className="mt-7">
                <AmenityList />
              </div>
            </section>

            {p.tour && (
              <section id="tour" aria-labelledby="tour-title" className="scroll-mt-40 py-12">
                <div className="grid items-center gap-8 rounded-2xl bg-ink p-5 sm:grid-cols-[220px_minmax(0,1fr)] md:p-6">
                  <TourTrigger home={p} className="group relative block aspect-[4/5] w-full overflow-hidden rounded-xl bg-mist text-left sm:aspect-[9/16]">
                    <Image src={tourCover(p).id} alt={tourCover(p).alt} fill sizes="220px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span aria-hidden className="absolute inset-0 bg-[rgb(12_24_26/0.3)]" />
                    <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-blue text-on-blue shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play aria-hidden className="ml-1 h-6 w-6 fill-current" />
                    </span>
                    <span className="sr-only">Play the FF21 {p.code} tour</span>
                  </TourTrigger>
                  <div className="pb-2 sm:pb-0 sm:pr-4">
                    <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white/60">Home tour</p>
                    <h2 id="tour-title" className="mt-3 text-[28px] font-bold leading-8 tracking-[-0.02em] text-white md:text-[32px] md:leading-9">
                      Walk through FF21 {p.code} before you visit.
                    </h2>
                    <p className="mt-3 text-[16px] leading-[26px] text-white/75">Filmed upright by the FF21 team. It plays full screen, with the way to book right beside it.</p>
                    <TourTrigger home={p} className={`${button.onMediaPrimary} mt-6`}>
                      <Play aria-hidden className="h-4 w-4 fill-current" />
                      Watch the tour
                    </TourTrigger>
                  </div>
                </div>
              </section>
            )}

            <section id="where" aria-labelledby="where-title" className="cv-auto scroll-mt-40 py-12">
              <h2 id="where-title" className={listingTitle}>Where you&apos;ll be</h2>
              <a
                href={p.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-[15px] font-medium text-blue-ink transition-colors hover:text-ink"
              >
                <MapPin aria-hidden className="h-4 w-4" />
                {p.area}, {zone.label === p.area ? "" : `${zone.label}, `}Bangalore · Open in Google Maps
              </a>
              <AreaMap home={p} />
              <h3 className="mt-6 font-sans text-[16px] font-semibold text-ink">Close to</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.nearby.map((place) => (
                  <li key={place}>
                    <Tag icon={MapPin}>{place}</Tag>
                  </li>
                ))}
              </ul>
              {areas.length > 0 && (
                <>
                  <h3 className="mt-6 font-sans text-[16px] font-semibold text-ink">PGs and coliving around {p.area}</h3>
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {areas.map((l) => (
                      <li key={l.path}>
                        <Link href={l.url} className="text-[15px] text-blue-ink transition-colors hover:text-ink">
                          {landingName(l)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section id="know" aria-labelledby="know-title" className="cv-auto scroll-mt-40 py-12">
              <h2 id="know-title" className={listingTitle}>Things to know</h2>
              <dl className="mt-7 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                {terms.map((t) => {
                  const Icon = termIcons[t.label];
                  return (
                    <div key={t.label}>
                      <dt className="flex items-center gap-4 text-[15px] font-semibold text-ink">
                        <span className="pebble grid h-11 w-11 shrink-0 place-items-center bg-mist text-ink">
                          <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        {t.label}
                      </dt>
                      <dd className="-mt-3 pl-[60px] text-[15px] text-ink-2">{t.value}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-space)+72px)]">
              <BookingCard slug={p.slug} code={p.code} area={p.area} from={from} rooms={p.rooms.map((r) => ({ name: r.name, kind: roomKindOf(r.name) }))} />
            </div>
          </aside>
        </div>
      </div>

      <section aria-labelledby="reviews" className={`cv-auto ${container} py-16 md:py-24`}>
        <SectionHeader
          id="reviews"
          eyebrow="FFers on FF21"
          title={
            <>
              In their own <Accent>words</Accent>.
            </>
          }
        />
        <div className="mt-10">
          <StoryVideos home={p.code} limit={4} />
        </div>
        <div className="mt-5">
          <Reviews />
        </div>
      </section>

      <section aria-labelledby="more" className={`cv-auto ${container} pb-28 md:pb-24`}>
        <SectionHeader id="more" eyebrow="Keep exploring" title={`More homes near ${zone.label}.`} lead="And across Bangalore." />
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => (
            <HomeCard key={o.slug} property={o} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 46vw, 92vw" />
          ))}
        </div>
      </section>

      {/* Phones: the price and the action, always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 bg-surface px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_28px_rgb(23_43_45/0.1)] lg:hidden">
        <div>
          <p className="text-[16px] font-semibold text-ink">{from ? <span className="tabular"><span className="font-normal text-ink-2">From </span>{inr(from)} <span className="font-normal text-ink-2">a month</span></span> : "Prices on request"}</p>
          <p className="flex items-center gap-1 text-[13px] font-semibold text-blue-ink">
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.75} />
            All-inclusive
          </p>
        </div>
        <Link href={`/find-my-home?property=${p.slug}`} className={button.primary}>
          Book now
        </Link>
      </div>
    </>
  );
}
