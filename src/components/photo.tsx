import Image from "next/image";
import type { Photo as PhotoType } from "@/lib/photos";

type Props = {
  photo: PhotoType;
  sizes: string;
  className?: string;
  imgClassName?: string;
  preload?: boolean;
};

// Fills its box and crops to it. The box sets the size (aspect ratio or height).
export function Photo({ photo, sizes, className = "", imgClassName = "", preload }: Props) {
  // Positioned by the caller (absolute, sticky…) or relative by default, so the
  // filled image has a box to fill.
  const positioned = /\b(absolute|fixed|sticky)\b/.test(className);
  return (
    <div className={`${positioned ? "" : "relative"} overflow-hidden bg-mist ${className}`}>
      <Image
        src={photo.id}
        alt={photo.alt}
        fill
        sizes={sizes}
        preload={preload}
        fetchPriority={preload ? "high" : undefined}
        className={`object-cover ${imgClassName}`}
      />
    </div>
  );
}
