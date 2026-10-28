"use client";

import { ArrowDown, ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  // Opens the window all the way (the "Scroll down" button, a sideways swipe).
  const opener = useRef<() => void>(() => {});
  // The film's later frames first show at 6, 12, 18 and 24 seconds, so their
  // photos load once the page has finished loading instead of competing with
  // the first one (about 330 KB on a phone). Their frames are there from the
  // start, so the cross-fade timing stays in step.
  const [later, setLater] = useState(false);
  useEffect(() => {
    let idle = 0;
    const go = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(() => setLater(true), { timeout: 2500 }) : window.setTimeout(() => setLater(true), 300);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

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

    // Where (in page scroll) the opening starts and ends.
    const span = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      return { top, end: top + Math.max(0, el.offsetHeight - st.offsetHeight) };
    };
    let lastY = window.scrollY;
    let goingDown = true;
    let settle = 0;
    let gliding = 0;
    // A finger on the screen or a hand on the scrollbar: never glide under it.
    let held = false;
    const glideTo = (y: number) => {
      window.clearTimeout(gliding);
      gliding = window.setTimeout(() => {
        gliding = 0;
        finish(); // in case the glide was interrupted part-way
      }, 800);
      window.scrollTo({ top: y, behavior: "smooth" });
    };
    // Finish what the visitor started: a pause part-way glides to fully open
    // (or back to the start, if they were scrolling up), so the opening never
    // sits half done and a short flick is enough (Madhvik, 28 Oct 2026).
    function finish() {
      if (reduce.matches || gliding || held) return;
      const { top, end } = span();
      const y = window.scrollY;
      if (end - top < 4 || y <= top + 2 || y >= end - 2) return;
      // Nearly open and nudged up a little: stay open rather than rewind.
      glideTo(goingDown || (y - top) / (end - top) > 0.85 ? end : top);
    }
    const hold = () => {
      held = true;
      window.clearTimeout(settle);
    };
    const release = () => {
      held = false;
      window.clearTimeout(settle);
      settle = window.setTimeout(finish, 160);
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastY) goingDown = y > lastY;
      lastY = y;
      window.clearTimeout(settle);
      settle = window.setTimeout(finish, 160);
      request();
    };
    opener.current = () => {
      const { end } = span();
      if (window.scrollY < end - 2) glideTo(end);
    };
    // People try sideways too: a sideways swipe or trackpad scroll opens it.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 12 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5) opener.current();
    };
    let tx = 0;
    let ty = 0;
    const onTouchStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - tx;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(t.clientY - ty) * 1.5) opener.current();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", request);
    reduce.addEventListener("change", request);
    st.addEventListener("wheel", onWheel, { passive: true });
    st.addEventListener("touchstart", onTouchStart, { passive: true });
    st.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("pointerdown", hold, { passive: true });
    window.addEventListener("touchstart", hold, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("touchend", release, { passive: true });
    window.addEventListener("touchcancel", release, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.clearTimeout(gliding);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", request);
      reduce.removeEventListener("change", request);
      st.removeEventListener("wheel", onWheel);
      st.removeEventListener("touchstart", onTouchStart);
      st.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("pointerdown", hold);
      window.removeEventListener("touchstart", hold);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("touchend", release);
      window.removeEventListener("touchcancel", release);
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
                  {(i === 0 || later) && (
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
                  )}
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
            <button type="button" className="xh-cue" onClick={() => opener.current()}>
              Scroll down
              <ArrowDown aria-hidden className="h-4 w-4" />
            </button>
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
                <Link href="/find-my-home" className={`${button.onMediaPrimary} group flex-1 md:flex-none`}>
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
