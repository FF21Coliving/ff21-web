import Image from "next/image";

// A splash of the logo's door yellow: an organic blob with three drops.
// Decoration only, a few times a site, never behind text.
export function Splash({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" fill="currentColor" className={`pointer-events-none text-sun ${className}`}>
      <path d="M176.1 100C178 104.9 177.6 111.5 175 115.9C172.4 120.4 164.7 123.6 160.4 126.9C156.1 130.2 152.2 132.3 149.5 136C146.7 139.6 146.7 145.3 143.9 148.8C141.1 152.3 137.1 155.7 132.8 156.8C128.4 157.9 122.5 155.7 118 155.4C113.5 155 109.7 154.5 105.8 154.7C101.8 155 98 156.8 94 157C90 157.2 86.2 156.2 81.8 156C77.4 155.8 73.3 155.6 67.8 155.8C62.2 156 54.2 158.5 48.5 157.2C42.9 155.9 35.9 152.9 33.8 148.1C31.7 143.3 34.2 134.5 36.1 128.5C37.9 122.4 43.3 116.5 44.8 111.7C46.4 107 45.6 103.9 45.4 100C45.2 96.1 43.5 92 43.8 88.1C44.1 84.1 46.1 80.5 47.1 76.5C48.2 72.4 48.9 68.3 50.2 63.8C51.5 59.4 52.1 53.5 54.9 49.9C57.6 46.3 62.4 44 66.7 42.3C70.9 40.5 75.9 41.3 80.3 39.3C84.6 37.3 88.1 33.1 92.7 30.4C97.3 27.7 103.2 22.7 108.1 23.1C112.9 23.5 118.5 28.1 121.9 32.7C125.2 37.4 126.3 46.1 128.3 51C130.3 55.9 131.6 59.2 134.1 62.1C136.5 65.1 140.1 66.3 143 68.7C146 71.2 148.4 74 151.8 76.9C155.2 79.9 159.4 82.7 163.5 86.5C167.6 90.3 174.2 95.1 176.1 100Z" />
      <circle cx="186" cy="132" r="8" />
      <circle cx="13" cy="136" r="5.5" />
      <circle cx="86" cy="12" r="8.5" />
    </svg>
  );
}

// A round yellow stamp: words turning slowly around the FF21 pebble.
// `id` must be unique on the page (it names the circle the words follow).
// Callers usually place it absolutely; otherwise it sits in the flow.
export function Stamp({ id, text, className = "" }: { id: string; text: string; className?: string }) {
  const positioned = /\b(absolute|fixed|sticky)\b/.test(className);
  return (
    <div aria-hidden className={`pointer-events-none grid place-items-center ${positioned ? "" : "relative"} ${className}`}>
      <svg viewBox="0 0 120 120" className="stamp-spin absolute inset-0 h-full w-full">
        <defs>
          <path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <circle cx="60" cy="60" r="59" fill="var(--color-sun)" />
        <text fill="var(--color-ink)" fontSize="9.6" fontWeight="700" style={{ fontFamily: "var(--font-sans)" }}>
          <textPath href={`#${id}`} textLength="274" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <Image src="/brand/ff21-logo-192.png" alt="" width={96} height={96} className="relative h-[38%] w-[38%]" />
    </div>
  );
}
