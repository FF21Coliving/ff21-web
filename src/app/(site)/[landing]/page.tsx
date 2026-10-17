import { ArrowRight, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeCard } from "@/components/home-card";
import { Eyebrow, FindHomeBand, IncludedTags } from "@/components/sections";
import { TrackedLink } from "@/components/tracked-link";
import { button, container, pageTitle, sectionTitle } from "@/components/ui";
import { WixCopy } from "@/components/wix-copy";
import { whatsappLink } from "@/lib/site";
import { getLanding, homesFor, landingName, landingPages, type Landing } from "@/lib/wix-content";

// The "PG near X" and "coliving in Y" pages from the Wix site, at the same
// URLs and with the same titles, descriptions and copy, so their search
// rankings carry over. Each now leads with the FF21 homes close by.

// These pages are all prerendered; looking the URL up before rendering lets
// unknown ones answer a real 404, which matters more here than instant
// client-side navigation.
export const instant = false;

export function generateStaticParams() {
  return landingPages.map((l) => ({ landing: l.path.slice(1) }));
}

export async function generateMetadata({ params }: PageProps<"/[landing]">): Promise<Metadata> {
  const { landing } = await params;
  const l = getLanding(landing);
  if (!l) return {};
  return {
    title: { absolute: l.title },
    description: l.description ?? undefined,
    alternates: { canonical: l.url },
    openGraph: { title: l.title, description: l.description ?? undefined, url: l.url, ...(l.image ? { images: [{ url: l.image }] } : {}) },
  };
}

// Unknown URLs answer 404 straight away, before anything streams.
export default async function LandingPage({ params }: PageProps<"/[landing]">) {
  const l = getLanding((await params).landing);
  if (!l) notFound();
  return <LandingContent l={l} />;
}

function LandingContent({ l }: { l: Landing }) {
  const homes = homesFor(l.path).slice(0, 4);
  const name = landingName(l);

  return (
    <>
      <section className={`${container} pt-10 md:pt-14`}>
        <Eyebrow>FF21 Coliving · Bangalore</Eyebrow>
        <h1 className={`rise mt-5 max-w-4xl ${pageTitle}`}>{l.h1 ?? name}</h1>
        <div className="rise-2 mt-7">
          <IncludedTags size="sm" />
        </div>
        <div className="rise-3 mt-8 flex flex-wrap gap-3">
          <Link href="/find-my-home" className={`${button.primary} group`}>
            Book now
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <TrackedLink event="whatsapp_click" params={{ placement: "landing_hero" }} href={whatsappLink(`Hi FF21! I'm looking for a place: ${name}.`)} className={button.secondary}>
            <MessageCircle aria-hidden className="h-4 w-4" />
            Ask on WhatsApp
          </TrackedLink>
        </div>
      </section>

      <section aria-labelledby="homes-close" className={`${container} pt-14 md:pt-20`}>
        <h2 id="homes-close" className={`max-w-3xl ${sectionTitle}`}>
          {homes.length === 1 ? "The FF21 home close by" : "FF21 homes close by"}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {homes.map((p, i) => (
            <HomeCard key={p.slug} property={p} eager={i < 2} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 46vw, 92vw" />
          ))}
        </div>
      </section>

      <article className={`${container} pb-20 pt-14 md:pb-28 md:pt-20`}>
        <WixCopy blocks={l.blocks} className="max-w-3xl" />
      </article>

      <FindHomeBand />
    </>
  );
}
