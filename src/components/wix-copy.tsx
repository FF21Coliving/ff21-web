import Image from "next/image";
import type { Block } from "@/lib/wix-content";

// Renders copy carried over from the Wix site. The HTML in each block was
// built from escaped text plus links, bold and italics only (see
// scripts/wix-import/), so it is safe to set as HTML.
const fileName = /\.(jpe?g|png|webp|gif)$/i;

export function WixCopy({ blocks, className = "" }: { blocks: Block[]; className?: string }) {
  return (
    <div className={`wix-copy ${className}`}>
      {blocks.map((b, i) => {
        if (b.t === "img")
          return (
            <Image
              key={i}
              src={b.id}
              alt={fileName.test(b.alt) ? "" : b.alt}
              width={1200}
              height={800}
              sizes="(min-width: 768px) 720px, 100vw"
              className="h-auto w-full rounded-xl bg-mist"
            />
          );
        if (b.t === "ul")
          return (
            <ul key={i}>
              {b.items.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
        const Tag = b.t;
        return <Tag key={i} dangerouslySetInnerHTML={{ __html: b.h }} />;
      })}
    </div>
  );
}
