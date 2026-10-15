import { HomesExplorer } from "@/components/homes-explorer";
import { ScrollExpandHero } from "@/components/scroll-expand-hero";
import {
  Accent,
  AmenitiesBento,
  ArrowLink,
  Faq,
  FindHomeBand,
  IncludedBand,
  LifeSection,
  MovingIn,
  PhotoMoment,
  ReviewsFeature,
  SectionHeader,
  ToursSection,
  VisitInvite,
  WhoLivesHere,
} from "@/components/sections";
import { container, sectionY } from "@/components/ui";
import { faqs } from "@/lib/content";
import { photos } from "@/lib/photos";
import { properties } from "@/lib/properties";
import { inr, prices, site } from "@/lib/site";

const frames = [photos.rooftopSunset, photos.loungeTeal, photos.diningFamily, photos.rooftopDusk, photos.workspace];

// One JSON-LD object with a @graph, the form every structured-data reader expects.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/brand/ff21-logo.png`,
      email: site.email,
      telephone: site.phone,
      foundingDate: String(site.founded),
      sameAs: [site.instagram, site.facebook],
      address: { "@type": "PostalAddress", streetAddress: "672, Ferns Paradise", addressLocality: "Bangalore", postalCode: "560037", addressCountry: "IN" },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <ScrollExpandHero frames={frames} homes={properties.length} from={inr(prices.twinFrom)} />

      <IncludedBand />

      <section aria-labelledby="homes" className={`${container} ${sectionY}`}>
        <SectionHeader
          id="homes"
          eyebrow="The homes"
          title={
            <>
              Ten homes across <Accent>Bangalore</Accent>.
            </>
          }
          lead="Every home comes furnished, with meals, WiFi, housekeeping and laundry in the rent. Pick an area, or let us match you."
          action={<ArrowLink href="/find-my-home">Find my home</ArrowLink>}
        />
        <div className="mt-12 md:mt-14">
          <HomesExplorer />
        </div>
      </section>

      <WhoLivesHere />

      <FindHomeBand />

      <PhotoMoment
        photo={photos.rooftopNight}
        eyebrow="Life at FF21"
        title={
          <>
            Rooftops, festivals and <Accent tone="light">friends for life</Accent>.
          </>
        }
        body="Game rooms, lounges and rooftops to end the day on, with the people you live with."
      />

      <ToursSection />

      <LifeSection />

      <section aria-labelledby="inside-title" className={`${container} ${sectionY}`}>
        <SectionHeader
          id="inside-title"
          eyebrow="Inside every home"
          title={
            <>
              More than a room, and it&apos;s all in the <Accent>rent</Accent>.
            </>
          }
          lead="Chef-made meals, game rooms, places to work and security around the clock. Prices include taxes and charges."
        />
        <div className="mt-12 md:mt-14">
          <AmenitiesBento />
        </div>
      </section>

      <section aria-labelledby="how-title" className={`bg-mist ${sectionY}`}>
        <div className={container}>
          <SectionHeader
            id="how-title"
            eyebrow="Moving in"
            title={
              <>
                Four steps, and you&apos;re <Accent>home</Accent>.
              </>
            }
            lead={`Visits ${site.visitHours}, in person or on video.`}
          />
          <div className="mt-12 md:mt-14">
            <MovingIn />
          </div>
        </div>
      </section>

      <section aria-labelledby="reviews-title" className={`bg-blue-50 ${sectionY}`}>
        <div className={container}>
          <SectionHeader
            id="reviews-title"
            eyebrow="FFers on FF21"
            title={
              <>
                In their own <Accent>words</Accent>.
              </>
            }
          />
          <div className="mt-12 md:mt-14">
            <ReviewsFeature />
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className={`${container} scroll-mt-24 ${sectionY}`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeader
              id="faq-title"
              eyebrow="Questions"
              title={
                <>
                  Booking, deposits and <Accent>moving out</Accent>.
                </>
              }
              lead="In plain words. Anything else, ask us on WhatsApp."
            />
          </div>
          <Faq />
        </div>
      </section>

      <VisitInvite />
    </>
  );
}
