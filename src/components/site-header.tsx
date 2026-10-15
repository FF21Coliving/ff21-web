"use client";

import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site, whatsappLink } from "@/lib/site";
import { Logo } from "./logo";
import { SearchPill } from "./search-bar";
import { TrackedLink } from "./tracked-link";
import { button } from "./ui";

const nav = [
  { href: "/properties", label: "Homes" },
  { href: "/#included", label: "What's included" },
  { href: "/#who", label: "Who lives here" },
  { href: "/#tours", label: "Tours" },
  { href: "/about", label: "About" },
];

// A white capsule that floats over everything, photos included, so it never
// fades into the page. It lifts a little more once you scroll.
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  // The home page carries the big search bar in its hero.
  const showPill = pathname !== "/";
  const close = () => setOpen(false);
  const active = (href: string) => href === pathname;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <div
        className={`pointer-events-auto mx-auto flex h-14 max-w-[1400px] items-center gap-3 rounded-full border bg-surface pl-2 pr-2 transition-[box-shadow,border-color] duration-300 md:h-16 md:pl-3 ${
          scrolled || open ? "border-line shadow-[0_10px_34px_rgb(23_43_45/0.14)]" : "border-line/70 shadow-[0_6px_24px_rgb(23_43_45/0.08)]"
        }`}
      >
        <Logo onClick={close} />

        <div className="flex min-w-0 flex-1 justify-center">{showPill && <div className="hidden min-w-0 2xl:flex"><SearchPill /></div>}</div>

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2.5 text-[14.5px] font-semibold transition-colors ${active(item.href) ? "bg-blue-50 text-blue-ink" : "text-ink hover:bg-mist"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <TrackedLink
          event="whatsapp_click"
          params={{ placement: "header" }}
          href={whatsappLink("Hi FF21! I'd like to know more about your homes.")}
          aria-label="WhatsApp FF21"
          className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors hover:border-ink sm:grid md:h-11 md:w-11"
        >
          <MessageCircle aria-hidden className="h-[18px] w-[18px]" />
        </TrackedLink>
        <Link href="/find-my-home" onClick={close} className={`${button.smallPrimary} group hidden sm:inline-flex md:h-11 md:px-5`}>
          Book a visit
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ink transition-colors hover:bg-blue-50 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="site-menu" className="pointer-events-auto fixed inset-0 -z-10 flex flex-col justify-between overflow-y-auto bg-surface px-6 pb-10 pt-[calc(var(--header-space)+16px)] lg:hidden">
          <nav aria-label="Menu" className="flex flex-col gap-1">
            {[{ href: "/find-my-home", label: "Find my home" }, ...nav].map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="rise flex items-center justify-between rounded-2xl px-4 py-4 font-display text-[28px] font-bold tracking-[-0.02em] text-ink transition-colors hover:bg-mist"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {item.label}
                <ArrowRight aria-hidden className="h-5 w-5 text-ink-3" />
              </Link>
            ))}
          </nav>
          <div className="space-y-2 px-4 pt-8 text-[15px] text-ink-2">
            <TrackedLink event="whatsapp_click" params={{ placement: "menu" }} href={whatsappLink("Hi FF21! I'd like to know more about your homes.")} className="inline-flex items-center gap-2 font-semibold text-blue-ink">
              <MessageCircle aria-hidden className="h-4 w-4" />
              WhatsApp {site.phoneDisplay}
            </TrackedLink>
            <p>Visits {site.visitHours}</p>
          </div>
        </div>
      )}
    </header>
  );
}
