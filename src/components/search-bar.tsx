import { CalendarDays, MapPin, Search, Wallet } from "lucide-react";
import Link from "next/link";

// The search bar opens Find my home at the matching question.
const segments = [
  { step: "where", label: "Where", hint: "Work or study near", icon: MapPin },
  { step: "movein", label: "Move in", hint: "Pick a month", icon: CalendarDays },
  { step: "budget", label: "Budget", hint: "Per month, all-inclusive", icon: Wallet },
];

export function SearchBar() {
  return (
    <>
      {/* Desktop and tablet: three segments and the search button */}
      <div className="hidden items-center rounded-full border border-line bg-surface p-2 shadow-lg md:flex">
        {segments.map((s, i) => (
          <div key={s.step} className="flex min-w-0 flex-1 items-center">
            {i > 0 && <span aria-hidden className="h-8 w-px shrink-0 bg-line" />}
            <Link href={`/find-my-home?step=${s.step}`} className="group flex min-w-0 flex-1 items-center gap-3 rounded-full px-5 py-2.5 transition-colors hover:bg-mist">
              <span className="pebble grid h-10 w-10 shrink-0 place-items-center bg-blue-50 text-ink transition-colors group-hover:bg-blue">
                <s.icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-5 text-ink">{s.label}</span>
                <span className="block truncate text-[15px] leading-6 text-ink-3">{s.hint}</span>
              </span>
            </Link>
          </div>
        ))}
        <Link href="/find-my-home" className="flex h-14 shrink-0 items-center gap-2 rounded-full bg-blue-ink px-7 text-[16px] font-semibold text-white transition-colors hover:bg-blue-ink-hover">
          <Search aria-hidden className="h-5 w-5" strokeWidth={2.25} />
          Find my home
        </Link>
      </div>

      {/* Phones: one pill */}
      <Link href="/find-my-home" className="flex items-center gap-3 rounded-full border border-line bg-surface py-2.5 pl-5 pr-2.5 shadow-lg md:hidden">
        <Search aria-hidden className="h-5 w-5 shrink-0 text-ink" strokeWidth={2.25} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-5 text-ink">Find my home</span>
          <span className="block truncate text-[13px] leading-5 text-ink-3">Where · Move in · Budget</span>
        </span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-ink text-white">
          <Search aria-hidden className="h-5 w-5" strokeWidth={2.25} />
        </span>
      </Link>
    </>
  );
}

// A compact pill for the header on pages without a hero.
export function SearchPill() {
  return (
    <Link href="/find-my-home" className="flex max-w-full min-w-0 items-center gap-3 rounded-full border border-line bg-surface py-1.5 pl-5 pr-1.5 shadow-sm transition-shadow hover:shadow-md">
      <span className="truncate text-[14px] font-semibold text-ink">Anywhere in Bangalore</span>
      <span aria-hidden className="hidden h-5 w-px bg-line xl:block" />
      <span className="hidden truncate text-[14px] text-ink-3 xl:block">Any month</span>
      <span aria-hidden className="hidden h-5 w-px bg-line xl:block" />
      <span className="hidden truncate text-[14px] text-ink-3 xl:block">Any budget</span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue text-on-blue">
        <Search aria-hidden className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </Link>
  );
}
