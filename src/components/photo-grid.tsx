"use client";

import { ChevronLeft, ChevronRight, Grid2x2, Images, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, ViewTransition } from "react";
import type { Photo } from "@/lib/photos";

type Props = { photos: Photo[]; slug: string; title: string };

// The top of a home's page: the lead photo (which the card's photo morphs
// into) beside up to four more. Any photo opens full screen, edge to edge;
// "Show all photos" opens every photo as a grid.
export function PhotoGrid({ photos, slug, title }: Props) {
  const grid = useRef<HTMLDialogElement>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [lead, ...rest] = photos;
  const side = rest.slice(0, 4);
  const layout = side.length >= 4 ? "four" : side.length >= 2 ? "two" : side.length === 1 ? "one" : "none";
  const cell = "group relative block overflow-hidden bg-mist";
  const shownCount = 1 + (layout === "two" ? Math.min(side.length, 2) : layout === "none" ? 0 : side.length);
  const [slide, setSlide] = useState(0);

  return (
    <>
      {/* Phones: swipe through the first five photos. Larger screens: the lead
          photo beside a grid of four. */}
      <div className="relative">
        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className={`no-scrollbar flex snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-hidden rounded-2xl md:grid md:gap-2 md:overflow-hidden ${layout === "none" ? "" : "md:grid-cols-2"}`}
        >
          <button type="button" onClick={() => setViewing(0)} className={`${cell} aspect-[4/3] w-full shrink-0 snap-center md:aspect-auto md:min-h-[520px]`} aria-label={`Open photo 1 of ${photos.length} full screen`}>
            <ViewTransition name={`home-${slug}`} share="morph" default="none">
              <span className="absolute inset-0 block">
                <Image src={lead.id} alt={lead.alt} fill preload fetchPriority="high" sizes="(min-width: 768px) 50vw, 100vw" quality={90} className="object-cover transition-transform duration-[900ms] ease-[var(--ease-standard)] group-hover:scale-[1.03]" />
              </span>
            </ViewTransition>
          </button>
          {layout !== "none" && (
            <div className={`contents gap-2 md:grid ${layout === "four" ? "grid-cols-2 grid-rows-2" : layout === "two" ? "grid-rows-2" : ""}`}>
              {(layout === "two" ? side.slice(0, 2) : side).map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setViewing(i + 1)}
                  className={`${cell} aspect-[4/3] w-full shrink-0 snap-center md:aspect-auto md:w-auto`}
                  aria-label={`Open photo ${i + 2} of ${photos.length} full screen`}
                >
                  <Image src={photo.id} alt={photo.alt} fill sizes="(min-width: 768px) 25vw, 100vw" quality={85} className="object-cover transition-transform duration-[900ms] ease-[var(--ease-standard)] group-hover:scale-[1.04]" />
                </button>
              ))}
            </div>
          )}
        </div>
        {shownCount > 1 && (
          <span aria-hidden className="pointer-events-none absolute left-4 top-4 rounded-full bg-[rgb(12_24_26/0.6)] px-2.5 py-1 text-[12.5px] font-semibold text-white backdrop-blur md:hidden">
            {slide + 1} / {shownCount}
          </span>
        )}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => grid.current?.showModal()}
            className="absolute bottom-4 right-4 inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-[14px] font-semibold text-ink shadow-md transition-shadow hover:shadow-lg"
          >
            <Images aria-hidden className="h-4 w-4" />
            <span className="md:hidden">All {photos.length}</span>
            <span className="hidden md:inline">Show all {photos.length} photos</span>
          </button>
        )}
      </div>

      <dialog ref={grid} className="page" aria-label={`Photos of ${title}`}>
        <div className="sticky top-0 z-10 flex h-16 items-center gap-3 bg-surface/95 px-4 shadow-sm backdrop-blur md:px-8">
          <button type="button" onClick={() => grid.current?.close()} aria-label="Close photos" className="grid h-10 w-10 place-items-center rounded-full hover:bg-mist">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-display text-[18px] font-bold tracking-[-0.015em] text-ink">{title}</p>
          <p className="ml-auto text-[14px] text-ink-3">{photos.length} photos · tap one for full screen</p>
        </div>
        <div className="mx-auto grid max-w-[1100px] gap-2 px-4 py-6 md:grid-cols-2 md:px-8 md:py-10">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setViewing(i)}
              aria-label={`Open photo ${i + 1} full screen`}
              className={`group relative overflow-hidden rounded-xl bg-mist ${i % 3 === 0 ? "aspect-[3/2] md:col-span-2" : "aspect-[4/5]"}`}
            >
              <Image src={photo.id} alt={photo.alt} fill sizes="(min-width: 768px) 1100px, 100vw" quality={90} className="object-cover transition-transform duration-[900ms] ease-[var(--ease-standard)] group-hover:scale-[1.03]" />
            </button>
          ))}
        </div>
      </dialog>

      <PhotoViewer
        photos={photos}
        title={title}
        index={viewing}
        onIndex={setViewing}
        onClose={() => setViewing(null)}
        onGrid={() => {
          if (!grid.current?.open) grid.current?.showModal();
        }}
      />
    </>
  );
}

type ViewerProps = { photos: Photo[]; title: string; index: number | null; onIndex: (i: number) => void; onClose: () => void; onGrid: () => void };

// One photo at a time, the whole screen, on near-black. Swipe on phones;
// arrows and the keyboard on larger screens.
function PhotoViewer({ photos, title, index, onIndex, onClose, onGrid }: ViewerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const open = index !== null;

  useEffect(() => {
    const d = ref.current;
    const t = track.current;
    if (!d || !t) return;
    if (open && !d.open) {
      d.showModal();
      t.scrollTo({ left: index * t.clientWidth, behavior: "instant" });
    }
    if (!open && d.open) d.close();
  }, [open, index]);

  const go = (i: number) => {
    const t = track.current;
    if (!t) return;
    const next = (i + photos.length) % photos.length;
    t.scrollTo({ left: next * t.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (!open || index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const round = "grid place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/20 transition-colors hover:bg-white/25";

  return (
    <dialog ref={ref} className="viewer" aria-label={`${title}, photo ${index === null ? 1 : index + 1} of ${photos.length}`} onClose={onClose}>
      <div
        ref={track}
        onScroll={(e) => {
          const t = e.currentTarget;
          const i = Math.round(t.scrollLeft / t.clientWidth);
          if (open && i !== index) onIndex(i);
        }}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {photos.map((photo, i) => (
          <figure key={photo.id} className="relative h-full w-full shrink-0 snap-center">
            <Image src={photo.id} alt={photo.alt} fill sizes="100vw" quality={90} loading={i === index ? "eager" : "lazy"} className="object-contain" />
          </figure>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-black/50 to-transparent p-4 md:p-6">
        <p className="pointer-events-auto text-[15px] font-semibold text-white">
          {title} <span className="font-normal text-white/60">· {index === null ? 1 : index + 1} / {photos.length}</span>
        </p>
        <div className="pointer-events-auto flex gap-2">
          <button type="button" onClick={() => { onClose(); onGrid(); }} aria-label="Show all photos" className={`${round} h-11 w-11`}>
            <Grid2x2 className="h-5 w-5" />
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className={`${round} h-11 w-11 bg-white text-ink ring-0 hover:bg-white/90`}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      {photos.length > 1 && index !== null && (
        <>
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className={`${round} absolute left-4 top-1/2 hidden h-14 w-14 -translate-y-1/2 md:grid`}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className={`${round} absolute right-4 top-1/2 hidden h-14 w-14 -translate-y-1/2 md:grid`}>
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </dialog>
  );
}
