import type { Metadata } from "next";
import Image from "next/image";
import { Accent, Eyebrow, FindHomeBand, LifeSection, SectionHeader } from "@/components/sections";
import { container, pageTitle } from "@/components/ui";
import { team } from "@/lib/content";
import { photos } from "@/lib/photos";
import { properties } from "@/lib/properties";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `About FF21: coliving in Bangalore since ${site.founded}`,
  description: `FF21 opened in ${site.founded} with 33 rooms. Today it runs ${properties.length} coliving homes across Bangalore, and ${site.residents.toLocaleString("en-IN")} FFers have lived in them.`,
  alternates: { canonical: "/about" },
};

const milestones = [
  { value: String(site.founded), label: "FF21 opens in one building" },
  { value: "33", label: "rooms in that first home" },
  { value: String(properties.length), label: "homes across Bangalore today" },
  { value: site.residents.toLocaleString("en-IN"), label: "FFers so far, and counting" },
];

export default function AboutPage() {
  return (
    <>
      <section className={`${container} pt-10 md:pt-16`}>
        <Eyebrow>About FF21</Eyebrow>
        <h1 className={`rise mt-5 max-w-4xl ${pageTitle}`}>
          It started with <Accent>33 rooms</Accent>.
        </h1>
        <div className="rise-2 mt-10 grid max-w-5xl gap-6 text-[17px] leading-[29px] text-ink-2 md:grid-cols-2 md:gap-12 md:text-[18px] md:leading-[30px]">
          <p>
            In {site.founded}, people moving to Bangalore for a new job had two choices: a PG, or a flat of their own. Our founder, Ajay Nemani, saw room for a third. FF21 opened that year in one building with 33 rooms.
          </p>
          <p>
            Today there are {properties.length} FF21 homes across the city, and {site.residents.toLocaleString("en-IN")} FFers have lived in them: young professionals and students who wanted a place that comes with friends. The idea hasn&apos;t changed: good rooms, good food, and people who turn into family.
          </p>
        </div>
      </section>

      <section className={`${container} pt-14 md:pt-20`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist md:aspect-[21/9]">
          <Image src={photos.loungeBright.id} alt={photos.loungeBright.alt} fill preload sizes="(min-width: 1440px) 1280px, 100vw" quality={90} className="object-cover" />
        </div>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {milestones.map((m) => (
            <div key={m.label} className="flex flex-col-reverse rounded-2xl bg-mist p-7 md:p-8">
              <dt className="mt-3 text-[16px] text-ink-2">{m.label}</dt>
              <dd className="tabular font-display text-[56px] font-extrabold leading-none tracking-[-0.04em] text-ink md:text-[64px]">{m.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="team" className={`${container} py-20 md:py-28`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <SectionHeader id="team" eyebrow="The team" title="The people behind FF21." />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {team.map((m) => (
              <li key={m.name} className="flex items-center gap-4 rounded-2xl bg-mist p-5 transition-colors hover:bg-blue-50">
                <span aria-hidden className="pebble grid h-14 w-14 shrink-0 place-items-center bg-blue-100 text-[17px] font-bold text-blue-ink">
                  {m.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <span>
                  <span className="block text-[17px] font-semibold text-ink">{m.name}</span>
                  <span className="block text-[15px] text-ink-2">{m.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LifeSection />

      <FindHomeBand />
    </>
  );
}
