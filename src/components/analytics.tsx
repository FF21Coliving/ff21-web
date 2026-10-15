import Script from "next/script";

// Tags are switched by NEXT_PUBLIC_TAG_MODE:
//   off    – nothing loads (local development, previews)
//   gtm    – only the GTM container loads; it fires GA4, Ads and Meta
//   direct – GA4, Google Ads and the Meta Pixel load without GTM
// Never load both, or every visit is counted twice.
const mode = process.env.NEXT_PUBLIC_TAG_MODE ?? "off";
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
const adsId = process.env.NEXT_PUBLIC_GADS_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function Analytics() {
  if (mode === "gtm" && gtmId) {
    return (
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
    );
  }

  if (mode !== "direct") return null;
  const gtagId = ga4Id ?? adsId;
  return (
    <>
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${ga4Id ? `gtag('config','${ga4Id}');` : ""}${adsId ? `gtag('config','${adsId}');` : ""}`}
          </Script>
        </>
      )}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
