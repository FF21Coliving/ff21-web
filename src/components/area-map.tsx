import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { Property } from "@/lib/properties";

// A picture of the neighbourhood, not a live map: built once by
// scripts/make-maps.py from OpenStreetMap, tinted in FF21's colours, with the
// home's pin drawn on top so it stays sharp. Clicking it opens the home's
// Google Maps listing for directions.
export function AreaMap({ home }: { home: Property }) {
  return (
    <a
      href={home.maps}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open FF21 ${home.code} in Google Maps`}
      className="group relative mt-6 block aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-mist sm:aspect-[16/10]"
    >
      <Image
        src={`/maps/${home.slug}-1200.webp`}
        alt={`Map of the streets around FF21 ${home.code} in ${home.area}`}
        fill
        sizes="(min-width: 1024px) 680px, 100vw"
        className="object-cover transition-transform duration-700 ease-[var(--ease-standard)] group-hover:scale-[1.03]"
      />
      {/* The pin sits exactly at the centre: the map is built around it. */}
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <div className="flex flex-col items-center">
          <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_10px_24px_rgb(18_115_122/0.35)] ring-4 ring-blue">
            <Image src="/brand/ff21-logo-192.png" alt="" width={40} height={40} className="h-10 w-10" />
          </span>
          <span className="-mt-1 h-3 w-3 rotate-45 bg-blue" />
        </div>
      </div>
      <span aria-hidden className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-ink ring-4 ring-white/80" />
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-[13.5px] font-semibold text-ink shadow-sm backdrop-blur">
        FF21 {home.code} · {home.area}
      </span>
      <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13.5px] font-semibold text-ink shadow-md transition-colors group-hover:bg-blue group-hover:text-on-blue">
        Open in Google Maps
        <ArrowUpRight aria-hidden className="h-4 w-4" />
      </span>
      <small className="absolute bottom-2 right-2 rounded bg-white/80 px-1.5 py-0.5 text-[11px] text-ink-3">© OpenStreetMap contributors</small>
    </a>
  );
}
