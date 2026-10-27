"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

// `src` is a Wix media id such as "c1f9d0_18d1...~mv2.jpg".
// Wix resizes on the fly and serves AVIF/WebP to browsers that accept them.
// FF21's own photos live in public/photos as three WebP widths (see
// scripts/photos/build.py): "/photos/kdh-rooftop-dusk" asks for the
// smallest file at least as wide as the slot.
const ownWidths = [640, 1080, 1600];
// Blog photos, copied off Wix (see scripts/photos/build-blog.py), come in two:
// the blog's columns are at most 768 px wide.
const blogWidths = [640, 1080];

export default function wixImageLoader({ src, width, quality }: LoaderArgs) {
  if (src.startsWith("/photos/")) return `${src}-${ownWidths.find((w) => w >= width) ?? 1600}.webp`;
  if (src.startsWith("/blog-photos/")) return `${src}-${blogWidths.find((w) => w >= width) ?? 1080}.webp`;
  if (src.startsWith("/") || src.startsWith("http")) return src;
  const q = quality ?? 80;
  return `https://static.wixstatic.com/media/${src}/v1/fit/w_${width},h_${width * 2},q_${q},enc_auto/${src}`;
}
