"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { logClick, logView } from "@/lib/site-log";

// Logs each page view (also the ones Next.js renders without a full reload)
// and every tap on a link or button, for the dashboard's Website tab.
export function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    logView(pathname);
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("click", logClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", logClick, { capture: true });
  }, []);

  return null;
}
