// ─── AI PICKS BANNER ────────────────────────────────────────────────────────
// Shown on every manual-build screen (Flights / Stays / Experiences).
// Lets users jump to the 3 AI-assembled itineraries at any point.

import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { C, FONT, RADIUS } from "../theme";

export default function AIPicksBanner() {
  const navigate = useNavigate();
  const { autoItineraries } = useApp();
  const hasItineraries = autoItineraries?.length > 0;

  return (
    <button
      onClick={() => navigate(hasItineraries ? "/auto-compare" : "/auto-loading")}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: C.coralSoft, border: `1px solid ${C.coral}`, borderRadius: RADIUS.md,
        padding: "12px 14px", cursor: "pointer", textAlign: "left", gap: 10, fontFamily: FONT.sans,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🤖</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: C.coralDark, marginBottom: 2 }}>Let AI build it instead</div>
          <div style={{ fontSize: 11.5, color: C.coral, lineHeight: 1.4 }}>
            {hasItineraries ? "Your 3 AI itineraries are ready — view them now" : "See 3 complete itineraries assembled from your profile"}
          </div>
        </div>
      </div>
      <span style={{ fontSize: 18, color: C.coral, fontWeight: 700, flexShrink: 0 }}>→</span>
    </button>
  );
}
