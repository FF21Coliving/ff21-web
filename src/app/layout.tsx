import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { Bricolage_Grotesque, Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { AttributionCapture } from "@/components/attribution-capture";
import { SiteTracker } from "@/components/site-tracker";
import { ogImage, photos } from "@/lib/photos";
import { site } from "@/lib/site";
import "./globals.css";

// Headlines in Bricolage Grotesque (its optical sizes sharpen big type),
// reading text in Inter, and one accent word per headline in Instrument Serif.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap", axes: ["opsz"] });
const text = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

// Only the production site is indexed. Previews stay out of Google.
const indexable = process.env.SITE_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "FF21 Coliving | Furnished rooms with food in Bangalore",
    template: "%s | FF21 Coliving",
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    images: [{ url: ogImage(photos.rooftopSunset), width: 1200, height: 630, alt: photos.rooftopSunset.alt }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/brand/ff21-logo-192.png", apple: "/brand/ff21-logo-192.png" },
  // The same verification tags the Wix site had (20 Oct 2026), so Search
  // Console and Meta keep trusting the domain after launch.
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "DG628EbCNA7nBDS9jJr9ex_ixnd5Ij9bMslU2lDo4NY",
    other: { "facebook-domain-verification": "6jhvdw3potfqf0px1anm5sdfktq6ji" },
  },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Open connections early to the servers every page needs: Wix's image CDN
  // (blog and area photos) and, when tracking is on, Google's and Meta's tags.
  preconnect("https://static.wixstatic.com");
  if (process.env.NEXT_PUBLIC_TAG_MODE === "direct") {
    preconnect("https://www.googletagmanager.com");
    preconnect("https://connect.facebook.net");
  }
  return (
    <html lang="en-IN" className={`${display.variable} ${text.variable} ${serif.variable}`}>
      <body className="min-h-dvh bg-surface text-ink">
        {children}
        <AttributionCapture />
        <SiteTracker />
        <Analytics />
      </body>
    </html>
  );
}
