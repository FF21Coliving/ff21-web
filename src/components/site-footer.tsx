import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { properties } from "@/lib/properties";
import { site, whatsappLink } from "@/lib/site";
import { included } from "./icons";
import { Accent } from "./sections";
import { Splash } from "./splash";
import { Tag } from "./tag";
import { TrackedLink } from "./tracked-link";
import { button, container } from "./ui";

const heading = "text-[12.5px] font-semibold uppercase tracking-[0.14em] text-ink-3";
// Links move and darken on hover; nothing is underlined.
const item = "inline-flex text-[15px] text-ink-2 transition-[color,transform] duration-200 hover:translate-x-0.5 hover:text-ink";

const areaPages: [string, string][] = [
  ["PG near ITPL, Whitefield", "/coliving-pgs-near-itpl"],
  ["PG in Marathahalli", "/coliving-pg-near-marathahalli"],
  ["PG in Bellandur", "/coliving-pg-near-bellandur"],
  ["PG near Bagmane Tech Park", "/coliving-pg-near-bagmane-tech-park"],
  ["PG in Mahadevapura", "/coliving-pg-near-mahadevapura"],
  ["PG in Kundanahalli", "/coliving-near-kundanahalli"],
  ["PG in Kadubeesanahalli", "/coliving-near-kadubeesanahalli"],
  ["PG near Manyata Tech Park", "/coliving-pg-near-manyata-tech-park"],
  ["PG in HBR Layout", "/coliving-pgs-near-hbr-layout"],
  ["PG in Koramangala", "/coliving-near-koramangala"],
  ["PG in Sarjapur", "/best-pg-in-sarjapur"],
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-mist">
      <span aria-hidden className="pebble absolute -right-32 -top-24 h-[420px] w-[460px] bg-blue-50" />
      <Splash className="absolute right-[30%] top-20 hidden h-20 w-20 rotate-12 lg:block" />
      <div className={`${container} relative pb-28 pt-16 md:pb-12 md:pt-28`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Image src="/brand/ff21-logo-192.png" alt="FF21" width={64} height={64} className="h-16 w-16" />
            <p className="mt-8 max-w-3xl font-display text-[48px] font-extrabold leading-[48px] tracking-[-0.035em] text-ink md:text-[88px] md:leading-[86px]">
              Welcome home, <Accent>FFer</Accent>.
            </p>
            <p className="mt-6 max-w-lg text-[17px] leading-[28px] text-ink-2">
              Coliving homes for young professionals and students in Bangalore, since {site.founded}. One rent covers your room, meals, WiFi, housekeeping and laundry.
            </p>
            <ul className="mt-4 hidden max-w-xl flex-wrap gap-2 md:flex" aria-label="Included in the rent">
              {included.slice(0, 6).map((i) => (
                <li key={i.label}>
                  <Tag icon={i.icon} size="sm">
                    {i.label}
                  </Tag>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden flex-wrap gap-3 md:flex">
            <Link href="/find-my-home" className={`${button.primary} group`}>
              Find my home <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <TrackedLink event="whatsapp_click" params={{ placement: "footer_cta" }} href={whatsappLink("Hi FF21! I'd like to know more about your homes.")} className={button.secondary}>
              <MessageCircle aria-hidden className="h-4 w-4" />
              WhatsApp us
            </TrackedLink>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 rounded-2xl bg-surface p-6 md:mt-16 md:gap-10 md:p-10 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
          <div className="col-span-2 lg:col-span-1">
            <p className={heading}>Homes in Bangalore</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {properties.map((p) => (
                <li key={p.slug}>
                  <Link href={`/properties/${p.slug}`} className={`${item} whitespace-nowrap`}>
                    {p.area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={heading}>Find a room</p>
            <ul className="mt-5 space-y-3">
              <li><Link href="/find-my-home" className={item}>Find my home</Link></li>
              <li><Link href="/properties" className={item}>All homes</Link></li>
              <li><Link href="/#included" className={item}>What&apos;s included</Link></li>
              <li><Link href="/#who" className={item}>Who lives here</Link></li>
              <li><Link href="/#tours" className={item}>Home tours</Link></li>
              <li><Link href="/#faq" className={item}>Questions</Link></li>
            </ul>
          </div>
          <div>
            <p className={heading}>FF21</p>
            <ul className="mt-5 space-y-3">
              <li><Link href="/about" className={item}>About us</Link></li>
              <li><Link href="/blog" className={item}>Blog</Link></li>
              <li><a href={site.instagram} target="_blank" rel="noopener noreferrer" className={item}>Instagram</a></li>
              <li><a href={site.facebook} target="_blank" rel="noopener noreferrer" className={item}>Facebook</a></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className={heading}>Talk to us</p>
            <ul className="mt-5 space-y-3">
              <li>
                <TrackedLink event="whatsapp_click" params={{ placement: "footer" }} href={whatsappLink("Hi FF21! I'd like to know more about your homes.")} className={item}>
                  WhatsApp {site.whatsappDisplay}
                </TrackedLink>
              </li>
              <li>
                <TrackedLink event="call_click" params={{ placement: "footer" }} href={`tel:${site.phone}`} className={item}>
                  Call {site.phoneDisplay}
                </TrackedLink>
              </li>
              <li><a href={`mailto:${site.email}`} className={item}>{site.email}</a></li>
              <li className="text-[15px] text-ink-3">Visits {site.visitHours}</li>
            </ul>
          </div>
        </div>

        {/* One page per area, so search engines (and people) can reach the area
            pages from every page; the pair pages that compete for one search
            are settled after launch (FF21 SEO Plan). */}
        <div className="mt-6 rounded-2xl bg-surface p-6 md:p-10">
          <p className={heading}>PGs and coliving by area</p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {areaPages.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className={item}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-[14px] text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>
            FF21 is owned by {site.owner} · {site.address}
          </p>
          <p className="flex gap-5">
            <Link href="/privacypolicy" className="transition-colors hover:text-ink">Privacy</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-ink">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
