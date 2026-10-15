"use client";

import { track, type TrackEvent } from "@/lib/track";

type Props = React.ComponentProps<"a"> & {
  event: TrackEvent;
  params?: Record<string, string | number | undefined>;
};

// An outbound link (WhatsApp, phone, email) that records the click first.
export function TrackedLink({ event, params, onClick, ...rest }: Props) {
  const external = rest.href?.startsWith("http");
  return (
    <a
      {...rest}
      target={external ? "_blank" : rest.target}
      rel={external ? "noopener noreferrer" : rest.rel}
      onClick={(e) => {
        track(event, params);
        onClick?.(e);
      }}
    />
  );
}
