import { own, px, type Photo } from "./photos";

export type Room = {
  name: string;
  description: string;
  // Per person per month, food and taxes included, as listed on ff21.in on
  // 15 Oct 2026. Confirm before launch (open question in the plan doc).
  price?: number;
};

export type Zone = "whitefield" | "marathahalli" | "mahadevapura" | "hbr" | "koramangala" | "sarjapur";
export type RoomKind = "twin" | "private" | "pod" | "studio";

export type Property = {
  code: string;
  slug: string;
  area: string;
  zone: Zone;
  // One true, specific thing about the home, shown as the card badge.
  highlight: string;
  // FF21's own YouTube property tour, where one exists.
  tour?: string;
  tagline: string;
  nearby: string[];
  rooms: Room[];
  // The lowest rent at this home, per person per month, all-inclusive.
  // Confirmed by Madhvik on 17 Oct 2026.
  from: number;
  hero: Photo;
  gallery: Photo[];
  // The home's own Google Maps listing (looked up 17 Oct 2026).
  maps: string;
  // Exact option value in the Zoho CRM "FF21 Property" picklist.
  zohoValue: string;
  // The page on the current site, kept for the scope 2 redirect map.
  oldPath: string;
};

const twin: Room = { name: "Twin room", description: "One room, two beds. Bring a friend or meet a new one." };
const privateRoom: Room = { name: "Private room", description: "A room to yourself for calls, focus and quiet." };
const studio: Room = { name: "Studio", description: "Twin beds or a double bed, with a dry kitchenette." };
const pod: Room = { name: "Pod", description: "A compact private pod of your own." };

