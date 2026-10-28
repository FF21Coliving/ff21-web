// Shared class names from the FF21 Design Blueprint, so every button,
// heading and container looks the same. Blue fills carry charcoal labels
// (5.8:1); FF21's light teal stays the button colour (Madhvik, 28 Oct 2026).
// onMediaPrimary marks buttons over photos or dark panels. No underlines
// anywhere: links move, fill or change colour instead.
const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,box-shadow,transform,color,border-color] duration-200 ease-[var(--ease-standard)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export const button = {
  primary: `${base} h-12 px-6 text-[15px] bg-blue text-on-blue hover:bg-blue-hover hover:shadow-md`,
  onMediaPrimary: `${base} h-12 px-6 text-[15px] bg-blue text-on-blue hover:bg-blue-hover hover:shadow-md`,
  secondary: `${base} h-12 px-6 text-[15px] border border-line-soft bg-surface text-ink hover:border-ink`,
  quiet: `${base} h-12 px-5 text-[15px] text-ink hover:bg-mist`,
  onMedia: `${base} h-12 px-6 text-[15px] bg-surface text-ink hover:bg-mist`,
  onMediaGlass: `${base} h-12 px-5 text-[15px] bg-white/15 text-white backdrop-blur-md hover:bg-white/25`,
  onBlue: `${base} h-14 px-7 text-[16px] bg-surface text-ink shadow-md hover:shadow-lg`,
  smallPrimary: `${base} h-10 px-5 text-[14px] bg-blue text-on-blue hover:bg-blue-hover`,
  icon: "inline-grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink",
};

export const container = "mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-20";

// Every marketing section breathes the same amount.
export const sectionY = "py-16 md:py-28";

// Page H1s (Homes, About).
export const pageTitle = "font-display text-[40px] leading-[44px] font-extrabold tracking-[-0.035em] text-ink md:text-[64px] md:leading-[66px]";
// Marketing sections (home, about): big and confident.
export const sectionTitle = "font-display text-[34px] leading-[38px] font-extrabold tracking-[-0.03em] text-ink md:text-[52px] md:leading-[56px]";
// Sections inside a home's page: listing-sized, like a stays marketplace.
export const listingTitle = "font-display text-[22px] leading-[28px] font-bold tracking-[-0.02em] text-ink md:text-[26px] md:leading-[32px]";
// The paragraph under a headline. Inter, dark enough to read at a glance.
export const lead = "text-[17px] leading-[28px] text-ink-2 md:text-[19px] md:leading-[31px]";

export const chip =
  "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors";
export const chipOff = "border-line-soft bg-surface text-ink hover:border-ink";
export const chipOn = "border-blue-ink bg-blue-50 text-blue-ink";
