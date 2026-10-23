"use client";

import { useEffect } from "react";

// Adds a script once React has taken over the page: after the first photo has
// painted, without the high-priority preload next/script adds.
export function LoadScript({ src }: { src: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }, [src]);
  return null;
}
