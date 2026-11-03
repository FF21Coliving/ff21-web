import type { Metadata } from "next";
import { Suspense } from "react";
import { FindMyHome } from "@/components/find-home/flow";

// Where a finished Find my home lands (3 Nov 2026). The team's ad conversions
// fire on an address with "thank-you" in it, as on the Wix site, so this is a
// page of its own; it stays out of search results and the sitemap.
export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <FindMyHome thankYou />
    </Suspense>
  );
}
