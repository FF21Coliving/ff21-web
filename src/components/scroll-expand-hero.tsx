"use client";

import { ArrowDown, ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Photo } from "@/lib/photos";
import { button } from "./ui";

type Tile = { photo: Photo; grow?: number };
type Props = {
  frames: Photo[];
  // The collage around the window: inner columns of two, outer columns of one.
  left: { inner: [Tile, Tile]; outer: Tile };
  right: { inner: [Tile, Tile]; outer: Tile };
  founded: number;
  from: string;
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

function CollageTile({ tile, sizes, className = "" }: { tile: Tile; sizes: string; className?: string }) {
  return (
    <div className={`xh-tile ${className}`} style={{ flexGrow: tile.grow ?? 1, flexBasis: 0 }}>
      <Image src={tile.photo.id} alt={tile.photo.alt} fill sizes={sizes} quality={80} className="object-cover" />
    </div>
  );
}

// The home page opener. It starts as a collage of FF21's common spaces and
// community around one window; scrolling slides the collage away and opens
// the window to the whole screen while the photo inside zooms out. Pure CSS
// does the drawing: this only turns scroll position into three numbers.
export function ScrollExpandHero({ frames, left, right, founded, from }: Props) {
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
      const intro = 1 - clamp(p / 0.4);
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

  const side = (s: Props["left"], dir: "l" | "r") => {
    const inner = (
      <div className="xh-col">
        <CollageTile tile={s.inner[0]} sizes="(min-width: 768px) 250px, 30vw" />
        <CollageTile tile={s.inner[1]} sizes="(min-width: 768px) 250px, 30vw" />
      </div>
    );
    const outer = (
      <div className="xh-col xh-col--outer">
        <CollageTile tile={s.outer} sizes="190px" className="max-h-[62%]" />
      </div>
    );
    return (
      <div className={`xh-side xh-side--${dir}`}>
        {dir === "l" ? (
          <>
            {outer}
            {inner}
          </>
        ) : (
          <>
            {inner}
            {outer}
          </>
        )}
      </div>
    );
  };

  return (
    <section ref={root} className="xh" data-intro="on" data-final="off" aria-label="Welcome to FF21">
      <div ref={stage} className="xh-stage">
        <div className="xh-frame">
          <div className="xh-window" aria-hidden>
            <div className="xh-zoom">
              {frames.map((photo, i) => (
                <div key={photo.id} className="film-frame absolute inset-0">
                  <Image
                    src={photo.id}
                    alt={photo.alt}
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

          {/* The introduction: a short headline over a collage of real FF21 life */}
          <div className="xh-intro">
            <div className="xh-head">
              {/* The page's one h1 says what FF21 is, for search; the brand line
                  stays the big headline. */}
              <h1 className="xh-eyebrow">
                <span aria-hidden className="door" />
                Coliving &amp; PGs in Bangalore
              </h1>
              <p className="xh-title">
                Where friends become <em className="accent">family</em>.
              </p>
            </div>
            <div className="xh-collage" aria-hidden>
              {side(left, "l")}
              {side(right, "r")}
            </div>
            <p className="xh-cue">
              Scroll to step inside
              <ArrowDown aria-hidden className="h-4 w-4" />
            </p>
          </div>

          {/* What the window opens into: the whole screen, and just the essentials */}
          <div className="xh-final">
            <div className="absolute inset-x-6 bottom-[104px] md:bottom-16 md:left-12 md:right-auto md:max-w-3xl xl:left-20">
              <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/80 md:text-[12.5px]">
                <span aria-hidden className="door" />
                FF21 Coliving · since {founded}
              </p>
              <h2 className="mt-3 text-[38px] font-extrabold leading-[40px] tracking-[-0.035em] text-white md:mt-4 md:text-[80px] md:leading-[80px]">
                Your <em className="accent">home</em> in Bangalore.
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-[23px] text-white/85 md:mt-5 md:text-[19px] md:leading-[30px]">
                Furnished rooms near the city&apos;s tech parks, with meals, WiFi and housekeeping in one rent. Starts from {from} a month.
              </p>
              <div className="mt-5 flex gap-3 md:mt-8">
                <Link href="/find-my-home" className={`${button.primary} group flex-1 md:flex-none`}>
                  Book now
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <Link href="#tours" className={`${button.onMediaGlass} flex-1 md:flex-none`}>
                  <Play aria-hidden className="h-4 w-4 fill-current" />
                  Watch tours
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
