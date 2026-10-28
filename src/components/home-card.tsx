"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
import { fromPrice, roomKindLabels, roomKinds, type Property } from "@/lib/properties";
import { inr } from "@/lib/site";
import { highlightIcons, roomIcons } from "./icons";
import { Tag } from "./tag";

// `eager`: the first photo loads straight away (cards near the top).
// `priority`: the page's main image, fetched before everything else.
// `rail`: the card sits in a sideways row on phones (the homepage), so a
// sideways swipe must move the row, not the photos: there the photos change
// with the arrows only (Madhvik, 28 Oct 2026: one swipe, one meaning).
type Props = { property: Property; sizes: string; eager?: boolean; priority?: boolean; rail?: boolean };

// A home at a glance: swipe through its photos, then the facts people compare.
// Only the first photo comes with the page; the other four load when someone
// reaches for them (hover, touch, focus, a swipe), so a page of cards doesn't
// fetch twenty photos nobody has looked at.
export function HomeCard({ property: p, sizes, eager, priority, rail }: Props) {
  const photos = [p.hero, ...p.gallery].slice(0, 5);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [more, setMore] = useState(false);
  const wake = () => setMore(true);
  const from = fromPrice(p);
  const kinds = roomKinds(p);
  const href = `/properties/${p.slug}`;

  const go = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    setMore(true);
    el.scrollTo({ left: (index + dir) * el.clientWidth, behavior: "smooth" });
  };

  return (
    <article className="group" onPointerEnter={wake} onFocus={wake}>
      <div className="relative">
        <Link href={href} prefetch={true} tabIndex={-1} aria-hidden className="block">
          <ViewTransition name={`home-${p.slug}`} share="morph" default="none">
            <div className="relative aspect-[20/19] overflow-hidden rounded-2xl bg-mist">
              <div
                ref={scroller}
                onTouchStart={wake}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setMore(true);
                  setIndex(Math.round(el.scrollLeft / el.clientWidth));
                }}
                className={`no-scrollbar flex h-full snap-x snap-mandatory ${rail ? "overflow-x-hidden sm:overflow-x-auto sm:overscroll-x-contain" : "overflow-x-auto overscroll-x-contain"}`}
              >
                {photos.map((photo, i) => (
                  <div key={photo.id} className="relative h-full w-full shrink-0 snap-center overflow-hidden">
                    {(i === 0 || more) && (
                      <Image
                        src={photo.id}
                        alt={photo.alt}
                        fill
                        sizes={sizes}
                        quality={85}
                        loading={(eager || priority) && i === 0 ? "eager" : "lazy"}
                        {...(priority && i === 0 ? { preload: true, fetchPriority: "high" as const } : {})}
                        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-standard)] group-hover:scale-105"
                      />
                    )}
                  </div>
                ))}
              </div>
              <Tag icon={highlightIcons[p.slug]} tone="light" size="sm" className="pointer-events-none absolute left-3 top-3">
                {p.highlight}
              </Tag>
              {photos.length > 1 && (
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                  {photos.map((photo, i) => (
                    <span key={photo.id} className={`h-1.5 rounded-full bg-white transition-all duration-300 ${i === index ? "w-4 opacity-100" : "w-1.5 opacity-60"}`} />
                  ))}
                </div>
              )}
            </div>
          </ViewTransition>
        </Link>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label={`Previous photo of ${p.area}`}
              className={`absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface text-ink shadow-md transition-[opacity,transform] duration-300 hover:scale-105 focus-visible:opacity-100 disabled:hidden md:grid md:opacity-0 md:group-hover:opacity-100 ${rail ? "grid opacity-90 sm:hidden sm:opacity-0" : "hidden opacity-0"}`}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index === photos.length - 1}
              aria-label={`Next photo of ${p.area}`}
              className={`absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface text-ink shadow-md transition-[opacity,transform] duration-300 hover:scale-105 focus-visible:opacity-100 disabled:hidden md:grid md:opacity-0 md:group-hover:opacity-100 ${rail ? "grid opacity-90 sm:hidden sm:opacity-0" : "hidden opacity-0"}`}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      <Link href={href} prefetch={true} className="mt-4 block">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-[20px] font-bold leading-7 tracking-[-0.02em] text-ink transition-colors group-hover:text-blue-ink">{p.area}</h3>
          <span className="shrink-0 text-[13px] font-medium text-ink-3">FF21 {p.code}</span>
        </div>
        <p className="truncate text-[15px] leading-6 text-ink-2">{p.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {kinds.length ? (
            kinds.map((k) => (
              <Tag key={k} icon={roomIcons[k]} tone="mist" size="sm">
                {roomKindLabels[k]}
              </Tag>
            ))
          ) : (
            <Tag tone="mist" size="sm">
              Rooms on request
            </Tag>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[15px] text-ink-2">
            {from ? (
              <>
                From <span className="tabular text-[17px] font-semibold text-ink">{inr(from)}</span> a month
              </>
            ) : (
              "Prices on request"
            )}
          </p>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-ink">
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.75} />
            All-inclusive
          </span>
        </div>
      </Link>
    </article>
  );
}
