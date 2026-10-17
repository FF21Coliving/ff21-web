import type { Metadata } from "next";
import Link from "next/link";
import { HomesExplorer } from "@/components/homes-explorer";
import { Accent, Eyebrow, FindHomeBand, IncludedTags, WhoLivesHere } from "@/components/sections";
import { container, lead, listingTitle, pageTitle } from "@/components/ui";
import { landingName, landingPages } from "@/lib/wix-content";

export const metadata: Metadata = {
  title: "Coliving homes across Bangalore",
  description:
    "FF21 coliving homes near Whitefield, Marathahalli, Koramangala, HBR Layout and more. Furnished rooms with meals, WiFi and housekeeping.",
  alternates: { canonical: "/properties" },
};

export default function PropertiesPage() {
  return (
    <>
      <section className={`${container} pb-20 pt-10 md:pb-28 md:pt-14`}>
        <Eyebrow>The homes</Eyebrow>
        <h1 className={`rise mt-5 ${pageTitle}`}>
          Find your <Accent>home</Accent> in Bangalore.
        </h1>
        <p className={`rise-2 mt-5 max-w-2xl ${lead}`}>
          Every FF21 home comes furnished, and one rent covers it all. Filter by area or room type, or let us match you.
        </p>
        <div className="rise-3 mt-6">
          <IncludedTags tone="mist" />
        </div>
        <div className="mt-14">
          <HomesExplorer />
        </div>
      </section>
      <WhoLivesHere />
      {/* Every area page carried over from the old site, so people and
          search engines can reach them from here. */}
      <section aria-labelledby="areas-title" className={`${container} pb-20 md:pb-28`}>
        <h2 id="areas-title" className={listingTitle}>PGs and coliving by area</h2>
        <ul className="mt-6 columns-1 gap-x-10 text-[15px] leading-[30px] sm:columns-2 lg:columns-4">
          {[...landingPages]
            .sort((a, b) => landingName(a).localeCompare(landingName(b)))
            .map((l) => (
              <li key={l.path} className="break-inside-avoid">
                <Link href={l.path} className="text-ink-2 transition-colors hover:text-blue-ink">
                  {landingName(l)}
                </Link>
              </li>
            ))}
        </ul>
      </section>
      <FindHomeBand />
    </>
  );
}
