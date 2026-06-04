import { useNavigate, useLocation } from "react-router-dom";
import { C, FONT, RADIUS, SHADOW } from "../../theme";

const TABS = [
  { key: "home", label: "Home", icon: "🏠", to: "/", match: ["/", "/onboarding"] },
  { key: "itin", label: "Itinerary", icon: "🗺️", to: "/my-itineraries", match: ["/my-itineraries"] },
];

/**
 * Two-tab floating pill nav (Scapia-style). Home/profile + Itinerary.
 * Fixed-centred within the mobile frame. Purely navigational.
 */
// Shown only on the two "hub" screens. Every in-flow screen has a header back
// button, so the nav would just collide with each screen's primary CTA.
const SHOW_ON = ["/", "/my-itineraries"];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!SHOW_ON.includes(pathname)) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          gap: 6,
          background: C.white,
          borderRadius: RADIUS.pill,
          padding: 6,
          boxShadow: SHADOW.float,
          border: `1px solid ${C.line}`,
        }}
      >
        {TABS.map((t) => {
          const active = t.match.includes(pathname);
          return (
            <button
              key={t.key}
              onClick={() => navigate(t.to)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                cursor: "pointer",
                borderRadius: RADIUS.pill,
                padding: active ? "10px 18px" : "10px 14px",
                background: active ? C.coralSoft : "transparent",
                color: active ? C.coral : C.sub,
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 13,
                transition: "all 0.18s ease",
              }}
            >
              <span style={{ fontSize: 16, filter: active ? "none" : "grayscale(0.4)" }}>{t.icon}</span>
              {active && <span>{t.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
