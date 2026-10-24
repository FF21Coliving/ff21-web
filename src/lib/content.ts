// Copy carried over from ff21.in and tightened. Facts only.
import { properties } from "./properties";
import { inr, prices, site } from "./site";

export type AmenityIcon = "meals" | "wifi" | "housekeeping" | "work" | "play" | "security" | "community" | "app";

export const amenities: { icon: AmenityIcon; title: string; body: string }[] = [
  { icon: "meals", title: "Meals included", body: "Breakfast and dinner on weekdays, in the rent." },
  { icon: "wifi", title: "High-speed WiFi", body: "Fast enough for calls, streaming and working from home." },
  { icon: "housekeeping", title: "Housekeeping and laundry", body: "Rooms cleaned and laundry done for you." },
  { icon: "work", title: "Places to work", body: "Work spots around the home, away from your bed." },
  { icon: "play", title: "Game rooms and a sky deck", body: "Places to switch off after work." },
  { icon: "security", title: "Safe around the clock", body: "CCTV and security staff, 24 hours a day." },
  { icon: "community", title: "Events and festivals", body: "Diwali, Holi, Christmas and more, together." },
  { icon: "app", title: "The FF21 app", body: "Community spaces, collabs and offers for residents." },
];

export const steps = [
  { title: "Visit", body: "Drop in any day between 9am and 8pm, or ask for a video tour." },
  { title: "Book", body: "Hold your room with a ₹6,000 booking amount and a short registration." },
  { title: "Sign", body: "Choose zero deposit with a rental guarantee, or pay two months' deposit." },
  { title: "Move in", body: "Collect your key, access card, laundry bag and WiFi details." },
];

export const testimonials = [
  {
    name: "Nithees Balaji",
    quote: "Shifting to this community living space is the best decision I have made. Now I have lots of friends, who are not just friends, they are family!",
  },
  {
    name: "Ayushi Sharma",
    quote: "Once you shift here, the place and the people never make you feel that you are away from your family.",
  },
  {
    name: "Komal Makhijani",
    quote: "The best part of FF21 is the people staying here, who make it a home away from home.",
  },
];

// Video stories from the FF21 Drive "Testimonials" folder, trimmed and
// re-encoded for the site (see StoryVideos). Names are what each resident
// says on camera; the one interviewed is not named on the clip.
export const stories = [
  { id: "ribhav", name: "Ribhav", note: "FF21 resident", quote: "We chill a lot, we party a lot, we play a lot." },
  { id: "a-year-in", name: "FFer", note: "a year at FF21", quote: "FF has been the home that I was hoping for when I moved to Bangalore." },
  { id: "vanathi", name: "Vanathi", note: "FF21 resident", quote: "It's more of a big family rather than a community." },
  { id: "two-years", name: "Siri", note: "almost two years at FF21", quote: "It's always something new to learn every day." },
];

// Twelve, in the order people ask them. Meals, genders and the resident count
// confirmed by the team on 24 Oct 2026.
export const faqs = [
  {
    q: "What's included in the rent?",
    a: "Your furnished room, breakfast and dinner on weekdays, WiFi, housekeeping, laundry, utilities and access to the common spaces. Prices include taxes and charges.",
  },
  {
    q: "How much is the rent?",
    a: `A bed in a twin room starts at ${inr(prices.twinFrom)} a month, and a pod of your own at ${inr(prices.privateFrom)}, with meals, taxes and charges included. Each home's page lists its rooms and prices.`,
  },
  {
    q: "Which meals are included?",
    a: "Breakfast and dinner, Monday to Friday, at every FF21 home. FF21 ITP and FF21 WFD serve meals on weekends too.",
  },
  {
    q: "Are FF21 homes for men, women or both?",
    a: "FF21 homes are open to all genders.",
  },
  {
    q: "Where are FF21's homes?",
    a: `${properties.length} homes across Bangalore: in Whitefield, Marathahalli, Mahadevapura, HBR Layout, Koramangala and Sarjapur, close to ITPL, EPIP Zone, Bagmane, Manyata and Ecospace.`,
  },
  {
    q: "Do I have to pay a deposit?",
    a: "You choose: zero deposit against a rental guarantee, or two months' rent as a deposit.",
  },
  {
    q: "How do I book a room?",
    a: "Visit or take a video tour, then hold your room with a ₹6,000 booking amount and a short registration. The booking amount is non-refundable.",
  },
  {
    q: "What is the minimum stay?",
    a: "Three months from your check-in date.",
  },
  {
    q: "What is the notice period?",
    a: "30 days. Final billing runs 30 days from your notice. There is a move-out charge of ₹2,999 + GST, and refunds are made within 90 working days.",
  },
  {
    q: "When can I visit?",
    a: "Any day between 9am and 8pm. If you're moving from another city, ask us for a video tour.",
  },
  {
    q: "Is it safe?",
    a: "Every home has CCTV and security staff around the clock.",
  },
  {
    q: "Who lives at FF21?",
    a: `Young working professionals and students. ${site.residents.toLocaleString("en-IN")} FFers have lived at FF21 since ${site.founded}, and counting.`,
  },
];

export const team = [
  { name: "Ajay Nemani", role: "Founder. Operations, strategy and P&L" },
  { name: "Arun Nemani", role: "Customer relations" },
  { name: "Rahul Baliga", role: "Business development and sales" },
  { name: "Shyamli Nemani", role: "Operations, technology and community" },
  { name: "Devanshi Nemani", role: "Properties, community, marketing and people" },
];
