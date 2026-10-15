import type { Metadata } from "next";
import { Suspense } from "react";
import { FindMyHome } from "@/components/find-home/flow";

export const metadata: Metadata = {
  title: "Find my home",
  description: "Tell us where you work, when you'd like to move in and your budget. We'll match you with an FF21 coliving home in Bangalore and set up a visit.",
  alternates: { canonical: "/find-my-home" },
};

// The flow reads its starting point from the URL (?step=, ?property=), so it
// renders behind Suspense; the shell below shows instantly.
export default function FindMyHomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[600px] px-5 pt-28 md:px-0">
          <div className="h-1 rounded-full bg-line" />
          <p className="mt-10 text-[30px] font-bold leading-[36px] tracking-[-0.02em] text-ink md:text-[36px] md:leading-[42px]">Find my home</p>
        </div>
      }
    >
      <FindMyHome />
    </Suspense>
  );
}
