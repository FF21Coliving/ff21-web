import { photos, px, type Photo } from "./photos";

export type Room = {
  name: string;
  description: string;
  // Per person per month, food and taxes included, as listed on ff21.in on
  // 15 Oct 2026. Confirm before launch (open question in the plan doc).
  price?: number;
};

export type Zone = "whitefield" | "marathahalli" | "mahadevapura" | "hbr" | "koramangala" | "sarjapur";
export type RoomKind = "twin" | "private" | "studio";

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
  // Exact option value in the Zoho CRM "FF21 Property" picklist.
  zohoValue: string;
  // The page on the current site, kept for the scope 2 redirect map.
  oldPath: string;
};

const twin: Room = { name: "Twin room", description: "One room, two beds. Bring a friend or meet a new one." };
const privateRoom: Room = { name: "Private room", description: "A room to yourself for calls, focus and quiet." };
const studio: Room = { name: "Studio", description: "Twin beds or a double bed, with a dry kitchenette." };

export const properties: Property[] = [
  {
    code: "ITP",
    from: 12000,
    slug: "itp-whitefield",
    area: "ITPL",
    zone: "whitefield",
    highlight: "Near ITPL",
    tour: "_Z9cfRDyXZw",
    tagline: "In Whitefield, near ITPL and EPIP Zone",
    nearby: ["Whitefield", "ITPL", "EPIP Zone", "AECS Layout", "Brookefield", "Hope Farm", "Nallurahalli", "Prestige Shantiniketan"],
    rooms: [
      { ...twin, price: 12000 },
      { ...studio, price: 18500 },
    ],
    hero: photos.loungeTeal,
    gallery: [photos.workspace, photos.poolLibrary, photos.roomStudio, photos.hatWall, photos.roomPrivate, photos.swingChairs, photos.bunkBeds, photos.homeSign],
    zohoValue: "FF21-ITP - ITPL/GR Tech Park/EPIP",
    oldPath: "/coliving-pgs-near-itpl",
  },
  {
    code: "WFD",
    from: 14000,
    slug: "wfd-whitefield",
    area: "Whitefield",
    zone: "whitefield",
    highlight: "50 m from ITPB",
    tagline: "50 metres from the ITPB back gate",
    nearby: ["ITPB", "ITPL", "EPIP Zone", "Hope Farm", "Brookefield"],
    rooms: [twin, privateRoom],
    hero: px("489126_95afa429dec4430c99b95a387fb42fe2~mv2.jpg", "Bedroom with an 'Oh hello' print above the bed"),
    gallery: [px("c1f9d0_a236fb40f2b64fb2993cc420dc2678c7~mv2.jpg", "Resident lining up a shot at the pool table"), photos.loungeFamily],
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
    hero: px("489126_541036fde6e249488ab377c9c66c2286~mv2.jpg", "Rooftop lounge with a sign that reads 'You'll find your best friend here'"),
    gallery: [
      px("489126_cca466f84d4b41bfa791a02edd144adc~mv2.jpg", "Lounge with shelves, plants and teal seating"),
      photos.rooftopDusk,
      px("c1f9d0_b8151104f7514ee6bd394dbd33ef5e96~mv2.jpg", "Rooftop seating in the evening"),
      px("c1f9d0_42dce6b781e845ea8967563da8859653~mv2.jpg", "Common room with teal chairs"),
      px("c1f9d0_c92dc6da37b84e92997c0bd6cb35aeae~mv2.jpg", "Lounge with warm lights and wooden furniture"),
    ],
    zohoValue: "FF21-KDH - Kundalahalli/Marathahalli",
    oldPath: "/ff21-kdh",
  },
  {
    code: "PODS",
    from: 14000,
    slug: "pods-marathahalli",
    area: "Marathahalli",
    zone: "marathahalli",
    highlight: "Private pods",
    tour: "035a0goKxnY",
    tagline: "Private pods near Bellandur and Ecospace",
    nearby: ["Ecospace", "Embassy Tech Village", "Cessna Business Park", "Bellandur", "Brigade Tech Gardens", "Kundanahalli", "Brookefield"],
    rooms: [
      { name: "Single pod", description: "A private pod of your own, food included.", price: 14000 },
      { name: "King size room", description: "A larger private room with a king size bed." },
    ],
    hero: px("489126_f2f32b80515b40a78d51021588423adb~mv2.jpg", "Pod door with a large 'hi' print"),
    gallery: [
      px("489126_5da6ed1eec714615874657b2948c9150~mv2.jpg", "Pod with a black and white abstract print on a teal wall"),
      px("489126_69bd91c9736944d8af2fbdc384fb7d12~mv2.jpg", "Corridor lined with framed prints"),
      px("489126_63f25e12231440f3a76dac16eb850184~mv2.jpg", "Hexagon tiles and a round mirror"),
      px("489126_2a381991ef1f4581ab069bc4de27ba17~mv2.jpg", "Lounge with a swing and floor cushions at night"),
      px("489126_fe94b1d8d6ea4d21a48f13eea7198520~mv2.jpg", "Long corridor with arched teal doors"),
      px("489126_d71311c74e624229a8ca42a1d21d4677~mv2.jpg", "Resident playing table tennis"),
    ],
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
    tagline: "An open atrium with a lawn, in Kadubeesanahalli",
    nearby: ["Kadubeesanahalli", "Thubarahalli"],
    rooms: [
      { ...twin, price: 17000 },
      { ...studio, price: 20350 },
      { ...privateRoom, price: 31000 },
    ],
    hero: px("489126_2378974c832d4b22ba54562f6dca7d69~mv2.jpeg", "Indoor atrium with a lawn, bean bags and skylights"),
    gallery: [
      px("489126_5efe96d07e784018bdd0fdc169c3cbb8~mv2.jpeg", "Grey brick wall with hats and a framed collage"),
      px("489126_f4f10cce18da418cae027b9bbcd63f8f~mv2.jpeg", "Lounge with posters and striped cushions"),
      px("489126_6d1d52d1cbf247988ffc6c2ea52c87fc~mv2.jpg", "Bookshelves and a table tennis table"),
      px("489126_86dabf984c8946b2a8bf5594eac313ca~mv2.jpeg", "Desk area with an FF21 logo on the wall"),
    ],
    zohoValue: "FF21-LIT - Thubarahalli",
    oldPath: "/pg-in-kadubeesanahalli",
  },
  {
    code: "BGM",
    from: 15750,
    slug: "bgm-doddanekundi",
    area: "Doddanekundi",
    zone: "marathahalli",
    highlight: "Near Bagmane",
    tagline: "Close to Bagmane Tech Park",
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
    zohoValue: "FF21-BGM - Bagmane / Doddanekundi",
    oldPath: "/coliving-pgs-near-doddanekundi",
  },
  {
    code: "PMC",
    from: 16450,
    slug: "pmc-mahadevapura",
    area: "Mahadevapura",
    zone: "mahadevapura",
    highlight: "Rooftop",
    tour: "RgCV8wDO5Ng",
    tagline: "A rooftop above Phoenix Marketcity and Bagmane",
    nearby: ["Phoenix Marketcity", "Bagmane Tech Park", "Mahadevapura", "Whitefield Road"],
    rooms: [
      { ...twin, price: 16450 },
      { ...studio, price: 19800 },
      { ...privateRoom, price: 29900 },
    ],
    hero: photos.rooftopDeck,
    gallery: [
      photos.rooftopSunset,
      px("c1f9d0_15390411c4cd47e4a48e609ba4ef44f7~mv2.jpg", "Dining room lit warmly at night"),
      photos.rooftopNight,
      px("c1f9d0_e1eff85318204953ad29a372b874934a~mv2.jpg", "Rooftop lawn beside a small terrace room"),
      photos.roomTwin,
      px("c1f9d0_e53fae88b9ca4a72b9e4218ceb609ea4~mv2.jpeg", "Studio with twin beds and shelves"),
      px("489126_78d9471c697c4a1991752e59112f4d65~mv2.jpeg", "Single room with a teal wall"),
    ],
    zohoValue: "FF21-PMC - Bagmane / Phoenix Market City",
    oldPath: "/coliving-pg-near-mahadevapura",
  },
  {
    code: "HBR",
    from: 15750,
    slug: "hbr-hennur",
    area: "HBR Layout",
    zone: "hbr",
    highlight: "Near Manyata",
    tour: "hH9uidkr-nk",
    tagline: "Near Manyata Tech Park and Kalyan Nagar",
    nearby: ["Manyata Tech Park", "Kalyan Nagar", "Nagawara", "Hebbal", "Banaswadi", "Kammanahalli", "RMZ Infinity"],
    rooms: [
      { name: "Twin room", description: "Bunk beds or two beds side by side." },
      privateRoom,
    ],
    hero: photos.diningFamily,
    gallery: [photos.loungeFamily, photos.rooftopLawn],
    zohoValue: "FF21-HBR - Manyata Tech Park",
    oldPath: "/coliving-pgs-near-hbr-layout",
  },
  {
    code: "KORA",
    from: 17300,
    slug: "kora-koramangala",
    area: "Koramangala",
    zone: "koramangala",
    highlight: "Studios",
    tagline: "Studios in the middle of Koramangala",
    nearby: ["Koramangala", "Ejipura", "HSR Layout", "BTM Layout", "Madiwala", "Domlur", "Indiranagar"],
    rooms: [
      { name: "Studio deluxe", description: "Twin beds, a work desk and a teal feature wall." },
      { name: "Premium studio", description: "A larger studio with more storage." },
    ],
    hero: px("489126_71de0460d90d4d83bf8af43f848e76d4~mv2.jpg", "Studio deluxe with twin beds and a teal wall"),
    gallery: [
      px("489126_432061723ae546ac8165bb59bc994bb4~mv2.jpg", "Premium studio with twin beds and a wardrobe"),
      px("489126_3472b420775d42ca91ae8a5161cca48e~mv2.jpeg", "Indoor lawn with teal lounge chairs"),
      px("489126_de2b74e129014ecc90eedae631fab2d1~mv2.jpeg", "Resident working at a café table"),
    ],
    zohoValue: "FF21-KORA - Koramangala",
    oldPath: "/coliving-near-koramangala",
  },
  {
    code: "SJR",
    from: 17800,
    slug: "sjr-sarjapur",
    area: "Sarjapur",
    zone: "sarjapur",
    highlight: "Sarjapur Road",
    tagline: "Coliving off Sarjapur Road",
    nearby: ["Sarjapur Road", "Kodathi", "Chikkakannelli"],
    rooms: [],
    // The current SJR page reuses the KORA photo set. Replace with SJR photos.
    hero: px("489126_432061723ae546ac8165bb59bc994bb4~mv2.jpg", "Studio with twin beds and a wardrobe"),
    gallery: [px("489126_3472b420775d42ca91ae8a5161cca48e~mv2.jpeg", "Indoor lawn with teal lounge chairs")],
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
  studio: "Studio",
};

// Room kinds a home offers, read from its room names.
export function roomKinds(p: Property): RoomKind[] {
  const names = p.rooms.map((r) => r.name.toLowerCase()).join(" ");
  const kinds: RoomKind[] = [];
  if (/twin|double|bunk/.test(names)) kinds.push("twin");
  if (/private|single|pod|king/.test(names)) kinds.push("private");
  if (/studio/.test(names)) kinds.push("studio");
  return kinds;
}

// Every workplace, college area and neighbourhood the homes are close to.
export const places = Array.from(new Set(properties.flatMap((p) => [p.area, ...p.nearby]))).sort((a, b) => a.localeCompare(b));

export function homesNear(place: string) {
  return properties.filter((p) => p.area === place || p.nearby.includes(place));
}
