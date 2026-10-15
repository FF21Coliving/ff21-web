"use client";

import { useEffect, useState } from "react";

type Item = { id: string; label: string };

// A small floating menu under the header once the photos have scrolled away.
// The section in view fills pale blue. Desktop only; phones scroll a column.
export function SectionNav({ items, watch }: { items: Item[]; watch: string }) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const target = document.getElementById(watch);
    if (!target) return;
    const show = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    show.observe(target);

    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el));
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-160px 0px -55% 0px" },
    );
    sections.forEach((s) => spy.observe(s));
    return () => {
      show.disconnect();
      spy.disconnect();
    };
  }, [items, watch]);

  return (
    <nav
      aria-label="On this page"
      className={`fixed inset-x-0 top-[calc(var(--header-space)+4px)] z-40 hidden justify-center px-6 transition-[opacity,transform] duration-300 lg:flex ${shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
    >
      <ul className="flex items-center gap-1 rounded-full border border-line bg-surface p-1.5 shadow-[0_10px_30px_rgb(23_43_45/0.12)]">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "true" : undefined}
              className={`flex h-10 items-center rounded-full px-4 text-[14px] font-semibold transition-colors ${active === i.id ? "bg-blue-50 text-blue-ink" : "text-ink-2 hover:bg-mist hover:text-ink"}`}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
