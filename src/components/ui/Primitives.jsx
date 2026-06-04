import { C, FONT, RADIUS, SHADOW } from "../../theme";

// ── Badge ────────────────────────────────────────────────────────────────────
const BADGE_TONES = {
  green: { bg: C.greenSoft, fg: C.green },
  coral: { bg: C.coralSoft, fg: C.coral },
  navy: { bg: "#E7ECF6", fg: C.navy },
  gold: { bg: C.goldSoft, fg: C.goldDeep },
  blue: { bg: C.blueSoft, fg: C.blue },
  purple: { bg: C.purpleSoft, fg: C.purple },
  dark: { bg: "rgba(12,20,36,0.72)", fg: "#FFFFFF" },
  white: { bg: "rgba(255,255,255,0.92)", fg: C.ink },
};

export function Badge({ children, tone = "navy", icon, style }) {
  const t = BADGE_TONES[tone] || BADGE_TONES.navy;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: t.bg,
        color: t.fg,
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: 11,
        padding: "4px 9px",
        borderRadius: RADIUS.pill,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}

// ── RatingChip ───────────────────────────────────────────────────────────────
// Dark rounded chip with an orange flame + score, optional "X ratings" beneath.
export function RatingChip({ score, ratings, light = false }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: light ? C.coralSoft : "rgba(12,20,36,0.82)",
          color: light ? C.ink : "#FFFFFF",
          padding: "5px 10px",
          borderRadius: RADIUS.pill,
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        <span style={{ color: C.coral }}>⚡</span>
        {score}
      </span>
      {ratings != null && (
        <span style={{ fontFamily: FONT.sans, fontSize: 10.5, color: light ? C.sub : "rgba(255,255,255,0.92)", fontWeight: 600, marginLeft: 3, textShadow: light ? "none" : "0 1px 3px rgba(0,0,0,0.5)" }}>
          {Number(ratings).toLocaleString("en-IN")} ratings
        </span>
      )}
    </div>
  );
}

// ── SectionHeader ────────────────────────────────────────────────────────────
// Tinted rounded-square icon + bold title + grey subtitle.
export function SectionHeader({ icon = "✨", title, subtitle, tone = "blue", right }) {
  const tint = { blue: C.blueSoft, coral: C.coralSoft, gold: C.goldSoft, green: C.greenSoft, purple: C.purpleSoft }[tone] || C.blueSoft;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, margin: "20px 0 12px" }}>
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 17, color: C.ink, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontFamily: FONT.sans, fontSize: 12.5, color: C.sub, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
const BTN_VARIANTS = {
  coral: { bg: C.coral, fg: "#FFFFFF", border: "none", shadow: SHADOW.press },
  navy: { bg: C.navy, fg: "#FFFFFF", border: "none", shadow: "none" },
  green: { bg: C.green, fg: "#FFFFFF", border: "none", shadow: "none" },
  outline: { bg: "transparent", fg: C.ink, border: `1.5px solid ${C.line}`, shadow: "none" },
  outlineCoral: { bg: "transparent", fg: C.coral, border: `1.5px solid ${C.coral}`, shadow: "none" },
  ghost: { bg: C.cardAlt, fg: C.ink, border: "none", shadow: "none" },
};

export function PrimaryButton({ children, variant = "coral", onClick, disabled, full = true, size = "lg", style }) {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.coral;
  const pad = size === "sm" ? "9px 16px" : size === "md" ? "12px 18px" : "15px 20px";
  const fontSize = size === "sm" ? 13 : size === "md" ? 14 : 15.5;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? "100%" : "auto",
        padding: pad,
        background: disabled ? "#D5DAE3" : v.bg,
        color: disabled ? "#8A93A4" : v.fg,
        border: disabled ? "none" : v.border,
        borderRadius: RADIUS.pill,
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : v.shadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "transform 0.12s ease, box-shadow 0.12s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Card (plain white surface) ───────────────────────────────────────────────
export function Card({ children, style, onClick, pad = 16 }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card,
        borderRadius: RADIUS.lg,
        padding: pad,
        boxShadow: SHADOW.cardSoft,
        border: `1px solid ${C.line}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
