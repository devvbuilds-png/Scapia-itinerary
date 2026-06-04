import { useNavigate, useLocation } from "react-router-dom";
import { C, FONT, SHADOW } from "../../theme";

const TABS = [
  { key: "home", label: "Profile", icon: "🏠", to: "/", match: ["/"] },
  { key: "itin", label: "My Itineraries", icon: "🗺️", to: "/my-itineraries", match: ["/my-itineraries"] },
];

// Hub/result screens get a grounded app nav. Input-heavy flow screens keep only
// the header back button and wordmark-home shortcut, so primary CTAs stay clear.
const SHOW_ON = ["/", "/my-itineraries", "/auto-compare", "/auto-detail", "/day-by-day", "/itinerary"];

function shouldShow(pathname) {
  return SHOW_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!shouldShow(pathname)) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 440,
        padding: "8px 16px calc(8px + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,0.94)",
        borderTop: `1px solid ${C.line}`,
        boxShadow: SHADOW.float,
        backdropFilter: "blur(16px) saturate(1.15)",
        WebkitBackdropFilter: "blur(16px) saturate(1.15)",
        display: "flex",
        gap: 10,
        zIndex: 60,
      }}
    >
      {TABS.map((t) => {
        const active = t.match.includes(pathname);
        return (
          <button
            key={t.key}
            onClick={() => navigate(t.to)}
            style={{
              flex: 1,
              minHeight: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: "none",
              cursor: "pointer",
              borderRadius: 12,
              padding: "9px 10px",
              background: active ? C.coralSoft : "transparent",
              color: active ? C.coral : C.sub,
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 12.5,
              transition: "background 0.18s ease, color 0.18s ease",
            }}
          >
            <span style={{ fontSize: 17, filter: active ? "none" : "grayscale(0.35)" }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
