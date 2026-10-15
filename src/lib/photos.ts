// Photos currently hosted on Wix's CDN (ids from ff21.in). Scope 2 moves them
// to our own storage before the Wix plan is cancelled.
export type Photo = { id: string; alt: string };

const p = (id: string, alt: string): Photo => ({ id, alt });

export const photos = {
  rooftopSunset: p("c1f9d0_9c964604b1a8430ab0136cf49a046a35~mv2.jpg", "Rooftop lounge at sunset with the Bangalore skyline behind it"),
  rooftopDusk: p("c1f9d0_fb2aa14d4a6a403397bb4608e9c1d556~mv2.jpg", "Rooftop terrace at dusk with plants and city lights"),
  rooftopDeck: p("c1f9d0_ff5428d9fbc2409fa3607de94932d33a~mv2.jpg", "Deck chairs on a rooftop lawn under an open sky"),
  rooftopNight: p("c1f9d0_632762530fbf4c6eab15e93f099ec1d2~mv2.jpg", "Rooftop lawn lit up at night"),
  rooftopTables: p("c1f9d0_7aed1bb4b5384f6db403d3d916e77815~mv2.jpg", "Long rooftop lawn with planters and seating"),
  rooftopLawn: p("c1f9d0_9c154045130548e98bbccffae589df3e~mv2.jpg", "Rooftop lawn with tables, seen from above"),
  loungeTeal: p("c1f9d0_6f13e1d9836649929345f4d2531fee95~mv2.jpg", "Bright lounge with teal sofas and tall windows"),
  loungeBright: p("c1f9d0_63292032819648f4a93ad67040809ead~mv2.jpg", "Teal sofas in a sunlit common room"),
  loungeFamily: p("c1f9d0_de14a10060f241c5ba49c883735a766c~mv2.jpg", "Common room with a 'Where friends become family' wall"),
  diningFamily: p("c1f9d0_6cb0bd25b1a34258a25cf3f0f7c1ac66~mv2.jpg", "Dining corner under a 'Where friends become family' wall"),
  diningHall: p("c1f9d0_2c9833fdfcd44f838f7a3f4595aa32ec~mv2.jpg", "Dining hall with long tables and pendant lights"),
  workspace: p("c1f9d0_18d1090448d048c19e2c987b5d27e3fb~mv2.jpg", "Resident working on a laptop at a wooden table"),
  poolLibrary: p("c1f9d0_01cbc0ed99e845c8ad0e13b56de20932~mv2.jpg", "Pool table beside a wall of bookshelves"),
  poolGame: p("c1f9d0_aa9f2e27e2074c68bafefb7f70852bee~mv2.jpg", "Residents playing pool"),
  hatWall: p("c1f9d0_64a1f772f33642f5883fdbe1646b06fa~mv2.jpg", "Brick wall hung with hats above a console table"),
  swingChairs: p("c1f9d0_e2b69738058f4bd6b0366887473b5d58~mv2.jpg", "Two hanging swing chairs against a white brick wall"),
  homeSign: p("c1f9d0_326931a1af574489b9984f26c6c4c4f5~mv2.jpg", "Bench with a HOME sign and cushions"),
  bunkBeds: p("c1f9d0_d36c90023b294ef58eac097a054b2db7~mv2.jpg", "Bunk bed room with teal linen"),
  wfhLawn: p("c1f9d0_1641bd814bec413a96664e06b6ccb73b~mv2.jpg", "Resident working on a laptop on the rooftop lawn"),

  roomTwin: p("c1f9d0_9dbc9b422d9741b38e942207ead08828~mv2.jpeg", "Twin room with two beds side by side"),
  roomPrivate: p("c1f9d0_8d8c916f79404e969fa0a96f0175ecfb~mv2.jpg", "Private room with a single bed and wardrobe"),
  roomStudio: p("c1f9d0_6ef55ed51c4449e5ae8cf86a556856b3~mv2.jpg", "Studio room with twin beds and a kitchenette shelf"),

  diwali: p("c1f9d0_92b0d0b996f445efbbbafa73246acae2~mv2.jpg", "Residents lighting diyas around a rangoli for Diwali"),
  holi: p("c1f9d0_6cdcdd0be0b34b8298e5ec005238a547~mv2.jpg", "Residents covered in colour after Holi"),
  christmas: p("c1f9d0_9a212518a62547cca79f2f0aee77ce05~mv2.jpg", "Residents decorating a Christmas tree"),
  partyProps: p("c1f9d0_1380152a074d446db1e18e6f50995614~mv2.jpg", "Residents posing with party props"),
  partyNight: p("c1f9d0_649b4cb3a12d4410ac7be07e9cc24d67~mv2.jpg", "A packed party night with lights and music"),
  groupOutdoor: p("c1f9d0_c074cec24e074a728516c4c93507ed5c~mv2.jpg", "A group of residents outdoors"),
  partyFriends: p("c1f9d0_da7404ec6b504016a5437a318f9209b9~mv2.jpg", "Friends celebrating together"),
} satisfies Record<string, Photo>;

export const px = (id: string, alt: string) => p(id, alt);

// 1200x630 JPEG for link previews (WhatsApp, Facebook, X, LinkedIn).
export const ogImage = (photo: Photo) =>
  `https://static.wixstatic.com/media/${photo.id}/v1/fill/w_1200,h_630,al_c,q_85/${photo.id.replace(/\.\w+$/, ".jpg")}`;
