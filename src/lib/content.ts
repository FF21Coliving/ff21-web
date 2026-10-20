// Copy carried over from ff21.in and tightened. Facts only.

export type AmenityIcon = "meals" | "wifi" | "housekeeping" | "work" | "play" | "security" | "community" | "app";

export const amenities: { icon: AmenityIcon; title: string; body: string }[] = [
  { icon: "meals", title: "Meals included", body: "Home-like meals every day, in the rent." },
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

export const faqs = [
  {
    q: "What's included in the rent?",
    a: "Your furnished room, meals, WiFi, housekeeping, laundry, utilities and access to the common spaces. Prices include taxes and charges.",
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
    q: "How do I move out?",
    a: "Give 30 days' notice. Final billing runs 30 days from your notice. There is a move-out charge of ₹2,999 + GST, and refunds are made within 90 working days.",
  },
  {
    q: "When can I visit?",
    a: "Any day between 9am and 8pm. If you're moving from another city, ask us for a video tour.",
  },
];

export const team = [
  { name: "Ajay Nemani", role: "Founder. Operations, strategy and P&L" },
  { name: "Arun Nemani", role: "Customer relations" },
  { name: "Rahul Baliga", role: "Business development and sales" },
  { name: "Shyamli Nemani", role: "Operations, technology and community" },
  { name: "Devanshi Nemani", role: "Properties, community, marketing and people" },
];
