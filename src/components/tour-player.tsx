"use client";

import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, LoaderCircle, Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fromPrice, type Property } from "@/lib/properties";
import { inr } from "@/lib/site";
import { track } from "@/lib/track";
import { highlightIcons, included } from "./icons";
import { ScrollRail } from "./scroll-rail";
import { Tag } from "./tag";
import { button } from "./ui";

type DialogProps = {
  homes: Property[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  // On a home's own page there is no "See this home" link.
  onHomePage?: boolean;
};

// FF21's tours are filmed upright on a phone, so they play in a portrait
// frame sized from the screen height. Beside it (below it on phones): the
// home, what the rent covers, and the way to book. Arrow keys move between
// tours. The YouTube player (privacy-enhanced) loads only when opened.
export function TourDialog({ homes, index, onIndex, onClose, onHomePage }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const home = index === null ? undefined : homes[index];
  const many = homes.length > 1;
  const step = (dir: 1 | -1) => {
    if (index !== null) onIndex((index + dir + homes.length) % homes.length);
  };

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (home) track("video_play", { video: home.tour, property: home.code });
  }, [home]);

  useEffect(() => {
    if (!open || !many || index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex((index + 1) % homes.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + homes.length) % homes.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, many, index, homes.length, onIndex]);

  const from = home ? fromPrice(home) : undefined;
  const Highlight = home ? highlightIcons[home.slug] : undefined;
  const round = "grid shrink-0 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/20 transition-colors hover:bg-white/25";

  return (
    <dialog ref={ref} className="tour" aria-label={home ? `FF21 ${home.code} tour, ${home.area}` : "Home tour"} onClose={onClose}>
      {home && (
        <div
          className="relative flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-3 xl:flex-row xl:gap-14 xl:px-28"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Phones: which tour, and how to move between them */}
          <div className="flex h-12 w-full max-w-[520px] items-center gap-2 text-white xl:hidden">
            {many && (
              <button type="button" onClick={() => step(-1)} aria-label="Previous tour" className={`${round} h-10 w-10`}>
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <p className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold">
              FF21 {home.code} · {home.area}
              {many && <span className="font-normal text-white/60"> · {index! + 1}/{homes.length}</span>}
            </p>
            {many && (
              <button type="button" onClick={() => step(1)} aria-label="Next tour" className={`${round} h-10 w-10`}>
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Close tour" className={`${round} h-10 w-10 bg-white text-ink ring-0 hover:bg-white/90`}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <TourStage key={home.slug} home={home} />

          {/* Larger screens: the home beside its tour */}
          <aside className="hidden w-[360px] shrink-0 text-white xl:block">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Home tour{many ? ` · ${index! + 1} of ${homes.length}` : ""}
            </p>
            <h2 className="mt-4 text-[48px] font-extrabold leading-none tracking-[-0.03em]">FF21 {home.code}</h2>
            <p className="accent mt-1 text-[34px] leading-10 text-sun">{home.area}</p>
            <p className="mt-5 text-[16px] leading-[26px] text-white/75">{home.tagline}.</p>
            <Tag icon={Highlight} tone="glass" className="mt-5">
              {home.highlight}
            </Tag>

            <div className="mt-8 rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white/60">One rent covers</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                {included.slice(0, 6).map((i) => (
                  <li key={i.label} className="flex items-center gap-2.5 text-[14.5px] text-white/90">
                    <i.icon aria-hidden className="h-4 w-4 shrink-0 text-blue" strokeWidth={2} />
                    {i.label}
                  </li>
                ))}
              </ul>
              {from && (
                <p className="mt-5 text-[15px] text-white/70">
                  From <span className="tabular font-display text-[26px] font-bold text-white">{inr(from)}</span> a month
                </p>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/find-my-home?property=${home.slug}`} className={button.primary}>
                Book now
              </Link>
              {!onHomePage && (
                <Link href={`/properties/${home.slug}`} className={button.onMediaGlass}>
                  See this home
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              )}
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${home.tour}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
            >
              Not playing? Open it on YouTube
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
          </aside>

          {/* Phones: book from the tour */}
          <div className="flex w-full max-w-[520px] gap-2 xl:hidden">
            <Link href={`/find-my-home?property=${home.slug}`} className={`${button.primary} flex-1`}>
              Book now
            </Link>
            {!onHomePage && (
              <Link href={`/properties/${home.slug}`} className={`${button.onMediaGlass} flex-1`}>
                See this home
              </Link>
            )}
          </div>

          <button type="button" onClick={onClose} aria-label="Close tour" className={`${round} absolute right-6 top-6 hidden h-12 w-12 xl:grid`}>
            <X className="h-5 w-5" />
          </button>
          {many && (
            <>
              <button type="button" onClick={() => step(-1)} aria-label="Previous tour" className={`${round} absolute left-6 top-1/2 hidden h-14 w-14 -translate-y-1/2 xl:grid`}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next tour" className={`${round} absolute right-6 top-1/2 hidden h-14 w-14 -translate-y-1/2 xl:grid`}>
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}

// The frame: the home's photo, softly blurred, until the player has loaded.
function TourStage({ home }: { home: Property }) {
  const [ready, setReady] = useState(false);
  return (
    <div className="tour-frame">
      <Image src={home.hero.id} alt="" fill sizes="480px" className="scale-110 object-cover opacity-50 blur-2xl" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="flex flex-col items-center gap-3 text-[14px] font-medium text-white/85">
            <LoaderCircle aria-hidden className="h-7 w-7 animate-spin motion-reduce:animate-none" />
            Loading the tour
          </span>
        </div>
      )}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${home.tour}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
        title={`FF21 ${home.code} tour · ${home.area}`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        onLoad={() => setReady(true)}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

// The home page's row of upright tour cards, sharing one player.
export function TourRail({ homes, header }: { homes: Property[]; header: React.ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <ScrollRail label="Home tours" header={header}>
        {homes.map((p, i) => {
          const Highlight = highlightIcons[p.slug];
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Play the FF21 ${p.code} tour, ${p.area}`}
              className="group w-[68vw] shrink-0 snap-start text-left sm:w-[250px] md:w-[272px]"
            >
              <span className="relative block aspect-[9/16] overflow-hidden rounded-2xl bg-mist">
                <Image src={p.hero.id} alt="" fill sizes="(min-width: 640px) 272px, 68vw" className="object-cover transition-transform duration-700 ease-[var(--ease-standard)] group-hover:scale-105" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgb(12_24_26/0.85)] via-[rgb(12_24_26/0.1)] to-[rgb(12_24_26/0.3)]" />
                <Tag tone="glass" size="sm" className="absolute left-4 top-4">
                  FF21 {p.code}
                </Tag>
                <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-blue group-hover:text-on-blue group-hover:ring-0">
                  <Play aria-hidden className="ml-1 h-6 w-6 fill-current" />
                </span>
                <span className="absolute inset-x-5 bottom-5">
                  <span className="block font-display text-[24px] font-bold leading-7 tracking-[-0.02em] text-white">{p.area}</span>
                  <Tag tone="glass" size="sm" icon={Highlight} className="mt-2.5">
                    {p.highlight}
                  </Tag>
                </span>
              </span>
            </button>
          );
        })}
      </ScrollRail>
      <TourDialog homes={homes} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}

// One home's tour, opened from its page.
export function TourTrigger({ home, className, children }: { home: Property; className?: string; children: React.ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <button type="button" onClick={() => setIndex(0)} className={className}>
        {children}
      </button>
      <TourDialog homes={[home]} index={index} onIndex={setIndex} onClose={() => setIndex(null)} onHomePage />
    </>
  );
}