export const properties: Property[] = [
  {
    code: "ITP",
    from: 12000,
    slug: "itp-whitefield",
    area: "Whiterose Layout",
    zone: "whitefield",
    highlight: "Near ITPL",
    tour: "_Z9cfRDyXZw",
    tagline: "Near ITPL, EPIP Zone and Whitefield",
    nearby: ["Whitefield", "ITPL", "EPIP Zone", "AECS Layout", "Brookefield", "Hope Farm", "Nallurahalli", "Prestige Shantiniketan"],
    rooms: [
      { ...twin, price: 12000 },
      privateRoom,
      { ...studio, price: 18500 },
    ],
    hero: own("itp-lounge-fireplace", "Lounge with a fireplace, guitars and teal armchairs"),
    gallery: [
      own("itp-room-twin", "Twin room with two beds and shelves"),
      own("itp-room-private", "Private room with a bed, wardrobe and framed prints"),
      own("itp-room-loft", "Room with a loft bed above a single bed"),
      own("itp-lounge-long", "Long lounge with teal sofas and tall windows"),
      own("itp-pool-library", "Pool table beside a wall of bookshelves"),
      own("itp-work-table", "Resident working on a laptop at a wooden table"),
      own("itp-lounge-lamps", "Lounge with a teal sofa, bean bags and floor lamps"),
      own("itp-rooftop-night", "Rooftop terrace with lights at night"),
      own("itp-home-sign", "Bench with a HOME sign, cushions and plants"),
    ],
    maps: "https://www.google.com/maps/place/FF21-ITP+%7C+ITPB/@12.9804074,77.7470304,17z/data=!4m6!3m5!1s0x3bae0f673d52cc83:0x6cee8d0639170687!8m2!3d12.9804074!4d77.7470304",
    zohoValue: "FF21-ITP - ITPL/GR Tech Park/EPIP",
    oldPath: "/coliving-pgs-near-itpl",
  },
  {
    code: "WFD",
    from: 14000,
    slug: "wfd-whitefield",
    area: "Whitefield",
    zone: "whitefield",
    highlight: "50 m from ITPB Tech Park",
    tagline: "Near ITPB, EPIP Zone and Hope Farm",
    nearby: ["ITPB", "ITPL", "EPIP Zone", "Hope Farm", "Brookefield"],
    rooms: [twin, privateRoom],
    hero: own("wfd-pool-turf", "Game room with a pool table on green turf"),
    gallery: [
      own("wfd-room-twin", "Twin room with two beds and a chevron wall"),
      own("wfd-room-private", "Private room with a double bed"),
      own("wfd-table-tennis", "Table tennis on green turf"),
      own("wfd-foosball", "Foosball on green turf"),
      own("wfd-lobby", "Lobby lounge with a teal sofa and framed prints"),
      own("wfd-building-night", "The FF21 building at night"),
    ],
    maps: "https://www.google.com/maps/place/FF21+WFD+%7C+Whitefield+(Z-Hub)/@12.9843719,77.733698,17z/data=!4m6!3m5!1s0x3bae11b1a2204a27:0xb030810c3fe3477c!8m2!3d12.9843719!4d77.733698",
    zohoValue: "FF21-WFD - Whitefield (Zhub)",
    oldPath: "/whitefield-zhub",
  },
  {
    code: "KDH",
    from: 15750,
    slug: "kdh-kundanahalli",
    area: "Kundanahalli",
    zone: "marathahalli",
    highlight: "Rooftop lounge",
    tour: "PDSpCcTwBX8",
    tagline: "Near Marathahalli, Brookefield and EPIP Zone",
    nearby: ["Marathahalli", "Brookefield", "EPIP Zone", "Graphite India", "Bellandur", "Kadubeesanahalli"],
    rooms: [
      { name: "Twin and pod rooms", description: "Shared rooms and compact private pods." },
      { name: "Studio and single rooms", description: "More space, or a room to yourself." },
    ],
    hero: own("kdh-rooftop-dusk", "Rooftop garden at dusk with benches and city lights"),
    gallery: [
      own("kdh-room-twin", "Twin room with two beds and teal linen"),
      own("kdh-room-twin-window", "Twin room with two beds under a window"),
      own("kdh-room-private", 'Private room with a single bed and a large "hi" print'),
      own("kdh-rooftop-night", "Rooftop lounge at night"),
      own("kdh-lounge-posters", "Lounge with teal chairs and framed posters"),
      own("kdh-dining-lounge", "Dining and lounge area with a long wooden table"),
      own("kdh-pod-chairs", "Teal pod chairs on a wooden frame"),
    ],
    maps: "https://www.google.com/maps/place/FF21-KDH+%7C+Kundalahalli/@12.951442,77.7175013,17z/data=!4m6!3m5!1s0x3bae1378d332e8f9:0xefd5e6883fafeb92!8m2!3d12.951442!4d77.7175013",
    zohoValue: "FF21-KDH - Kundalahalli/Marathahalli",
    oldPath: "/ff21-kdh",
  },
  {
    code: "PODS",
    from: 14000,
    slug: "pods-marathahalli",
    area: "Marathahalli",
    zone: "marathahalli",
    highlight: "Reasonable private rooms",
    tour: "035a0goKxnY",
    tagline: "Near Bellandur, Ecospace and Embassy Tech Village",
    nearby: ["Ecospace", "Embassy Tech Village", "Cessna Business Park", "Bellandur", "Brigade Tech Gardens", "Kundanahalli", "Brookefield"],
    rooms: [
      twin,
      { name: "King size room", description: "A larger private room with a king size bed." },
      { name: "Single pod", description: "A private pod of your own, food included.", price: 14000 },
    ],
    hero: own("pods-lounge-view", "Sunlit lounge with long built-in seating and a city view"),
    gallery: [
      own("pods-room-twin", "Twin room with two beds and a teal wall"),
      own("pods-room-king", "Room with a king size bed and a padded teal headboard"),
      own("pods-pod", "Pod with a single bed and an abstract print"),
      own("pods-game-room", "Game room with pool, foosball and table tennis"),
      own("pods-rooftop", "Rooftop terrace with tables"),
      own("pods-garden-swing", "Garden with a swing bench and floor cushions"),
      own("pods-indoor-lawn", "Indoor lawn with lamps and a teepee"),
      own("pods-reception", "Reception with the FF21 logo"),
      own("pods-building", "The FF21 building among palm trees"),
    ],
    maps: "https://www.google.com/maps/place/FF21-PODS+%7C+Marathahalli/@12.9478046,77.7182353,17z/data=!4m6!3m5!1s0x3bae13c25f9bb447:0x200e93aa540e4bf8!8m2!3d12.9478046!4d77.7182353",
    zohoValue: "FF21-PODS - Thubarahalli / Kundanahalli",
    oldPath: "/coliving-pg-near-bellandur",
  },
  {
    code: "LIT",
    from: 17000,
    slug: "lit-thubarahalli",
    area: "Thubarahalli",
    zone: "marathahalli",
    highlight: "Indoor lawn",
    tour: "BNo3kXxTwvk",
    tagline: "Near Kadubeesanahalli, Thubarahalli and Marathahalli",
    nearby: ["Kadubeesanahalli", "Thubarahalli"],
    rooms: [
      { ...twin, price: 17000 },
      { ...studio, price: 20350 },
      { ...privateRoom, price: 31000 },
    ],
    hero: own("lit-atrium", "Indoor atrium with a lawn, bean bags and skylights"),
    gallery: [
      own("lit-lawn-firepit", "Indoor lawn with a fire pit and bean bags"),
      own("lit-lawn-chairs", "Teal chairs on the indoor lawn"),
      own("lit-window-seat", "Bookshelves around a teal window seat"),
      own("lit-room-twin", "Twin room with teal linen"),
    ],
    maps: "https://www.google.com/maps/place/FF21-LIT+%7C+Thubarahalli/@12.9537477,77.7195835,17z/data=!4m6!3m5!1s0x3bae1373c73ef51d:0x2d00f77f60799800!8m2!3d12.9537477!4d77.7195835",
    zohoValue: "FF21-LIT - Thubarahalli",
    oldPath: "/pg-in-kadubeesanahalli",
  },
  {
    code: "BGM",
    from: 15750,
    slug: "bgm-doddanekundi",
    area: "Doddanekundi",
    zone: "marathahalli",
    highlight: "Walk to Bagmane Tech Park",
    tagline: "Near Bagmane Tech Park, Marathahalli and Mahadevapura",
    nearby: ["Bagmane Tech Park", "Bagmane Constellation", "Marathahalli", "Karthik Nagar", "Yemalur", "Mahadevapura"],
    rooms: [
      { name: "Twin and studio rooms", description: "Shared rooms, or a studio with more space." },
      { name: "Single rooms", description: "A room to yourself." },
    ],
    hero: px("489126_1e7a26f8fdf049a89a7cd42b2f996f04~mv2.jpg", "Bright room with a teal accent wall"),
    gallery: [
      px("489126_bb6dd3340a59408a88b83dba1b3690c9~mv2.jpg", "Grid wall with photos and fairy lights"),
      px("489126_daf968477f964f099b34a55396c24e61~mv2.jpg", "Patterned cushions on a made bed"),
      px("489126_5da6ed1eec714615874657b2948c9150~mv2.jpg", "Black and white abstract print on a teal wall"),
    ],
    maps: "https://www.google.com/maps/place/FF21-BGM+%7C+Coliving+PG+in+Doddanekundi/@12.972923,77.6919095,17z/data=!4m6!3m5!1s0x3bae11946c63fba1:0x3b10585d742e8adf!8m2!3d12.972923!4d77.6919095",
    zohoValue: "FF21-BGM - Bagmane / Doddanekundi",
    oldPath: "/coliving-pgs-near-doddanekundi",
  },
  {
    code: "PMC",
    from: 16450,
    slug: "pmc-mahadevapura",
    area: "Mahadevapura",
    zone: "mahadevapura",
    highlight: "Metro station at 800 m",
    tour: "RgCV8wDO5Ng",
    tagline: "Near Phoenix Marketcity, Bagmane Tech Park and Whitefield Road",
    nearby: ["Phoenix Marketcity", "Bagmane Tech Park", "Mahadevapura", "Whitefield Road"],
    rooms: [
      { ...twin, price: 16450 },
      { ...privateRoom, price: 29900 },
      pod,
      { ...studio, price: 19800 },
    ],
    hero: own("pmc-rooftop-deck", "Deck chairs on a rooftop lawn at sunset"),
    gallery: [
      own("pmc-room-twin", "Twin room with two beds and shelves"),
      own("pmc-room-private", "Private room with a single bed"),
      own("pmc-studio", "Studio with a double bed and a desk"),
      own("pmc-rooftop-night", "Rooftop lawn lit up at night above the city"),
      own("pmc-dining", "Dining hall with yellow tables at night"),
      own("pmc-friend-poster", '"A friend is someone" poster above bean bags'),
    ],
    maps: "https://www.google.com/maps/place/FF21-PMC+%7C+Mahadevapura/@12.9925348,77.6955089,17z/data=!4m6!3m5!1s0x3bae1157e0bd78f5:0x75c5e5e71a9a082a!8m2!3d12.9925348!4d77.6955089",
    zohoValue: "FF21-PMC - Bagmane / Phoenix Market City",
    oldPath: "/coliving-pg-near-mahadevapura",
  },
  {
    code: "HBR",
    from: 15750,
    slug: "hbr-hennur",
    area: "HBR Layout",
    zone: "hbr",
    highlight: "3 km from Manyata Tech Park",
    tour: "hH9uidkr-nk",
    tagline: "Near Manyata Tech Park, Kalyan Nagar and Hebbal",
    nearby: ["Manyata Tech Park", "Kalyan Nagar", "Nagawara", "Hebbal", "Banaswadi", "Kammanahalli", "RMZ Infinity"],
    rooms: [
      { name: "Twin room", description: "Bunk beds or two beds side by side." },
      privateRoom,
    ],
    hero: own("hbr-dining", "Dining hall with long tables and benches"),
    gallery: [
      own("hbr-room", "Room with teal linen and floor cushions"),
      own("hbr-foosball", "Foosball and table tennis by the windows"),
      own("hbr-pool", "Residents playing pool"),
      own("hbr-lounge-swings", "Lounge with swing chairs and floor cushions"),
      own("hbr-cafe-corner", 'Café corner under a "Where friends become family" wall'),
      own("hbr-lounge-wall", 'Common room with a "Where friends become family" wall'),
    ],
    maps: "https://www.google.com/maps/place/FF21-HBR+%7C+HBR+Layout/@13.0279627,77.630975,17z/data=!4m6!3m5!1s0x3bae17cf7921e5d3:0xf6ada3488bee0dda!8m2!3d13.0279627!4d77.630975",
    zohoValue: "FF21-HBR - Manyata Tech Park",
    oldPath: "/coliving-pgs-near-hbr-layout",
  },
  {
    code: "KORA",
    from: 17300,
    slug: "kora-koramangala",
    area: "Koramangala",
    zone: "koramangala",
    highlight: "Walk to Bob's Kora",
    tagline: "Near Koramangala, HSR Layout and Indiranagar",
    nearby: ["Koramangala", "Ejipura", "HSR Layout", "BTM Layout", "Madiwala", "Domlur", "Indiranagar"],
    rooms: [
      twin,
      { name: "Studio deluxe", description: "Twin beds, a work desk and a teal feature wall." },
      { name: "Premium studio", description: "A larger studio with more storage." },
      privateRoom,
    ],
    hero: px("489126_71de0460d90d4d83bf8af43f848e76d4~mv2.jpg", "Studio deluxe with twin beds and a teal wall"),
    gallery: [
      px("489126_432061723ae546ac8165bb59bc994bb4~mv2.jpg", "Premium studio with twin beds and a wardrobe"),
      px("489126_3472b420775d42ca91ae8a5161cca48e~mv2.jpeg", "Indoor lawn with teal lounge chairs"),
      px("489126_de2b74e129014ecc90eedae631fab2d1~mv2.jpeg", "Resident working at a café table"),
    ],
    maps: "https://www.google.com/maps/place/FF21-KORA+%7C+Coliving+PG+in+Koramangala/@12.9340807,77.618472,17z/data=!4m6!3m5!1s0x3bae153d7b14b053:0x7dea05ec32a60a3b!8m2!3d12.9340807!4d77.618472",
    zohoValue: "FF21-KORA - Koramangala",
    oldPath: "/coliving-near-koramangala",
  },
  {
    code: "SJR",
    from: 17800,
    slug: "sjr-sarjapur",
    area: "Sarjapur",
    zone: "sarjapur",
    highlight: "1 km from Sarjapur Main Road",
    tagline: "Near Sarjapur Road, Kodathi and Chikkakannelli",
    nearby: ["Sarjapur Road", "Kodathi", "Chikkakannelli"],
    rooms: [twin, privateRoom, studio],
    // The current SJR page reuses the KORA photo set. Replace with SJR photos.
    hero: px("489126_432061723ae546ac8165bb59bc994bb4~mv2.jpg", "Studio with twin beds and a wardrobe"),
    gallery: [px("489126_3472b420775d42ca91ae8a5161cca48e~mv2.jpeg", "Indoor lawn with teal lounge chairs")],
    maps: "https://www.google.com/maps/place/FF21-SJR/@12.9096202,77.6810529,17z/data=!4m6!3m5!1s0x3bae13cc6c9c464f:0x21c38a09554de7e5!8m2!3d12.9096202!4d77.6810529",
    zohoValue: "FF21-SJR - Sarjapur",
    oldPath: "/best-pg-in-sarjapur",
  },
];

