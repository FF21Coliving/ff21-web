import type { LucideIcon } from "lucide-react";

const tones = {
  line: "border border-line-soft bg-surface text-ink",
  mist: "bg-mist text-ink",
  light: "bg-surface text-ink shadow-sm",
  tint: "bg-blue-50 text-blue-ink",
  sun: "bg-sun text-ink",
  glass: "bg-white/15 text-white backdrop-blur-md",
  onBlue: "bg-white/40 text-ink",
};

const sizes = {
  sm: "h-7 gap-1.5 px-2.5 text-[12.5px]",
  md: "h-9 gap-2 px-3.5 text-[14px]",
  lg: "h-11 gap-2.5 px-4 text-[15px]",
};

const iconSizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-[18px] w-[18px]" };

type Props = {
  icon?: LucideIcon;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
};

// A short label with an icon: a home's highlight, a room type, a place, or
// something the rent includes. Two or three words, never a sentence.
export function Tag({ icon: Icon, tone = "line", size = "md", className = "", children }: Props) {
  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-medium ${tones[tone]} ${sizes[size]} ${className}`}>
      {Icon && <Icon aria-hidden className={`${iconSizes[size]} shrink-0`} strokeWidth={2} />}
      {children}
    </span>
  );
}
