import { Armchair, Coffee, HeartHandshake, LampFloor, Network, PartyPopper, Sparkles, Users, UtensilsCrossed, Wifi, type LucideIcon } from "lucide-react";
import { Accent, Eyebrow } from "./sections";
import { Splash } from "./splash";
import { container, lead, sectionTitle, sectionY } from "./ui";

type Prop = { icon: LucideIcon; title: string; body: string };

// FF21's value props, as named by the team (18 Oct 2026): what the rent takes
// care of, and what living with people gives you.
const functional: Prop[] = [
  { icon: LampFloor, title: "Aesthetic Rooms", body: "Designed, furnished rooms you'll want to come home to." },
  { icon: UtensilsCrossed, title: "Food Included", body: "Home-like meals every day, in the rent." },
  { icon: Sparkles, title: "Daily Housekeeping", body: "Your room cleaned every day." },
  { icon: Wifi, title: "WiFi and Laundry", body: "Fast WiFi for work, and laundry taken care of." },
  { icon: Coffee, title: "Zero Chores", body: "No cooking, no cleaning, no bills to split." },
];

const community: Prop[] = [
  { icon: Armchair, title: "Thoughtful Spaces", body: "Lounges, rooftops and game rooms made for being together." },
  { icon: PartyPopper, title: "Curated Events", body: "Festivals, parties and weekend plans, organised for you." },
  { icon: Users, title: "Built-In Community", body: "Move in and meet your people on day one." },
  { icon: HeartHandshake, title: "Meaningful Connections", body: "Housemates who turn into friends, and family." },
  { icon: Network, title: "Endless Networking", body: "Young professionals from across the city, under one roof." },
];

function Panel({ label, title, props, className }: { label: string; title: string; props: Prop[]; className: string }) {
  return (
    <div className={`relative rounded-2xl p-6 md:p-9 ${className}`}>
      <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</p>
      <h3 className="mt-2 font-display text-[24px] font-bold leading-[30px] tracking-[-0.02em] text-ink md:text-[28px] md:leading-[34px]">{title}</h3>
      <ul className="mt-6 space-y-1 md:mt-7">
        {props.map((p) => (
          <li key={p.title} className="flex items-start gap-4 rounded-xl py-3 md:px-2">
            <span className="pebble grid h-11 w-11 shrink-0 place-items-center bg-surface text-ink">
              <p.icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[17px] font-semibold leading-6 text-ink">{p.title}</span>
              <span className="mt-0.5 block text-[15px] leading-[23px] text-ink-2">{p.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ValueProps() {
  return (
    <section id="why" aria-labelledby="why-title" className={`relative scroll-mt-24 overflow-hidden ${container} ${sectionY}`}>
      <Eyebrow>Why FF21</Eyebrow>
      <h2 id="why-title" className={`mt-5 max-w-4xl ${sectionTitle}`}>
        Life, handled. Friends, <Accent>built in</Accent>.
      </h2>
      <p className={`mt-5 max-w-2xl ${lead}`}>The everyday work of a home is taken care of, so your evenings and weekends are for the people around you.</p>
      <div className="relative mt-10 grid gap-5 md:mt-14 lg:grid-cols-2 lg:gap-6">
        <Splash className="absolute -right-8 -top-10 h-28 w-28 rotate-12 md:-right-14 md:-top-16 md:h-40 md:w-40" />
        <Panel label="The everyday" title="Everything taken care of" props={functional} className="bg-mist" />
        <Panel label="The people" title="A community from day one" props={community} className="bg-blue-50" />
      </div>
    </section>
  );
}