export function getProperty(slug: string) {
  return properties.find((p) => p.slug === slug);
}

export function fromPrice(p: Property): number | undefined {
  return p.from;
}

export const zones: { id: Zone; label: string }[] = [
  { id: "whitefield", label: "Whitefield" },
  { id: "marathahalli", label: "Marathahalli" },
  { id: "mahadevapura", label: "Mahadevapura" },
  { id: "hbr", label: "HBR Layout" },
  { id: "koramangala", label: "Koramangala" },
  { id: "sarjapur", label: "Sarjapur" },
];

export const roomKindLabels: Record<RoomKind, string> = {
  twin: "Twin",
  private: "Private",
  pod: "Pod",
  studio: "Studio",
};

// The kind of one room, read from its name ("Twin and pod rooms" counts as
// twin; roomKinds below finds every kind a home has).
export function roomKindOf(name: string): RoomKind | undefined {
  const n = name.toLowerCase();
  if (/studio/.test(n)) return "studio";
  if (/twin|double|bunk/.test(n)) return "twin";
  if (/pod/.test(n)) return "pod";
  if (/private|single|king/.test(n)) return "private";
  return undefined;
}

// Room kinds a home offers, read from its room names.
export function roomKinds(p: Property): RoomKind[] {
  const names = p.rooms.map((r) => r.name.toLowerCase()).join(" ");
  const kinds: RoomKind[] = [];
  if (/twin|double|bunk/.test(names)) kinds.push("twin");
  if (/private|single room|single studio|king/.test(names)) kinds.push("private");
  if (/pod/.test(names)) kinds.push("pod");
  if (/studio/.test(names)) kinds.push("studio");
  return kinds;
}

