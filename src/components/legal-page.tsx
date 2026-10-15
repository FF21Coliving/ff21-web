import { container } from "./ui";

type Block = { t: string; x: string };

// Renders policy text carried over from the old site. Short lines without a
// full stop read as headings; lines starting with "-" read as list items.
export function LegalPage({ title, blocks, note }: { title: string; blocks: Block[]; note?: string }) {
  const body = blocks.slice(1);
  return (
    <article className={`${container} pb-28 pt-8 md:pb-24 md:pt-12`}>
      <h1 className="text-[34px] font-extrabold leading-[40px] tracking-[-0.025em] text-ink md:text-[44px] md:leading-[50px]">{title}</h1>
      {note && <p className="mt-3 text-[14px] text-ink-3">{note}</p>}
      <div className="mt-10 max-w-3xl space-y-4 text-[16px] leading-[27px] text-ink-2">
        {body.map((b, i) => {
          const text = b.x.trim();
          const isHeading = text.length < 90 && !/[.:;,]$/.test(text) && !text.startsWith("-") && /^[A-Z0-9]/.test(text);
          if (isHeading) {
            return (
              <h2 key={i} className="pt-6 text-[20px] font-semibold leading-7 text-ink">
                {text}
              </h2>
            );
          }
          if (text.startsWith("-")) {
            return (
              <p key={i} className="border-l-2 border-blue-100 pl-4">
                {text.replace(/^-\s*/, "")}
              </p>
            );
          }
          return (
            <p key={i} className="whitespace-pre-line">
              {text}
            </p>
          );
        })}
      </div>
    </article>
  );
}
