// ─────────────────────────────────────────────────────────────────────────────
// Curated, hand-verified Unsplash imagery for the Scapia skin (Phase 8).
// Every photo ID below was visually checked to match its theme.
// Mock/demo imagery only — illustrative, not live inventory.
// ─────────────────────────────────────────────────────────────────────────────

const U = (id, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

// City hero / tab imagery
export const CITY_IMAGES = {
  BKK: U("photo-1563492065599-3520f775eeed"),      // Bangkok — Wat temple, blue sky
  HKT: U("photo-1552465011-b4e21bf6e79a"),          // Phuket — longtail boats + limestone cliffs
  CNX: U("photo-1528181304800-259b08848526"),       // Chiang Mai — golden Buddha temple
  THAILAND: U("photo-1552465011-b4e21bf6e79a"),
};

export const CITY_NIGHT = {
  BKK: U("photo-1508009603885-50cf7c579365"),       // Bangkok Chinatown at night (neon, tuk-tuks)
};

// Airplane hero / flight visuals
export const FLIGHT_HERO = U("photo-1436491865332-7a61a109cc05"); // wing over sunset clouds
export const FLIGHT_GATE = U("photo-1542296332-2e4473faf563");    // plane at gate, sunset

// Hotels — keyed by inventory hotel id
export const HOTEL_IMAGES = {
  HTL_BKK_01: U("photo-1555854877-bab0e564b8d5"),   // budget hostel dorm
  HTL_BKK_02: U("photo-1582719478250-c89cae4dc85b"),// mid — cozy resort room
  HTL_BKK_03: U("photo-1540541338287-41700207dee6"),// luxury — cliffside infinity pool
  HTL_HKT_01: U("photo-1631049307264-da0ec9d70304"),// budget — simple modern room
  HTL_HKT_02: U("photo-1571896349842-33c89424de2d"),// mid — resort pool at dusk
  HTL_HKT_03: U("photo-1566073771259-6a8506099945"),// luxury — beach sunset pool
  HTL_CNX_01: U("photo-1555854877-bab0e564b8d5"),   // budget backpacker dorm
  HTL_CNX_02: U("photo-1551882547-ff40c63fe5fa"),   // mid — palm pool sunset
  HTL_CNX_03: U("photo-1514282401047-d79a71a590e8"),// luxury — overwater villas
};

// Experiences — keyed by inventory experience id
export const EXPERIENCE_IMAGES = {
  EXP_BKK_01: U("photo-1508009603885-50cf7c579365"),// Chinatown street food
  EXP_BKK_02: U("photo-1563492065599-3520f775eeed"),// Grand Palace / Wat
  EXP_BKK_03: U("photo-1571019613454-1cb2f99b2d8b"),// Muay Thai / sport
  EXP_BKK_04: U("photo-1602216056096-3b40cc0c9944"),// floating market / canal boat
  EXP_BKK_05: U("photo-1604908176997-125f25cc6f3d"),// cooking class — plated dish
  EXP_BKK_06: U("photo-1559339352-11d035aa65de"),   // Gaggan — waterfront fine dining
  EXP_BKK_07: U("photo-1514933651103-005eec06c04b"),// rooftop cocktail bar
  EXP_BKK_08: U("photo-1504457047772-27faf1c00561"),// Lumphini park — serene green
  EXP_HKT_01: U("photo-1552465011-b4e21bf6e79a"),   // Phi Phi speedboat / longtail
  EXP_HKT_02: U("photo-1544552866-d3ed42536cfd"),   // scuba — clownfish reef
  EXP_HKT_03: U("photo-1528127269322-539801943592"),// Phang Nga kayaking — karst bay
  EXP_HKT_04: U("photo-1540202404-a2f29016b523"),   // Patong beach day — aerial beach
  EXP_HKT_05: U("photo-1559314809-0d155014e29e"),   // Rawai seafood — Thai food
  EXP_HKT_06: U("photo-1559339352-11d035aa65de"),   // Catch Beach Club — waterfront dining
  EXP_HKT_07: U("photo-1581852017103-68ac65514cf7"),// elephant sanctuary
  EXP_HKT_08: U("photo-1583394293214-28ded15ee548"),// cooking class — chef
  EXP_CNX_01: U("photo-1551632811-561732d1e306"),   // Doi Inthanon trek — hikers
  EXP_CNX_02: U("photo-1581852017103-68ac65514cf7"),// elephant jungle sanctuary
  EXP_CNX_03: U("photo-1508009603885-50cf7c579365"),// night bazaar street food
  EXP_CNX_04: U("photo-1528181304800-259b08848526"),// Doi Suthep temple
  EXP_CNX_05: U("photo-1522163182402-834f871fd851"),// rock climbing — Railay
  EXP_CNX_06: U("photo-1604908176997-125f25cc6f3d"),// farm cooking class — dish
  EXP_CNX_07: U("photo-1552566626-52f8b828add9"),   // David's Kitchen — restaurant interior
  EXP_CNX_08: U("photo-1545389336-cf090694435e"),   // meditation / yoga on peak
};

// Category fallbacks (used if an id has no specific image)
export const CATEGORY_IMAGES = {
  Adventure: U("photo-1522163182402-834f871fd851"),
  Culture: U("photo-1528181304800-259b08848526"),
  Food: U("photo-1559314809-0d155014e29e"),
  Dining: U("photo-1559339352-11d035aa65de"),
  Nightlife: U("photo-1566737236500-c8ac43014a67"),
  Wellness: U("photo-1545389336-cf090694435e"),
  Leisure: U("photo-1540202404-a2f29016b523"),
};

// ── Resolvers ────────────────────────────────────────────────────────────────
export function hotelImage(hotel) {
  if (!hotel) return CITY_IMAGES.THAILAND;
  return hotel.image || HOTEL_IMAGES[hotel.id] || CITY_IMAGES[hotel.city] || CITY_IMAGES.THAILAND;
}

export function experienceImage(exp) {
  if (!exp) return CITY_IMAGES.THAILAND;
  return (
    exp.image ||
    EXPERIENCE_IMAGES[exp.id] ||
    CATEGORY_IMAGES[exp.category] ||
    CITY_IMAGES[exp.city] ||
    CITY_IMAGES.THAILAND
  );
}

export function cityImage(cityCode) {
  return CITY_IMAGES[cityCode] || CITY_IMAGES.THAILAND;
}

// Flight visual: lean on the destination city image, fall back to the wing hero.
export function flightImage(flight) {
  if (!flight) return FLIGHT_HERO;
  return CITY_IMAGES[flight.to] || FLIGHT_HERO;
}