// Every workplace, college area and neighbourhood the homes are close to.
// Bigger colleges near our homes, for students searching Find my home. Only
// in search, never shown as buttons. From general knowledge (17 Oct 2026):
// worth a check by the team, like the pincodes.
export const colleges: Record<string, { homes: string[]; aliases?: string[] }> = {
  "CMR Institute of Technology": { homes: ["ITP", "KDH"], aliases: ["CMRIT"] },
  "Vydehi Institute of Medical Sciences": { homes: ["ITP", "WFD"], aliases: ["Vydehi"] },
  "MVJ College of Engineering": { homes: ["ITP", "WFD"], aliases: ["MVJCE", "MVJ"] },
  "New Horizon College of Engineering": { homes: ["LIT", "KDH", "PODS"], aliases: ["NHCE", "New Horizon"] },
  "Cambridge Institute of Technology": { homes: ["PMC", "BGM"], aliases: ["CIT"] },
  "Kristu Jayanti College": { homes: ["HBR"], aliases: ["Kristu Jayanti", "KJC"] },
  "CMR University": { homes: ["HBR"], aliases: ["CMRU"] },
  "Christ University": { homes: ["KORA"], aliases: ["Christ"] },
  "St. John's Medical College": { homes: ["KORA"], aliases: ["St Johns", "SJMC"] },
  "Jyoti Nivas College": { homes: ["KORA"], aliases: ["JNC"] },
  "St. Francis College": { homes: ["KORA"], aliases: ["St Francis"] },
  "NIFT Bengaluru": { homes: ["KORA"], aliases: ["NIFT", "National Institute of Fashion Technology"] },
  "Azim Premji University": { homes: ["SJR"], aliases: ["APU", "Azim Premji"] },
};

export const isCollege = (place: string) => place in colleges;

// What a search box should match a place on: its name and any short forms.
export const searchNames = (place: string) => [place, ...(colleges[place]?.aliases ?? [])];

export const places = Array.from(new Set([...properties.flatMap((p) => [p.area, ...p.nearby]), ...Object.keys(colleges)])).sort((a, b) => a.localeCompare(b));

// A home is near a place if it's in that area or lists it nearby; an area
// name from zones (like "Marathahalli") covers every home in that area.
export function nearPlace(p: Property, place: string) {
  return (
    p.area === place ||
    p.nearby.includes(place) ||
    zones.some((z) => z.label === place && z.id === p.zone) ||
    Boolean(colleges[place]?.homes.includes(p.code))
  );
}

export function homesNear(place: string) {
  return properties.filter((p) => nearPlace(p, place));
}
