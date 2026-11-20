"use client";

import NextLink from "next/link";
import { useState, type ComponentProps } from "react";

// Next's <Link>, but a link loads its page in the background only once
// someone shows interest in it (hover, touch or keyboard focus), not as soon
// as it scrolls into view. Prefetching every link in view was about a quarter
// of the site's Vercel requests, 7–20 a visit (20 Nov 2026). A `prefetch`
// set on a link (home cards ask for the full page) applies from that moment.
// The pattern is the one in Next's prefetching guide ("Hover-triggered
// prefetch"). Use this everywhere instead of importing next/link.
export default function Link({ prefetch, onMouseEnter, onTouchStart, onFocus, ...props }: ComponentProps<typeof NextLink>) {
  const [intent, setIntent] = useState(false);
  return (
    <NextLink
      {...props}
      prefetch={intent ? (prefetch ?? null) : false}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
    />
  );
}
