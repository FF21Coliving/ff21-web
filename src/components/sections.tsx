import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Flame,
  Gamepad2,
  GraduationCap,
  Heart,
  Laptop,
  MessageCircle,
  Palette,
  PartyPopper,
  Plane,
  Plus,
  Sunset,
  TreePine,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { amenities, faqs, steps, testimonials, type AmenityIcon } from "@/lib/content";
import { photos, type Photo as PhotoType } from "@/lib/photos";
import { properties, roomKindLabels, type RoomKind } from "@/lib/properties";
import { inr, prices, site, terms, whatsappLink } from "@/lib/site";
import { amenityIcons, included, roomIcons, stepIcons, termIcons } from "./icons";
import { Splash, Stamp } from "./splash";
import { Tag } from "./tag";
import { TourRail } from "./tour-player";
import { TrackedLink } from "./tracked-link";
import { button, container, lead, sectionTitle, sectionY } from "./ui";

/* ---------------------------------------------------------------- headings */

type Tone = "default" | "light" | "onBlue";

// The logo's yellow door, then a short uppercase label.
export function Eyebrow({ children, tone = "default" }: { children: React.ReactNode; tone?: Tone }) {
  const color = tone === "light" ? "text-white/85" : tone === "onBlue" ? "text-ink" : "text-blue-ink";
  return (
    <p className={`flex items-center gap-2.5 text-[12.5px] font-semibold uppercase leading-5 tracking-[0.14em] ${color}`}>
      <span aria-hidden className="door" />
      {children}
    </p>
  );
}

// One word or short phrase per headline, in Instrument Serif italic.
export function Accent({ children, tone = "default" }: { children: React.ReactNode; tone?: Tone }) {
  const color = tone === "light" ? "text-white" : tone === "onBlue" ? "text-ink" : "text-blue-ink";
  return <em className={`accent ${color}`}>{children}</em>;
}

type HeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  id?: string;
  action?: React.ReactNode;
};

