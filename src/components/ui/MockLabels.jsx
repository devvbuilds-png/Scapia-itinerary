import { C, FONT, RADIUS, SHADOW } from "../../theme";

// Small consistent "Demo · mock data" chip. Sits in the header on every screen
// that shows inventory or profile data. Legible over both hero photos and the
// frosted header (translucent white pill).
export function DemoChip({ compact = false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(255,255,255,0.88)",
        color: C.body,
        fontFamily: FONT.sans,
        fontWeight: 800,
        fontSize: 10,
        letterSpacing: 0.2,
        padding: "5px 9px",
        borderRadius: RADIUS.pill,
        border: `1px solid ${C.line}`,
        boxShadow: SHADOW.cardSoft,
        whiteSpace: "nowrap",
      }}
    >
      🧪 {compact ? "Demo" : "Demo · mock"}
    </span>
  );
}

// Subtle one-line note for listing screens.
export function SampleNote({ children, icon = "ⓘ", style }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: FONT.sans,
        fontSize: 11,
        color: C.muted,
        textAlign: "center",
        lineHeight: 1.45,
        ...style,
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

// Soft tinted callout for explanations (e.g. why Thailand-only, profile is sample data).
export function InfoCallout({ icon = "ℹ️", title, children, tone = "blue", style }) {
  const tint = { blue: C.blueSoft, gold: C.goldSoft, coral: C.coralSoft, neutral: C.cardAlt }[tone] || C.blueSoft;
  const fg = { blue: C.blue, gold: C.goldDeep, coral: C.coralDark, neutral: C.body }[tone] || C.blue;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        background: tint,
        borderRadius: RADIUS.md,
        padding: "11px 13px",
        fontFamily: FONT.sans,
        ...style,
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.3 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        {title && <div style={{ fontSize: 12.5, fontWeight: 800, color: fg, marginBottom: 2 }}>{title}</div>}
        <div style={{ fontSize: 12, color: C.body, lineHeight: 1.5 }}>{children}</div>
      </div>
    </div>
  );
}
