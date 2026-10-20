// Facts carried over from ff21.in (checked 15 Oct 2026). Open questions in the
// plan doc: which WhatsApp number is primary, and the owner's legal name.
export const site = {
  name: "FF21 Coliving",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ff21.in",
  description:
    "Furnished coliving rooms with food, WiFi and housekeeping across Bangalore. Zero deposit option. Visits every day, 9am to 8pm.",
  email: "sales@ff21.in",
  // Calls go to the office line; WhatsApp is a separate number.
  phone: "+918031338880",
  phoneDisplay: "+91 80313 38880",
  whatsappDisplay: "+91 93531 62534",
  whatsapp: "919353162534",
  instagram: "https://www.instagram.com/ff21_in/",
  facebook: "https://www.facebook.com/FF21INDIA",
  owner: "Sherwood Longstay Services LLP",
  address: "672, Ferns Paradise, Bangalore 560037",
  founded: 2017,
  visitHours: "9am to 8pm, every day",
  logo: "c1f9d0_adae4a63e583428c9cfe78a39927a566~mv2.png",
};

export const prices = {
  // The lowest rent across all homes (FF21 ITP), confirmed 17 Oct 2026.
  twinFrom: 12000,
  privateFrom: 14000,
  bookingAmount: 6000,
  moveOutCharge: 2999,
};

export const terms = [
  { label: "Booking amount", value: "₹6,000, non-refundable" },
  { label: "Deposit", value: "Zero deposit against a rental guarantee, or 2 months' rent" },
  { label: "Minimum stay", value: "3 months from check-in" },
  { label: "Notice to vacate", value: "30 days" },
  { label: "Move-out charge", value: "₹2,999 + GST" },
  { label: "Refunds", value: "Within 90 working days" },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

// "₹12K": short rupees for headline prices, as the team writes them.
export const inrK = (n: number) => `₹${Number((n / 1000).toFixed(2))}K`;

export function inr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
