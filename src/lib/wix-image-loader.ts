"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

// `src` is a Wix media id such as "c1f9d0_18d1...~mv2.jpg".
// Wix resizes on the fly and serves AVIF/WebP to browsers that accept them.
export default function wixImageLoader({ src, width, quality }: LoaderArgs) {
  if (src.startsWith("/") || src.startsWith("http")) return src;
  const q = quality ?? 80;
  return `https://static.wixstatic.com/media/${src}/v1/fit/w_${width},h_${width * 2},q_${q},enc_auto/${src}`;
}
