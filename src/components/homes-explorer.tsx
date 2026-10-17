"use client";

import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { properties, roomKindLabels, roomKinds, zones, type RoomKind, type Zone } from "@/lib/properties";
import { HomeCard } from "./home-card";
import { roomIcons } from "./icons";
import { button, chip, chipOff, chipOn } from "./ui";

const kinds: RoomKind[] = ["twin", "private", "pod", "studio"];

// Area tabs (each with a photo of a home there) and room filters over the grid.
// On phones the home page shows the homes as a sideways row (phoneRail), so
// ten cards don't stack into ten screens.
export function HomesExplorer({ phoneRail = false }: { phoneRail?: boolean }) {
  const [zone, setZone] = useState<Zone | "all">("all");
  const [room, setRoom] = useState<RoomKind | null>(null);

  const shown = properties.filter((p) => (zone === "all" || p.zone === zone) && (!room || roomKinds(p).includes(room)));
  const zoneLabel = zones.find((z) => z.id === zone)?.label;

  const tab = (active: boolean) =>
    `flex h-14 shrink-0 items-center gap-3 rounded-full border pl-1.5 pr-5 text-[15px] font-semibold transition-colors ${
      active ? "border-blue-ink bg-blue-50 text-blue-ink" : "border-line-soft bg-surface text-ink hover:border-ink"
    }`;

  return (
    <div>
      <div role="tablist" aria-label="Areas" className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:px-0">
        <button type="button" role="tab" aria-selected={zone === "all"} onClick={() => setZone("all")} className={tab(zone === "all")}>
          <span className="pebble grid h-11 w-11 place-items-center bg-blue text-on-blue">
            <LayoutGrid aria-hidden className="h-5 w-5" />
          </span>
          All homes
        </button>
        {zones.map((z) => {
          const cover = properties.find((p) => p.zone === z.id)!.hero;
          return (
            <button key={z.id} type="button" role="tab" aria-selected={zone === z.id} onClick={() => setZone(z.id)} className={tab(zone === z.id)}>
              <span className="pebble relative h-11 w-11 bg-mist">
                <Image src={cover.id} alt="" fill sizes="44px" className="object-cover" />
              </span>
              {z.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-2" aria-label="Room type">
          {kinds.map((k) => {
            const Icon = roomIcons[k];
            return (
              <button key={k} type="button" aria-pressed={room === k} onClick={() => setRoom(room === k ? null : k)} className={`${chip} ${room === k ? chipOn : chipOff}`}>
                <Icon aria-hidden className="h-4 w-4" />
                {roomKindLabels[k]}
              </button>
            );
          })}
        </div>
        <p className="text-[15px] text-ink-2" aria-live="polite">
          <span className="font-semibold text-ink">
            {shown.length} {shown.length === 1 ? "home" : "homes"}
          </span>
          {zoneLabel ? ` in ${zoneLabel}` : " across Bangalore"}
          {room ? ` with ${roomKindLabels[room].toLowerCase()} rooms` : ""}
        </p>
      </div>

      {shown.length ? (
        <div
          className={`mt-8 md:mt-10 ${
            phoneRail
              ? "no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 lg:grid-cols-3 2xl:grid-cols-4"
              : "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3 2xl:grid-cols-4"
          }`}
        >
          {shown.map((p, i) => (
            <div key={p.slug} className={phoneRail ? "w-[80vw] shrink-0 snap-start sm:w-auto" : undefined}>
              <HomeCard property={p} eager={i < 4} sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 80vw" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl bg-mist p-10 text-center">
          <p className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink">No homes match both filters.</p>
          <button
            type="button"
            onClick={() => {
              setZone("all");
              setRoom(null);
            }}
            className={`${button.secondary} mt-5`}
          >
            Show all homes
          </button>
        </div>
      )}
    </div>
  );
}
