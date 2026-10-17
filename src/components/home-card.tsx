"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
import { fromPrice, roomKindLabels, roomKinds, type Property } from "@/lib/properties";
import { inr } from "@/lib/site";
import { highlightIcons, roomIcons } from "./icons";
import { Tag } from "./tag";

type Props = { property: Property; sizes: string; eager?: boolean };

// A home at a glance: swipe through its photos, then the facts people compare.
export function HomeCard({ property: p, sizes, eager }: Props) {
  const photos = [p.hero, ...p.gallery].slice(0, 5);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const from = fromPrice(p);
  const kinds = roomKinds(p);
  const href = `/properties/${p.slug}`;

  const go = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: (index + dir) * el.clientWidth, behavior: "smooth" });
  };

  return (
    <article className="group">
      <div className="relative">
        <Link href={href} prefetch={true} tabIndex={-1} aria-hidden className="block">
          <ViewTransition name={`home-${p.slug}`} share="morph" default="none">
            <div className="relative aspect-[20/19] overflow-hidden rounded-2xl bg-mist">
              <div
                ref={scroller}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setIndex(Math.round(el.scrollLeft / el.clientWidth));
                }}
                className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
              >
                {photos.map((photo, i) => (
                  <div key={photo.id} className="relative h-full w-full shrink-0 snap-center overflow-hidden">
                    <Image
                      src={photo.id}
                      alt={i === 0 ? photo.alt : ""}
                      fill
                      sizes={sizes}
                      quality={85}
                      loading={eager && i === 0 ? "eager" : "lazy"}
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-standard)] group-hover:scale-105"
                    />
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
              className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface text-ink opacity-0 shadow-md transition-[opacity,transform] duration-300 hover:scale-105 focus-visible:opacity-100 disabled:hidden group-hover:opacity-100 md:grid"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index === photos.length - 1}
              aria-label={`Next photo of ${p.area}`}
              className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface text-ink opacity-0 shadow-md transition-[opacity,transform] duration-300 hover:scale-105 focus-visible:opacity-100 disabled:hidden group-hover:opacity-100 md:grid"
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
