import { C, FONT, RADIUS } from "../../theme";

// The Scapia coin medallion — navy disc with a gold ring + ₹ mark.
export function CoinMedallion({ size = 20 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, #FBD46A 0%, ${C.gold} 55%, ${C.goldDeep} 100%)`,
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: "50%",
          background: C.navyDeep,
          color: C.gold,
          fontSize: size * 0.36,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.sans,
        }}
      >
        ₹
      </span>
    </span>
  );
}

// Amber coin pill: "🪙 1,234 coins"  (e.g. "+X coins" on bookable items)
export function CoinPill({ amount, prefix = "+", suffix = "coins", size = 12 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: C.goldSoft,
        color: C.goldDeep,
        padding: "4px 9px",
        borderRadius: RADIUS.pill,
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: size,
        whiteSpace: "nowrap",
      }}
    >
      <CoinMedallion size={size + 3} />
      {prefix}
      {Number(amount).toLocaleString("en-IN")} {suffix}
    </span>
  );
}

// "Price after using your 🪙 X coins" pill with an orange toggle (visual only).
export function CoinToggle({ label = "Price after using your", amount, on = true, onToggle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        background: C.coralSoft,
        borderRadius: RADIUS.md,
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontFamily: FONT.sans, fontSize: 13.5, fontWeight: 600, color: C.ink }}>
        {label}{" "}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: C.goldDeep, fontWeight: 800 }}>
          <CoinMedallion size={16} />
          {Number(amount).toLocaleString("en-IN")} coins
        </span>
      </div>
      <button
        onClick={onToggle}
        aria-label="Toggle coin redemption"
        style={{
          width: 46,
          height: 27,
          borderRadius: RADIUS.pill,
          border: "none",
          cursor: onToggle ? "pointer" : "default",
          background: on ? C.coral : "#CBD2DE",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
          padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: on ? 22 : 3,
            width: 21,
            height: 21,
            borderRadius: "50%",
            background: C.white,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        />
      </button>
    </div>
  );
}

// Green "free with coins" / savings callout: "% Your experience is free with X coins!"
export function SavingsCallout({ children, icon = "％" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        background: C.greenSoft,
        borderRadius: RADIUS.md,
        padding: "11px 13px",
        fontFamily: FONT.sans,
        fontSize: 13,
        fontWeight: 700,
        color: C.green,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: C.green,
          color: C.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}
