"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/site";
import { TrackedLink } from "./tracked-link";

// Phones keep the two main actions within thumb reach. Home pages show their
// own booking bar instead.
export function MobileBar() {
  const pathname = usePathname();
  if (/^\/properties\/[^/]+$/.test(pathname)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-surface px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_28px_rgb(23_43_45/0.1)] md:hidden">
      <div className="flex gap-2">
        <TrackedLink
          event="whatsapp_click"
          params={{ placement: "mobile_bar", page: pathname }}
          href={whatsappLink("Hi FF21! I'd like to know more about your homes.")}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line-soft text-[15px] font-semibold text-ink"
        >
          <MessageCircle aria-hidden className="h-5 w-5" />
          WhatsApp
        </TrackedLink>
        <Link href="/find-my-home" className="flex h-12 flex-[1.4] items-center justify-center rounded-full bg-blue-ink text-[15px] font-semibold text-white">
          Find my home
        </Link>
      </div>
    </div>
  );
}
