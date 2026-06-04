// ─────────────────────────────────────────────────────────────────────────────
// Scapia design tokens — derived from the real Scapia app screenshots.
// Phase 8 skin pass. Pure presentation; no logic depends on this file.
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  // Brand
  coral: "#E8491D",       // the "scapia" wordmark + primary CTAs / active nav
  coralDark: "#C53B14",
  coralSoft: "#FDEDE7",   // tinted coral background (toggle track off, callouts)

  navy: "#12203B",        // deep navy buttons (flights "Search Results"), hero overlays
  navyDeep: "#0E1B33",
  navySoft: "#1B2C4D",

  // Coins
  gold: "#E6A817",
  goldDeep: "#B9820B",
  goldSoft: "#FFF3D6",    // amber coin pill background

  // Savings / success
  green: "#3F9A4E",
  greenSoft: "#E6F4E6",

  // Accent tints
  blue: "#2F6BD8",
  blueSoft: "#EAF2FB",
  purple: "#6D4AC2",
  purpleSoft: "#EFE9FB",

  // Surfaces
  page: "#EEF1F6",
  card: "#FFFFFF",
  cardAlt: "#F6F8FC",
  black: "#0C1424",       // dark "perks"-style sections

  // Text
  ink: "#16213A",         // primary heading text
  body: "#46506A",        // body text
  sub: "#6B7793",         // secondary
  muted: "#98A2B3",       // faint
  line: "#E7EAF0",        // borders/dividers
  white: "#FFFFFF",
};

export const FONT = {
  sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  serif: "'Fraunces', Georgia, 'Times New Roman', serif", // characterful serif accent
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const SHADOW = {
  card: "0 6px 20px rgba(18,32,59,0.08)",
  cardSoft: "0 2px 10px rgba(18,32,59,0.06)",
  float: "0 10px 30px rgba(18,32,59,0.16)",
  press: "0 2px 8px rgba(232,73,29,0.30)",
};

// Standard mobile page frame used by every screen.
export const PAGE = {
  maxWidth: 440,
  margin: "0 auto",
  minHeight: "100vh",
  background: C.page,
  fontFamily: FONT.sans,
  position: "relative",
};

// space reserved at the bottom so the floating nav never overlaps content
// (includes the iOS home-indicator safe area)
export const NAV_SAFE_PAD = "calc(94px + env(safe-area-inset-bottom))";

// Header height (12px top pad + 40px control + 12px bottom pad = 64). Heroes that
// bleed up under the transparent sticky header pull up by this much, plus the
// top safe-area inset so the photo fills the notch area on standalone/PWA.
export const HEADER_H = 64;
export const HERO_BLEED = "calc(-64px - env(safe-area-inset-top))";
export const STICKY_BELOW_HEADER = "calc(64px + env(safe-area-inset-top))";
