import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import UserSwitcher from "../components/UserSwitcher";
import { ScapiaHeader, HeroImage, Card, SectionHeader, PrimaryButton, Badge, CoinMedallion, InfoCallout } from "../components/ui";
import { CITY_IMAGES } from "../data/images";
import { C, FONT, RADIUS, NAV_SAFE_PAD } from "../theme";

const AXIS_TONE = {
  // stay
  Budget: "green", Mid: "blue", Luxury: "purple",
  // flight
  Cheapest: "green", Balanced: "blue", Premium: "purple",
  // vibe
  Chill: "blue", Cultural: "gold", Adventure: "coral", Party: "purple",
  // food
  Street: "green", Casual: "blue", "Fine dining": "purple",
};

function AxisBadge({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: FONT.sans, fontSize: 10.5, color: C.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </span>
      <Badge tone={AXIS_TONE[value] || "navy"} style={{ fontSize: 13, padding: "6px 12px" }}>
        {value}
      </Badge>
    </div>
  );
}

export default function TravelProfile() {
  const { selectedUser, wishlist } = useApp();
  const navigate = useNavigate();
  const coinValueInRupees = Math.floor(selectedUser.coinBalance / 5);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: NAV_SAFE_PAD }}>
      <ScapiaHeader hideBack transparent />

      {/* Hero with greeting */}
      <HeroImage image={CITY_IMAGES.THAILAND} height={236}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={selectedUser.avatarUrl}
            alt={selectedUser.name}
            style={{
              width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
              background: "rgba(255,255,255,0.95)", objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.95)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
            }}
          />
          <div>
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, color: C.ink, lineHeight: 1.1 }}>
              Hi {selectedUser.name.split(" ")[0]}! <span style={{ fontSize: 16 }}>›</span>
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: 12.5, color: C.body, fontWeight: 600, marginTop: 2 }}>
              📍 {selectedUser.city} · Bookings & profile
            </div>
          </div>
        </div>
      </HeroImage>

      <div style={{ padding: "0 16px" }}>
        {/* Coins card (overlaps hero) */}
        <Card style={{ marginTop: -14, position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CoinMedallion size={26} />
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 24, color: C.ink }}>
                {selectedUser.coinBalance.toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: 12.5, color: C.sub, marginTop: 3 }}>
              Available Scapia coins · ≈ ₹{coinValueInRupees.toLocaleString("en-IN")}
            </div>
          </div>
          <PrimaryButton variant="coral" full={false} size="sm" onClick={() => navigate("/onboarding")}>
            Explore Coins ›
          </PrimaryButton>
        </Card>

        {/* Demo: switch mock user (test harness, moved up) */}
        <div style={{ marginTop: 14 }}>
          <UserSwitcher />
        </div>

        {/* Travel Profile */}
        <SectionHeader icon="🧭" tone="blue" title="Your Travel Profile" subtitle="Derived from sample Scapia card spend & booking history — not a real account" />
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <AxisBadge label="Stay preference" value={selectedUser.stayAxis} />
            <AxisBadge label="Flight style" value={selectedUser.flightAxis} />
            <AxisBadge label="Trip vibe" value={selectedUser.vibeAxis} />
            <AxisBadge label="Food style" value={selectedUser.foodAxis} />
          </div>
        </Card>

        {/* Typical budget */}
        <SectionHeader icon="💸" tone="green" title="Typical Budget" subtitle="What you usually spend per trip" />
        <Card>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 26, color: C.ink }}>{selectedUser.budgetBand.label}</span>
            <span style={{ fontFamily: FONT.sans, fontSize: 13, color: C.sub }}>per person per trip</span>
          </div>
        </Card>

        {/* Booking habits */}
        <SectionHeader icon="📌" tone="purple" title="Booking Habits" subtitle="Patterns from your history" />
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedUser.derivedFacts.map((fact, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontFamily: FONT.sans, fontSize: 13.5, color: C.body }}>
                <span style={{ color: C.green, fontWeight: 800, flexShrink: 0 }}>✓</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
          <PrimaryButton variant="coral" onClick={() => navigate("/onboarding")}>
            Plan a Trip to Thailand →
          </PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => navigate("/my-itineraries")}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              🗺️ My Itineraries
              {wishlist.length > 0 && (
                <span style={{ background: C.coral, color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: RADIUS.pill }}>
                  {wishlist.length} saved
                </span>
              )}
            </span>
          </PrimaryButton>
        </div>

        {/* About-this-demo disclosure */}
        <InfoCallout icon="🧪" tone="neutral" title="This is a demo prototype" style={{ marginTop: 16 }}>
          Everything here is mock data — profiles, card spend, coin balances, flights, stays, experiences, prices and savings are all fabricated to showcase the feature. Destination is fixed to Thailand for this pitch.
        </InfoCallout>
      </div>
    </div>
  );
}
