"use client";

import { Check, Share } from "lucide-react";
import { useState } from "react";

// Uses the phone's share sheet where there is one; otherwise copies the link.
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Cancelled, or not allowed: fall back to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing else to do.
    }
  };

  return (
    <button type="button" onClick={share} className="inline-flex h-10 items-center gap-2 rounded-full border border-line-soft px-4 text-[14.5px] font-semibold text-ink transition-colors hover:border-ink">
      {copied ? <Check aria-hidden className="h-4 w-4" /> : <Share aria-hidden className="h-4 w-4" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
