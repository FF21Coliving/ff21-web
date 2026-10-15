"use client";

import { Check, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { site, whatsappLink } from "@/lib/site";
import { included } from "./icons";
import { TrackedLink } from "./tracked-link";
import { button } from "./ui";

type Props = {
  slug: string;
  code: string;
  area: string;
  from?: number;
  rooms: { name: string; kind?: string }[];
};

const moveIns = ["As soon as possible", "Next month", "In two months", "I'm flexible"];

// Sticky on the right of a home's page: the price, what it covers, and the
// way to book. Hands its answers to Find my home.
export function BookingCard({ slug, code, area, from, rooms }: Props) {
  const [moveIn, setMoveIn] = useState(moveIns[0]);
  const [room, setRoom] = useState("");

  const params = new URLSearchParams({ property: slug, movein: moveIn });
  const kind = rooms.find((r) => r.name === room)?.kind;
  if (kind) params.set("room", kind);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_14px_40px_rgb(23_43_45/0.12)]">
      <p className="text-ink">
        {from ? (
          <>
            <span className="tabular font-display text-[30px] font-extrabold tracking-[-0.02em]">₹{from.toLocaleString("en-IN")}</span>{" "}
            <span className="text-[16px] text-ink-2">a month</span>
          </>
        ) : (
          <span className="font-display text-[22px] font-bold">Prices on request</span>
        )}
      </p>
      <p className="mt-1 text-[14px] text-ink-3">Per person, all-inclusive</p>

      <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2.5 rounded-xl bg-blue-50 p-4" aria-label="Included in the rent">
        {included.slice(0, 6).map((i) => (
          <li key={i.label} className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
            <i.icon aria-hidden className="h-4 w-4 shrink-0 text-blue-ink" strokeWidth={2} />
            {i.label}
          </li>
        ))}
        <li className="col-span-2 flex items-center gap-2 text-[13.5px] font-semibold text-blue-ink">
          <Check aria-hidden className="h-4 w-4" strokeWidth={2.75} />
          Taxes and charges included
        </li>
      </ul>

      <div className="mt-5 overflow-hidden rounded-xl border border-line-strong">
        <label className="relative block border-b border-line-strong px-4 py-2.5">
          <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-ink">Move in</span>
          <select value={moveIn} onChange={(e) => setMoveIn(e.target.value)} className="w-full appearance-none bg-transparent pr-6 text-[15px] text-ink focus:outline-none">
            {moveIns.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
        </label>
        <label className="relative block px-4 py-2.5">
          <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-ink">Room</span>
          <select value={room} onChange={(e) => setRoom(e.target.value)} className="w-full appearance-none bg-transparent pr-6 text-[15px] text-ink focus:outline-none">
            <option value="">Not sure yet</option>
            {rooms.map((r) => (
              <option key={r.name}>{r.name}</option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
        </label>
      </div>

      <Link href={`/find-my-home?${params}`} className={`${button.primary} mt-4 w-full`}>
        Book a visit
      </Link>
      <TrackedLink
        event="whatsapp_click"
        params={{ placement: "booking_card", property: code }}
        href={whatsappLink(`Hi FF21! I'd like to know more about FF21 ${code} in ${area}.`)}
        className={`${button.secondary} mt-2 w-full`}
      >
        <MessageCircle aria-hidden className="h-4 w-4" />
        Ask on WhatsApp
      </TrackedLink>
      <p className="mt-4 text-center text-[14px] text-ink-3">Visits {site.visitHours}</p>
    </div>
  );
}
