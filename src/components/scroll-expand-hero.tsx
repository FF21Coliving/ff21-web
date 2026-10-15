"use client";

import { ArrowDown, CalendarHeart, IndianRupee, Play, ReceiptIndianRupee, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Photo } from "@/lib/photos";
import { included } from "./icons";
import { SearchBar } from "./search-bar";
import { Splash, Stamp } from "./splash";
import { Tag } from "./tag";
import { button } from "./ui";

type Props = { frames: Photo[]; homes: number; from: string };

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

// What the hero lists as in the rent: the five things people ask about.
const inRent = included.filter((i) => ["Meals", "WiFi", "Housekeeping", "Laundry", "Utilities"].includes(i.label));

// The home page opener. It starts as a short introduction on white around a
// small window of the photo film; scrolling opens the window to the whole
// screen, edge to edge, while the photo inside zooms out and the words part.
// Pure CSS does the drawing: this only turns scroll position into three numbers.
export function ScrollExpandHero({ frames, homes, from }: Props) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const apply = (p: number) => {
      const e = smooth(clamp(p / 0.78));
      const intro = 1 - clamp(p / 0.35);
      const fin = smooth(clamp((p - 0.6) / 0.3));
      el.style.setProperty("--e", e.toFixed(4));
      el.style.setProperty("--i", intro.toFixed(4));
      el.style.setProperty("--f", fin.toFixed(4));
      el.dataset.intro = intro > 0.01 ? "on" : "off";
      el.dataset.final = fin > 0.01 ? "on" : "off";
    };

    const update = () => {
      frame = 0;
      if (reduce.matches) {
        el.dataset.reduced = "true";
        apply(1);
        return;
      }
      delete el.dataset.reduced;
      const distance = el.offsetHeight - st.offsetHeight;
      apply(distance > 0 ? clamp(-el.getBoundingClientRect().top / distance) : 1);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    reduce.addEventListener("change", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      reduce.removeEventListener("change", request);
    };
  }, []);

  return (
    <section ref={root} className="xh" data-intro="on" data-final="off" aria-label="Welcome to FF21">
      <div ref={stage} className="xh-stage">
        <div className="xh-frame">
          {/* Peeks out from behind the window, and disappears as it opens */}
          <Splash className="xh-splash" />
          <div className="xh-window" aria-hidden>
            <div className="xh-zoom">
              {frames.map((photo, i) => (
                <div key={photo.id} className="film-frame absolute inset-0">
                  <Image
                    src={photo.id}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 220vw, 100vw"
                    quality={90}
                    preload={i === 0}
                    fetchPriority={i === 0 ? "high" : "low"}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="xh-scrim" />
          </div>

          {/* The introduction, on white around the small window */}
          <div className="xh-intro">
            <h1 className="xh-title">
              <span className="xh-eyebrow">
                <span aria-hidden className="door" />
                FF21 Coliving · Bangalore
              </span>
              <span className="xh-word xh-word--a">Ten homes,</span>{" "}
              <span className="xh-word xh-word--b">
                one <em className="accent text-blue-ink">family.</em>
              </span>
            </h1>
            <ul className="xh-facts">
              <li>
                <Tag icon={CalendarHeart}>Since 2016</Tag>
              </li>
              <li>
                <Tag icon={ReceiptIndianRupee}>All-inclusive rent</Tag>
              </li>
              <li>
                <Tag icon={Wallet}>Zero deposit option</Tag>
              </li>
              <li>
                <Tag icon={IndianRupee}>From {from.replace("₹", "")} a month</Tag>
              </li>
            </ul>
            <p className="xh-cue">
              Scroll to step inside
              <ArrowDown aria-hidden className="h-4 w-4" />
            </p>
          </div>

          {/* What the window opens into: the whole screen */}
          <div className="xh-final">
            <div className="absolute right-10 top-[calc(var(--header-space)+16px)] hidden md:block">
              <Link href="#tours" className={button.onMediaGlass}>
                <Play aria-hidden className="h-4 w-4 fill-current" />
                Watch home tours
              </Link>
            </div>
            <Stamp id="stamp-hero" text="ALL-INCLUSIVE RENT · SINCE 2016 · " className="absolute right-4 top-[calc(var(--header-space)+12px)] h-24 w-24 md:bottom-[150px] md:right-10 md:top-auto md:h-32 md:w-32" />
            <div className="absolute inset-x-6 bottom-[104px] md:bottom-[150px] md:left-12 md:right-auto md:max-w-4xl xl:left-20">
              <p className="flex items-center gap-2.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white/85">
                <span aria-hidden className="door" />
                Coliving in Bangalore since 2016
              </p>
              <h2 className="mt-4 text-[44px] font-extrabold leading-[46px] tracking-[-0.035em] text-white md:text-[84px] md:leading-[84px]">
                Where friends become <em className="accent text-white">family</em>.
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-[27px] text-white/85 md:text-[19px] md:leading-[30px]">
                Furnished rooms in {homes} homes across Bangalore, from {from} a month. One rent covers it all:
              </p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Included in the rent">
                {inRent.map((i) => (
                  <li key={i.label}>
                    <Tag icon={i.icon} tone="glass">
                      {i.label}
                    </Tag>
                  </li>
                ))}
              </ul>
              <Link href="#tours" className={`${button.onMediaGlass} mt-6 md:hidden`}>
                <Play aria-hidden className="h-4 w-4 fill-current" />
                Watch home tours
              </Link>
            </div>
            <div className="xh-search">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
