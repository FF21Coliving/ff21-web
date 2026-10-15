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

const heading = "text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white/50";
// Links move and darken on hover; nothing is underlined.
const item = "inline-flex text-[15px] text-white/75 transition-[color,transform] duration-200 hover:translate-x-0.5 hover:text-white";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-night text-white">
      <span aria-hidden className="pebble absolute -right-32 -top-24 h-[420px] w-[460px] bg-white/[0.05]" />
      <Splash className="absolute right-[30%] top-20 hidden h-20 w-20 rotate-12 lg:block" />
      <div className={`${container} relative pb-28 pt-16 md:pb-12 md:pt-28`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Image src="/brand/ff21-logo-192.png" alt="FF21" width={64} height={64} className="h-16 w-16" />
            <p className="mt-8 max-w-3xl font-display text-[48px] font-extrabold leading-[48px] tracking-[-0.035em] text-white md:text-[88px] md:leading-[86px]">
              Welcome home, <Accent tone="light">FFer</Accent>.
            </p>
            <p className="mt-6 max-w-lg text-[17px] leading-[28px] text-white/75">
              Coliving homes for young professionals and students in Bangalore, since {site.founded}. One rent covers your room, meals, WiFi, housekeeping and laundry.
            </p>
            <ul className="mt-4 hidden max-w-xl flex-wrap gap-2 md:flex" aria-label="Included in the rent">
              {included.slice(0, 6).map((i) => (
                <li key={i.label}>
                  <Tag icon={i.icon} size="sm" tone="glass">
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
            <TrackedLink event="whatsapp_click" params={{ placement: "footer_cta" }} href={whatsappLink("Hi FF21! I'd like to know more about your homes.")} className={button.onMediaGlass}>
              <MessageCircle aria-hidden className="h-4 w-4" />
              WhatsApp us
            </TrackedLink>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10 md:mt-16 md:gap-10 md:p-10 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
          <div className="col-span-2 lg:col-span-1">
            <h2 className={heading}>Homes in Bangalore</h2>
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
            <h2 className={heading}>Find a room</h2>
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
            <h2 className={heading}>FF21</h2>
            <ul className="mt-5 space-y-3">
              <li><Link href="/about" className={item}>About us</Link></li>
              <li><a href={site.instagram} target="_blank" rel="noopener noreferrer" className={item}>Instagram</a></li>
              <li><a href={site.facebook} target="_blank" rel="noopener noreferrer" className={item}>Facebook</a></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h2 className={heading}>Talk to us</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <TrackedLink event="whatsapp_click" params={{ placement: "footer" }} href={whatsappLink("Hi FF21! I'd like to know more about your homes.")} className={item}>
                  WhatsApp {site.phoneDisplay}
                </TrackedLink>
              </li>
              <li>
                <TrackedLink event="call_click" params={{ placement: "footer" }} href={`tel:${site.phone}`} className={item}>
                  Call {site.phoneDisplay}
                </TrackedLink>
              </li>
              <li><a href={`mailto:${site.email}`} className={item}>{site.email}</a></li>
              <li className="text-[15px] text-white/50">Visits {site.visitHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-[14px] text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            FF21 is owned by {site.owner} · {site.address}
          </p>
          <p className="flex gap-5">
            <Link href="/privacypolicy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-white">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
