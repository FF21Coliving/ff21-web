"use client";

import { useEffect } from "react";
import { track, type TrackEvent } from "@/lib/track";

export function TrackView({ event, params }: { event: TrackEvent; params?: Record<string, string> }) {
  const key = JSON.stringify(params ?? {});
  useEffect(() => {
    track(event, JSON.parse(key));
  }, [event, key]);
  return null;
}