export function SectionHeader({ eyebrow, title, lead: text, id, action }: HeaderProps) {
  return (
    <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className={`mt-5 ${sectionTitle}`}>
          {title}
        </h2>
        {text && <p className={`mt-5 max-w-2xl ${lead}`}>{text}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// A link that moves instead of underlining: the arrow's circle fills blue.
export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3 text-[15px] font-semibold text-ink">
      {children}
      <span className="grid h-10 w-10 place-items-center rounded-full border border-line-soft transition-[background-color,border-color] duration-300 group-hover:border-blue group-hover:bg-blue">
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

// What the rent covers, as a row of tags.
export function IncludedTags({ tone = "line", size = "md" }: { tone?: "line" | "mist" | "glass" | "light"; size?: "sm" | "md" }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Included in the rent">
      {included.map((i) => (
        <li key={i.label}>
          <Tag icon={i.icon} tone={tone} size={size}>
            {i.label}
          </Tag>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- one rent */

// The money message, early and plain: one rent, and everything it covers,
// written out like a bill with nothing else to pay.
export function IncludedBand() {
  return (
    <section id="included" aria-labelledby="included-title" className="relative scroll-mt-24 overflow-hidden bg-blue-50">
      <div className={`${container} grid items-center gap-12 ${sectionY} md:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-24`}>
        <div>
          <Eyebrow>All-inclusive rent</Eyebrow>
          <h2 id="included-title" className={`mt-5 ${sectionTitle}`}>
            One rent. <Accent>Everything</Accent> in it.
          </h2>
          <p className={`mt-5 max-w-xl ${lead}`}>
            Your furnished room, meals, WiFi, housekeeping, laundry and utilities come in one monthly rent, with taxes and charges included. No bills to split and no cooking.
          </p>
          <ul className="mt-7 grid max-w-xl grid-cols-2 gap-3 md:mt-8">
            {[
              ["One payment a month", "per person, all in"],
              ["Zero deposit option", "or two months' rent"],
            ].map(([title, note]) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-on-blue">
                  <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold leading-5 text-ink md:text-[16px]">{title}</span>
                  <span className="block text-[14px] text-ink-2 md:text-[15px]">{note}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden flex-wrap items-center gap-x-8 gap-y-4 md:mt-10 md:flex">
            <Link href="/find-my-home" className={button.primary}>
              Find my home
            </Link>
            <ArrowLink href="/properties">See all homes</ArrowLink>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[470px]">
          <Splash className="absolute -bottom-10 -left-10 h-36 w-36 -rotate-12 md:-bottom-16 md:-left-24 md:h-60 md:w-60" />
          <div className="relative rotate-[1deg] rounded-2xl bg-surface p-5 shadow-lg md:rotate-[1.5deg] md:p-9"> 
            <div className="pr-20">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">Your monthly rent</p>
              <p className="mt-1 font-display text-[22px] font-bold tracking-[-0.02em] text-ink">Everything included</p>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-1 md:mt-6 md:block md:space-y-1">
              {included.map((i) => (
                <li key={i.label} className="flex items-center justify-between gap-2 rounded-lg py-1.5 transition-colors hover:bg-mist md:gap-4 md:px-1 md:py-2">
                  <span className="flex min-w-0 items-center gap-2.5 text-[14px] font-medium leading-[18px] text-ink md:gap-3 md:text-[16px]">
                    <span className="pebble grid h-8 w-8 shrink-0 place-items-center bg-blue-50 text-ink md:h-9 md:w-9">
                      <i.icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    {i.label}
                  </span>
                  <span className="hidden shrink-0 items-center gap-1.5 text-[13.5px] font-semibold text-blue-ink md:inline-flex">
                    <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} />
                    <span>Included</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-end justify-between gap-4 rounded-xl bg-mist px-4 py-3.5 md:mt-6 md:px-5 md:py-4">
              <span className="text-[14px] leading-5 text-ink-2">
                From, per person
                <br />a month
              </span>
              <span className="tabular font-display text-[30px] font-extrabold leading-none tracking-[-0.02em] text-ink md:text-[36px]">{inr(prices.twinFrom)}</span>
            </div>
          </div>
          <Stamp id="stamp-rent" text="ALL-INCLUSIVE RENT · SINCE 2016 · " className="absolute -right-3 -top-10 h-24 w-24 md:-right-12 md:-top-14 md:h-32 md:w-32" />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- who lives here */

type Persona = {
  tag: string;
  icon: LucideIcon;
  title: string;
  body: string;
  rooms: RoomKind[];
  photo: PhotoType;
  href: string;
};

const personas: Persona[] = [
  {
    tag: "Tech professionals",
    icon: Laptop,
    title: "Close to your tech park.",
    body: "Homes near ITPL, Bagmane, Manyata and EPIP Zone, with meals and WiFi in the rent.",
    rooms: ["private", "studio"],
    photo: photos.wfhLawn,
    href: "/find-my-home?step=where",
  },
  {
    tag: "Couples",
    icon: Heart,
    title: "Room for two.",
    body: "Studios come with twin beds or a double bed and a dry kitchenette. Choose “A couple” when you book.",
    rooms: ["studio"],
    photo: photos.swingChairs,
    href: "/find-my-home?room=studio",
  },
  {
    tag: "Friends moving together",
    icon: Users,
    title: "Split the room, not the bills.",
    body: "Share a twin room. Meals, WiFi, housekeeping and laundry are already in the rent.",
    rooms: ["twin"],
    photo: photos.partyFriends,
    href: "/find-my-home?room=twin",
  },
  {
    tag: "Students",
    icon: GraduationCap,
    title: "Study, eat, repeat.",
    body: "A furnished room, meals and fast WiFi, with quiet places to work away from your bed.",
    rooms: ["twin", "private"],
    photo: photos.loungeBright,
    href: "/find-my-home?step=budget",
  },
  {
    tag: "Interns",
    icon: BriefcaseBusiness,
    title: "Three months? Perfect.",
    body: "Stays start at three months, so an internship fits. Everything you need is already in the room.",
    rooms: ["twin", "private"],
    photo: photos.partyProps,
    href: "/find-my-home?step=stay",
  },
  {
    tag: "New to Bangalore",
    icon: Plane,
    title: "Arrive to a home.",
    body: "See your room on a video call before you move, then land in a furnished room with meals from day one.",
    rooms: ["twin", "private", "studio"],
    photo: photos.homeSign,
    href: "/find-my-home",
  },
];

// The people who live at FF21, and the rooms that suit each of them.
export function WhoLivesHere() {
  return (
    <section id="who" aria-labelledby="who-title" className={`scroll-mt-24 bg-mist ${sectionY}`}>
      <div className={container}>
        <SectionHeader
          id="who-title"
          eyebrow="Who lives here"
          title={
            <>
              Techies, couples, friends and <Accent>first-timers</Accent>.
            </>
          }
          lead="FF21 is home to people starting out in Bangalore. Find yourself below, and the rooms that suit you."
          action={<ArrowLink href="/find-my-home">Find my home</ArrowLink>}
        />
      </div>
      <ul className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 md:mx-auto md:mt-14 md:grid md:max-w-[1440px] md:grid-cols-2 md:gap-5 md:overflow-visible md:px-10 lg:grid-cols-3 xl:px-20">
        {personas.map((p) => (
          <li key={p.tag} className="w-[82vw] shrink-0 snap-start sm:w-[60vw] md:w-auto">
            <Link href={p.href} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-ink">
              <span className="reveal-img absolute inset-0 block">
                <Image src={p.photo.id} alt={p.photo.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 82vw" className="object-cover transition-transform duration-[900ms] ease-[var(--ease-standard)] group-hover:scale-105" />
              </span>
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgb(12_24_26/0.9)] via-[rgb(12_24_26/0.25)] to-[rgb(12_24_26/0.05)]" />
              <Tag icon={p.icon} tone="light" className="absolute left-5 top-5">
                {p.tag}
              </Tag>
              <span className="absolute right-5 top-5 grid h-10 w-10 translate-y-1 place-items-center rounded-full bg-blue text-on-blue opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight aria-hidden className="h-5 w-5" />
              </span>
              <span className="absolute inset-x-5 bottom-5 md:inset-x-6 md:bottom-6">
                <span className="block font-display text-[28px] font-bold leading-8 tracking-[-0.025em] text-white md:text-[30px] md:leading-9">{p.title}</span>
                <span className="mt-2 block text-[15px] leading-6 text-white/85">{p.body}</span>
                <span className="mt-4 flex flex-wrap gap-1.5">
                  {p.rooms.map((k) => (
                    <Tag key={k} icon={roomIcons[k]} tone="glass" size="sm">
                      {roomKindLabels[k]}
                    </Tag>
                  ))}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- full-screen photo */

// A whole screen of one photo, drifting slowly behind a single line.
export function PhotoMoment({ photo, eyebrow, title, body }: { photo: PhotoType; eyebrow: string; title: React.ReactNode; body: string }) {
  return (
    <section aria-label={eyebrow} className="relative h-[78svh] min-h-[520px] overflow-hidden bg-ink md:h-[100svh] md:min-h-[620px]">
      <div className="moment-media absolute inset-0">
        <Image src={photo.id} alt={photo.alt} fill sizes="100vw" quality={85} className="object-cover" />
      </div>
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgb(12_24_26/0.85)] via-[rgb(12_24_26/0.15)] to-[rgb(12_24_26/0.25)]" />
      <div className={`${container} relative flex h-full flex-col justify-end pb-24 md:pb-28`}>
        <Eyebrow tone="light">{eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-5xl text-[46px] font-extrabold leading-[48px] tracking-[-0.035em] text-white md:text-[88px] md:leading-[88px]">{title}</h2>
        <p className="mt-6 max-w-lg text-[17px] leading-[28px] text-white/85 md:text-[19px] md:leading-[31px]">{body}</p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- find my home */

const marqueePlaces = ["ITPL", "EPIP Zone", "Bagmane Tech Park", "Manyata Tech Park", "Ecospace", "Embassy Tech Village", "Whitefield", "Marathahalli", "Bellandur", "Koramangala", "HSR Layout", "Sarjapur Road", "Phoenix Marketcity", "Brookefield"];

// The one loud moment: a full-bleed FF21-blue band with a glimpse of the flow,
// and the workplaces the homes are close to drifting along its foot.
export function FindHomeBand() {
  const row = [...marqueePlaces, ...marqueePlaces];
  return (
    <section aria-labelledby="find-title" className="relative overflow-hidden bg-blue">
      <span aria-hidden className="pebble absolute -right-40 -top-40 h-[520px] w-[560px] bg-white/15" />
      <span aria-hidden className="pebble absolute -bottom-48 left-[38%] h-[360px] w-[380px] bg-white/10" />
      <div className={`${container} relative grid items-center gap-16 pb-16 pt-20 md:pb-20 md:pt-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20`}>
        <div>
          <Eyebrow tone="onBlue">Find my home</Eyebrow>
          <h2 id="find-title" className="mt-5 text-[40px] font-extrabold leading-[42px] tracking-[-0.035em] text-ink md:text-[62px] md:leading-[62px]">
            Tell us where you work. We&apos;ll find your <Accent tone="onBlue">home</Accent>.
          </h2>
          <p className="mt-6 max-w-lg text-[17px] leading-[28px] text-ink md:text-[19px] md:leading-[31px]">
            Eight quick questions about your workplace, move-in date, budget and room. We match you with an FF21 home and set up a visit.
          </p>
          <ul className="mt-8 space-y-3">
            {["Homes ranked by your workplace, budget and room", "One rent with meals, WiFi, housekeeping and laundry", "Visit in person or on video, any day"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[16px] font-medium text-ink">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-ink">
                  <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link href="/find-my-home" className={`${button.onBlue} group`}>
              Find my home <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* A product shot of the first question, built from the real components */}
        <div aria-hidden className="relative mx-auto hidden w-full max-w-[480px] pb-16 md:block lg:pb-10">
          <Splash className="absolute -left-16 -top-14 h-44 w-44 rotate-12 md:-left-24 md:h-52 md:w-52" />
          <div className="relative rotate-[-2deg] rounded-2xl bg-surface p-6 shadow-lg md:p-8">
            <div className="flex items-end justify-between">
              <p className="text-ink">
                <span className="font-display text-[28px] font-bold leading-none">1</span>
                <span className="text-[14px] text-ink-3"> / 8</span>
              </p>
              <p className="text-[13px] text-ink-3">7 steps left</p>
            </div>
            <div className="mt-3 h-1 rounded-full bg-line">
              <div className="h-full w-[12.5%] rounded-full bg-blue" />
            </div>
            <p className="mt-6 font-display text-[23px] font-bold leading-7 tracking-[-0.02em] text-ink">Where do you work or study?</p>
            <div className="mt-5 grid gap-2">
              {[
                ["ITPL", "2 homes close by", true],
                ["Bagmane Tech Park", "2 homes close by", true],
                ["Manyata Tech Park", "1 home close by", false],
              ].map(([name, note, on]) => (
                <div key={name as string} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${on ? "border-blue-ink bg-blue-50 shadow-[inset_0_0_0_1px_var(--color-blue-ink)]" : "border-line-soft"}`}>
                  <span>
                    <span className="block text-[15px] font-medium text-ink">{name}</span>
                    <span className="block text-[12px] text-ink-3">{note}</span>
                  </span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border ${on ? "border-blue-ink bg-blue-ink text-white" : "border-line-soft"}`}>
                    {on && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <span className="inline-flex h-10 items-center rounded-full bg-blue px-5 text-[14px] font-semibold text-on-blue">Continue</span>
            </div>
          </div>
          <div className="absolute -bottom-2 -left-4 flex w-[290px] rotate-[3deg] items-center gap-3 rounded-xl bg-surface p-2.5 pr-4 shadow-lg md:-left-10">
            <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={photos.loungeTeal.id} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-ink">ITPL</span>
                <span className="rounded-full bg-sun px-1.5 py-0.5 text-[11px] font-bold text-ink">Best match</span>
              </span>
              <span className="block truncate text-[12px] font-medium text-blue-ink">Near ITPL · Within budget</span>
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-6 pb-10 md:pb-12">
        <p className="hidden shrink-0 pl-10 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-ink md:block xl:pl-20">Homes close to</p>
        <div className="marquee min-w-0 flex-1" aria-label="Places FF21 homes are close to">
          <ul className="marquee-track">
            {row.map((place, i) => (
              <li key={`${place}-${i}`} aria-hidden={i >= marqueePlaces.length} className="flex items-center gap-10 whitespace-nowrap font-display text-[24px] font-semibold tracking-[-0.015em] text-ink md:text-[30px]">
                {place}
                <span aria-hidden className="pebble inline-block h-3 w-3 bg-surface" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- tours */

// FF21's property tours as upright reels, like they were filmed.
export function ToursSection({ list = properties.filter((p) => p.tour) }: { list?: typeof properties }) {
  return (
    <section id="tours" aria-labelledby="tours-title" className={`${container} scroll-mt-24 ${sectionY}`}>
      <TourRail
        homes={list}
        header={
          <SectionHeader
            id="tours-title"
            eyebrow="Home tours"
            title={
              <>
                Walk through before you <Accent>visit</Accent>.
              </>
            }
            lead="Six of our homes, filmed by the FF21 team. Tap one to watch it full screen."
          />
        }
      />
    </section>
  );
}

/* ---------------------------------------------------------------- life */

const lifeTags: { label: string; icon: LucideIcon }[] = [
  { label: "Diwali", icon: Flame },
  { label: "Holi", icon: Palette },
  { label: "Christmas", icon: TreePine },
  { label: "Game rooms", icon: Gamepad2 },
  { label: "Rooftops", icon: Sunset },
  { label: "Work spots", icon: Laptop },
];

const mosaic: { photo: PhotoType; caption: string; icon: LucideIcon; className: string; pebble?: boolean }[] = [
  { photo: photos.diwali, caption: "Diwali", icon: Flame, className: "col-span-2 aspect-[16/11]" },
  { photo: photos.holi, caption: "Holi", icon: Palette, className: "aspect-[4/5]" },
  { photo: photos.christmas, caption: "Christmas", icon: TreePine, className: "aspect-[4/5] md:translate-y-12" },
  { photo: photos.poolGame, caption: "Game room", icon: Gamepad2, className: "aspect-square", pebble: true },
  { photo: photos.partyNight, caption: "Celebrations", icon: PartyPopper, className: "aspect-[4/5] md:translate-y-12" },
];

export function LifeSection() {
  // The quote about the people; the other two appear under Reviews.
  const quote = testimonials[2];
  return (
    <section id="life" aria-labelledby="life-title" className={`scroll-mt-24 bg-mist ${sectionY}`}>
      <div className={`${container} grid gap-10 md:gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20`}>
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>Life at FF21</Eyebrow>
          <h2 id="life-title" className={`mt-5 ${sectionTitle}`}>
            You come for the room. You stay for the <Accent>people</Accent>.
          </h2>
          <p className={`mt-5 max-w-md ${lead}`}>
            Festivals, game rooms and a rooftop to end the day on. Residents also get the FF21 app, with community spaces, collabs and offers.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2 md:mt-8">
            {lifeTags.map((t) => (
              <li key={t.label}>
                <Tag icon={t.icon}>{t.label}</Tag>
              </li>
            ))}
          </ul>
          <figure className="mt-10 hidden rounded-2xl bg-surface p-6 shadow-sm md:block md:p-7">
            <blockquote className="font-serif text-[22px] leading-[30px] text-ink">“{quote.quote}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span aria-hidden className="pebble grid h-10 w-10 place-items-center bg-blue-100 text-[15px] font-bold text-blue-ink">
                {quote.name.charAt(0)}
              </span>
              <span className="text-[15px] font-semibold text-ink">
                {quote.name} <span className="font-normal text-ink-3">· FF21 resident</span>
              </span>
            </figcaption>
          </figure>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-5 md:pb-12">
          {mosaic.map((m) => (
            <figure key={m.caption} className={`group relative ${m.className}`}>
              <span className={`absolute inset-0 overflow-hidden bg-surface ${m.pebble ? "pebble" : "rounded-2xl"}`}>
                <span className="reveal-img absolute inset-0 block">
                  <Image src={m.photo.id} alt={m.photo.alt} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover transition-transform duration-[900ms] ease-[var(--ease-standard)] group-hover:scale-105" />
                </span>
              </span>
              <figcaption className={`absolute ${m.pebble ? "bottom-[12%] left-1/2 -translate-x-1/2" : "bottom-3 left-3"}`}>
                <Tag icon={m.icon} tone="light" size="sm">
                  {m.caption}
                </Tag>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- inside every home */

const bentoPhotos: Record<string, PhotoType> = {
  meals: photos.diningHall,
  play: photos.poolLibrary,
};

// Inside every home, as a bento: two photo tiles carry the feeling, icon
// tiles carry the facts.
export function AmenitiesBento() {
  const iconTiles = amenities.filter((a) => !bentoPhotos[a.icon]);
  const photoTile = (key: "meals" | "play", className: string) => {
    const a = amenities.find((x) => x.icon === key)!;
    const ph = bentoPhotos[key];
    const Icon = amenityIcons[key];
    return (
      <div className={`group relative overflow-hidden rounded-2xl bg-ink ${className}`}>
        <span className="reveal-img absolute inset-0 block">
          <Image src={ph.id} alt={ph.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[900ms] ease-[var(--ease-standard)] group-hover:scale-105" />
        </span>
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgb(12_24_26/0.85)] via-[rgb(12_24_26/0.1)] to-transparent" />
        <Tag icon={Icon} tone="light" size="sm" className="absolute left-5 top-5 md:left-8 md:top-8">
          Included
        </Tag>
        <div className="absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-8">
          <h3 className="text-[24px] font-bold leading-8 tracking-[-0.025em] text-white md:text-[34px] md:leading-10">{a.title}</h3>
          <p className="mt-1.5 max-w-sm text-[15px] leading-6 text-white/85 md:mt-2 md:text-[16px] md:leading-[26px]">{a.body}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:auto-rows-[minmax(210px,auto)] md:grid-cols-4 md:gap-5">
      {photoTile("meals", "col-span-2 min-h-[260px] md:min-h-[340px] md:row-span-2")}
      {iconTiles.slice(0, 2).map((a) => (
        <IconTile key={a.title} icon={a.icon} title={a.title} body={a.body} />
      ))}
      {photoTile("play", "col-span-2 min-h-[220px] md:min-h-[280px]")}
      {iconTiles.slice(2).map((a) => (
        <IconTile key={a.title} icon={a.icon} title={a.title} body={a.body} />
      ))}
    </div>
  );
}

function IconTile({ icon, title, body }: { icon: AmenityIcon; title: string; body: string }) {
  const Icon = amenityIcons[icon];
  return (
    <div className="group flex flex-col justify-between gap-5 rounded-2xl bg-mist p-4 transition-colors duration-300 hover:bg-blue-50 md:gap-8 md:p-7">
      <span className="pebble grid h-11 w-11 place-items-center md:h-14 md:w-14 bg-surface text-ink transition-colors duration-300 group-hover:bg-blue group-hover:text-on-blue">
        <Icon aria-hidden className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.75} />
      </span>
      <div>
        <h3 className="text-[16px] font-bold leading-5 tracking-[-0.01em] text-ink md:text-[20px] md:leading-6">{title}</h3>
        <p className="mt-1.5 text-[13.5px] leading-5 text-ink-2 md:mt-2 md:text-[15px] md:leading-6">{body}</p>
      </div>
    </div>
  );
}

// A plain list for a home's own page.
export function AmenityList() {
  return (
    <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
      {amenities.map((a) => {
        const Icon = amenityIcons[a.icon];
        return (
          <li key={a.title} className="flex gap-4">
            <span className="pebble grid h-11 w-11 shrink-0 place-items-center bg-blue-50 text-ink">
              <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="font-sans text-[16px] font-semibold leading-6 text-ink">{a.title}</h3>
              <p className="text-[15px] leading-6 text-ink-2">{a.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------- moving in */

export function MovingIn() {
  return (
    <div>
      <ol className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {steps.map((s, i) => {
          const Icon = stepIcons[i];
          return (
            <li key={s.title} className="group flex gap-4 rounded-2xl bg-surface p-5 transition-shadow duration-300 hover:shadow-md sm:flex-col sm:gap-0 sm:p-6 md:p-7">
              <div className="flex shrink-0 items-center justify-between">
                <span className="pebble grid h-11 w-11 place-items-center bg-blue text-on-blue sm:h-14 sm:w-14">
                  <Icon aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
                </span>
                <span className="hidden font-display text-[44px] sm:block font-extrabold leading-none tracking-[-0.04em] text-line-soft transition-colors duration-300 group-hover:text-blue">0{i + 1}</span>
              </div>
              <div>
                <h3 className="text-[19px] font-bold leading-6 tracking-[-0.02em] text-ink sm:mt-8 sm:text-[24px] sm:leading-7">
                  <span className="mr-1.5 text-ink-3 sm:hidden">{i + 1}.</span>
                  {s.title}
                </h3>
                <p className="mt-1 text-[15px] leading-6 text-ink-2 sm:mt-2 sm:text-[16px] sm:leading-[26px]">{s.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 rounded-2xl bg-surface p-5 sm:mt-5 sm:p-7 md:p-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <h3 className="text-[22px] font-bold tracking-[-0.02em] text-ink">The fine print</h3>
          <p className="text-[15px] text-ink-3">The full terms are in the rental agreement you sign at check-in.</p>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:mt-7 sm:gap-x-10 sm:gap-y-7 lg:grid-cols-3">
          {terms.map((t) => {
            const Icon = termIcons[t.label];
            return (
              <div key={t.label} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <span className="pebble grid h-9 w-9 shrink-0 place-items-center bg-mist text-ink sm:h-11 sm:w-11">
                  <Icon aria-hidden className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <dt className="text-[13.5px] font-semibold text-ink sm:text-[14px]">{t.label}</dt>
                  <dd className="mt-0.5 text-[14px] leading-5 text-ink-2 sm:text-[16px] sm:leading-6">{t.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- reviews */

export function ReviewsFeature() {
  const [first, second] = testimonials;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <figure className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface p-6 md:p-12">
        <span aria-hidden className="pebble absolute -right-10 -top-12 h-32 w-36 bg-blue-100 md:h-40 md:w-44" />
        <span aria-hidden className="relative font-serif text-[88px] leading-[0.5] text-blue-ink md:text-[120px]">“</span>
        <blockquote className="relative mt-7 font-serif text-[25px] leading-[32px] md:mt-10 tracking-[-0.005em] text-ink md:text-[40px] md:leading-[48px]">{first.quote}</blockquote>
        <figcaption className="relative mt-10 flex items-center gap-4">
          <span aria-hidden className="pebble grid h-12 w-12 place-items-center bg-blue text-[17px] font-bold text-on-blue">{first.name.charAt(0)}</span>
          <span>
            <span className="block text-[16px] font-semibold text-ink">{first.name}</span>
            <span className="block text-[14px] text-ink-3">FF21 resident</span>
          </span>
        </figcaption>
      </figure>
      <div className="grid gap-5">
        <figure className="flex flex-col justify-between rounded-2xl bg-surface p-7 md:p-8">
          <blockquote className="font-serif text-[24px] leading-[32px] text-ink">“{second.quote}”</blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span aria-hidden className="pebble grid h-10 w-10 place-items-center bg-blue-100 text-[15px] font-bold text-blue-ink">{second.name.charAt(0)}</span>
            <span className="text-[15px] font-semibold text-ink">
              {second.name} <span className="font-normal text-ink-3">· FF21 resident</span>
            </span>
          </figcaption>
        </figure>
        <div className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-2xl bg-blue p-7 md:p-8">
          <span aria-hidden className="pebble absolute -bottom-16 -right-12 h-48 w-52 bg-white/20" />
          <p className="relative font-display text-[30px] font-extrabold leading-[34px] tracking-[-0.03em] text-ink">
            Your turn to become an <Accent tone="onBlue">FFer</Accent>.
          </p>
          <div className="relative">
            <Link href="/find-my-home" className={`${button.onBlue} group`}>
              Book a visit <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// For a home's own page: three quotes side by side.
export function Reviews() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {testimonials.map((t) => (
        <figure key={t.name} className="flex flex-col justify-between rounded-2xl bg-mist p-7">
          <blockquote className="font-serif text-[21px] leading-[29px] text-ink">“{t.quote}”</blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span aria-hidden className="pebble grid h-10 w-10 place-items-center bg-blue-100 text-[15px] font-bold text-blue-ink">{t.name.charAt(0)}</span>
            <span>
              <span className="block text-[15px] font-semibold text-ink">{t.name}</span>
              <span className="block text-[14px] text-ink-3">FF21 resident</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- questions */

export function Faq() {
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <details key={f.q} open={i === 0} className="group rounded-2xl bg-mist transition-colors duration-300 open:bg-blue-50 hover:bg-blue-50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-[17px] font-semibold text-ink md:px-7 md:text-[18px] [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-ink transition-colors duration-300 group-open:bg-blue group-open:text-on-blue">
              <Plus aria-hidden className="h-4 w-4 transition-transform duration-300 group-open:rotate-45" />
            </span>
          </summary>
          <p className="max-w-3xl px-6 pb-6 text-[16px] leading-[27px] text-ink-2 md:px-7">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- closing */

// The last screen: a full-screen photo and the two ways to come and see.
export function VisitInvite({ photo = photos.rooftopDusk }: { photo?: PhotoType }) {
  return (
    <section aria-labelledby="visit-title" className="relative h-[86svh] min-h-[560px] overflow-hidden bg-ink md:h-[100svh] md:min-h-[620px]">
      <div className="moment-media absolute inset-0">
        <Image src={photo.id} alt={photo.alt} fill sizes="100vw" quality={85} className="object-cover" />
      </div>
      <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-[rgb(12_24_26/0.82)] via-[rgb(12_24_26/0.4)] to-transparent" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgb(12_24_26/0.6)] to-transparent" />
      <div className={`${container} relative flex h-full flex-col justify-end pb-28 md:pb-28`}>
        <Eyebrow tone="light">Visits {site.visitHours}</Eyebrow>
        <h2 id="visit-title" className="mt-5 max-w-3xl text-[48px] font-extrabold leading-[50px] tracking-[-0.035em] text-white md:text-[88px] md:leading-[88px]">
          Come see it for <Accent tone="light">yourself</Accent>.
        </h2>
        <p className="mt-6 max-w-md text-[17px] leading-[28px] text-white/85 md:text-[19px] md:leading-[31px]">In person, or on a video call if you&apos;re moving from another city.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/find-my-home" className={button.primary}>
            Book a visit
          </Link>
          <TrackedLink event="whatsapp_click" params={{ placement: "visit_invite" }} href={whatsappLink("Hi FF21! I'd like to visit one of your homes.")} className={button.onMediaGlass}>
            <MessageCircle aria-hidden className="h-5 w-5" />
            WhatsApp us
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
