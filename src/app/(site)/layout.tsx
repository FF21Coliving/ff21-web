import { MobileBar } from "@/components/mobile-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-surface focus:px-5 focus:py-3 focus:text-ink focus:shadow-lg">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="pt-[var(--header-space)]">
        {children}
      </main>
      <SiteFooter />
      <MobileBar />
    </>
  );
}
