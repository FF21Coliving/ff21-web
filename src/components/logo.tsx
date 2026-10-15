import Image from "next/image";
import Link from "next/link";

// The FF21 logo exactly as supplied (blue pebble, charcoal letters, yellow door).
export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} aria-label="FF21 Coliving, home" className="flex shrink-0 items-center gap-2.5">
      <Image src="/brand/ff21-logo-192.png" alt="" width={44} height={44} preload className="h-10 w-10 md:h-11 md:w-11" />
      <span className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink">Coliving</span>
    </Link>
  );
}
