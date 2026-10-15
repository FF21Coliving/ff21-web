"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

type Props = { label: string; header: React.ReactNode; children: React.ReactNode };

// A sideways, snap-scrolling row with a header. Swipe on phones; arrows on desktop.
export function ScrollRail({ label, header, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const arrow = "grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink";

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0 flex-1">{header}</div>
        <div className="hidden shrink-0 gap-2 md:flex">
          <button type="button" onClick={() => scroll(-1)} aria-label="Scroll back" className={arrow}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Scroll forward" className={arrow}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={ref} role="region" aria-label={label} tabIndex={0} className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 md:-mx-10 md:gap-5 md:scroll-px-10 md:px-10 xl:-mx-20 xl:scroll-px-20 xl:px-20">
        {children}
      </div>
    </div>
  );
}
