// Two kinds of photo id: a Wix media id (still on Wix's CDN, from ff21.in),
// or "/photos/<name>", FF21's own photos from the FF21 Image Library, built
// into public/photos by scripts/photos/build.py.
export type Photo = { id: string; alt: string };

const p = (id: string, alt: string): Photo => ({ id, alt });
// One of our own photos (public/photos/<name>-640|1080|1600.webp).
export const own = (name: string, alt: string): Photo => p(`/photos/${name}`, alt);

export const photos = {
  rooftopSunset: own("pmc-rooftop-dusk", "Rooftop lounge at dusk with the Bangalore skyline behind it"),
  rooftopDusk: own("kdh-rooftop-dusk", "Rooftop garden at dusk with benches and city lights"),
  rooftopDeck: own("pmc-rooftop-deck", "Deck chairs on a rooftop lawn at sunset"),
  rooftopNight: own("pmc-rooftop-night", "Rooftop lawn lit up at night above the city"),
  rooftopTables: own("hbr-rooftop-seating", "Long rooftop lawn with benches and teal cushions"),
  rooftopLawn: p("c1f9d0_9c154045130548e98bbccffae589df3e~mv2.jpg", "Rooftop lawn with tables, seen from above"),
  loungeTeal: own("itp-lounge-long", "Long lounge with teal sofas and tall windows"),
  loungeBright: own("pods-lounge-view", "Sunlit lounge with long built-in seating and a city view"),
  loungeFamily: own("hbr-lounge-wall", "Common room with a teal sofa and a 'Where friends become family' wall"),
  diningFamily: own("hbr-cafe-corner", "Café corner under a 'Where friends become family' wall"),
  diningHall: own("hbr-dining", "Dining hall with long tables and benches"),
  workspace: own("itp-work-table", "Resident working on a laptop at a wooden table"),
  poolLibrary: own("itp-pool-library", "Pool table beside a wall of bookshelves"),
  poolGame: own("hbr-pool", "Residents playing pool"),
  hatWall: p("c1f9d0_64a1f772f33642f5883fdbe1646b06fa~mv2.jpg", "Brick wall hung with hats above a console table"),
  swingChairs: own("comm-swing-chair", "Resident relaxing in a hanging swing chair"),
  homeSign: own("itp-home-sign", "Bench with a HOME sign, cushions and plants"),
  bunkBeds: own("itp-room-loft", "Room with a loft bed above a single bed"),
  wfhLawn: own("comm-working", "Two residents working on laptops by the window"),

  roomTwin: own("kdh-room-twin", "Twin room with two beds and teal linen"),
  roomPrivate: own("itp-room-private", "Private room with a bed, wardrobe and framed prints"),
  roomStudio: p("c1f9d0_6ef55ed51c4449e5ae8cf86a556856b3~mv2.jpg", "Studio room with twin beds and a kitchenette shelf"),

  diwali: own("comm-diwali-night", "Residents dressed up for Diwali under string lights"),
  holi: p("c1f9d0_6cdcdd0be0b34b8298e5ec005238a547~mv2.jpg", "Residents covered in colour after Holi"),
  christmas: p("c1f9d0_9a212518a62547cca79f2f0aee77ce05~mv2.jpg", "Residents decorating a Christmas tree"),
  podChairs: own("comm-pod-chairs", "Residents together in teal pod chairs"),
  partyNight: own("comm-dance-night", "Residents dancing at a party night"),
  groupOutdoor: own("comm-park-outing", "A group of residents on an outing in the park"),
  partyFriends: own("comm-festive-friends", "Friends dressed up for a festival"),
} satisfies Record<string, Photo>;

export const px = (id: string, alt: string) => p(id, alt);

// 1200x630 JPEG for link previews (WhatsApp, Facebook, X, LinkedIn).
// Our own photos have one only where scripts/photos/manifest.json lists it
// under "og" (the home heroes); others fall back to the large WebP.
const ownOg = new Set(["itp-lounge-fireplace", "kdh-rooftop-dusk", "lit-atrium", "pmc-rooftop-deck", "wfd-pool-turf", "pods-lounge-view", "hbr-dining", "pmc-rooftop-dusk"]);
export const ogImage = (photo: Photo) =>
  photo.id.startsWith("/photos/")
    ? `${photo.id}-${ownOg.has(photo.id.slice(8)) ? "og.jpg" : "1600.webp"}`
    : `https://static.wixstatic.com/media/${photo.id}/v1/fill/w_1200,h_630,al_c,q_85/${photo.id.replace(/\.\w+$/, ".jpg")}`;
