import Link from "next/link";
import { Logo } from "@/components/logo";
import { button, container } from "@/components/ui";

export default function NotFound() {
  return (
    <div className={`${container} flex min-h-dvh flex-col py-6`}>
      <Logo />
      <div className="flex flex-1 flex-col justify-center py-16">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-blue-ink">Page not found</p>
        <h1 className="mt-3 text-[40px] font-extrabold leading-[46px] tracking-[-0.025em] text-ink md:text-[56px] md:leading-[60px]">Nobody&apos;s home here.</h1>
        <p className="mt-4 max-w-md text-[17px] leading-[27px] text-ink-2">This page has moved or never existed. The homes are still where we left them.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/properties" className={button.primary}>
            See the homes
          </Link>
          <Link href="/" className={button.secondary}>
            Go to the home page
          </Link>
        </div>
      </div>
    </div>
  );
}
