import type { Metadata } from "next";
import { HomesExplorer } from "@/components/homes-explorer";
import { Accent, Eyebrow, FindHomeBand, IncludedTags, WhoLivesHere } from "@/components/sections";
import { container, lead, pageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Coliving homes across Bangalore",
  description:
    "Ten FF21 coliving homes near Whitefield, Marathahalli, Koramangala, HBR Layout and more. Furnished rooms with meals, WiFi and housekeeping.",
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
      <FindHomeBand />
    </>
  );
}
