"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { stories } from "@/lib/content";
import { track } from "@/lib/track";

// Residents on video, filmed upright on a phone. Only the cover picture loads
// (about 25 KB each, and only as it scrolls near: a video's poster attribute
// would load with the page); a clip (about 2 MB, 720p) loads when tapped and
// plays with sound and captions. Files: public/videos/story-<id>.mp4|webp|vtt.
export function StoryVideos() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [started, setStarted] = useState<string | null>(null);
  const videos = useRef<Record<string, HTMLVideoElement | null>>({});

  const play = (id: string) => {
    for (const [key, v] of Object.entries(videos.current)) if (key !== id) v?.pause();
    setPlaying(id);
    void videos.current[id]?.play();
    track("video_play", { video: `story-${id}` });
  };

  return (
    <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
      {stories.map((s) => (
        <figure key={s.id} className="relative w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl bg-ink sm:w-[42%] md:w-auto">
          <video
            ref={(el) => {
              videos.current[s.id] = el;
            }}
            className="block aspect-[9/16] w-full object-cover"
            preload="none"
            playsInline
            controls={playing === s.id}
            onPlaying={() => setStarted(s.id)}
            onEnded={() => {
              setPlaying(null);
              setStarted(null);
            }}
          >
            <source src={`/videos/story-${s.id}.mp4`} type="video/mp4" />
            <track kind="captions" src={`/videos/story-${s.id}.vtt`} srcLang="en" label="English" default />
          </video>
          {/* The cover stays until the clip actually plays, so a tap never shows black. */}
          {started !== s.id && (
            <Image src={`/videos/story-${s.id}.webp`} alt="" fill unoptimized sizes="(min-width: 768px) 25vw, 70vw" className="pointer-events-none object-cover" />
          )}
          {playing !== s.id && (
            <button
              type="button"
              onClick={() => play(s.id)}
              aria-label={`Play: ${s.name}, ${s.note}`}
              className="group absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/15 to-transparent p-5 text-left text-white"
            >
              <span aria-hidden className="pebble absolute left-1/2 top-[42%] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center bg-white/90 text-ink transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-1 h-6 w-6 fill-current" />
              </span>
              <span className="font-serif text-[19px] leading-[25px]">“{s.quote}”</span>
              <span className="mt-3 text-[14px] font-semibold">
                {s.name} <span className="font-normal text-white/75">· {s.note}</span>
              </span>
            </button>
          )}
        </figure>
      ))}
    </div>
  );
}
