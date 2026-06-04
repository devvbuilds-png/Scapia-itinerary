import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { buildConstraintObject } from "../engine/constraintEngine";
import { ScapiaHeader, Card, PrimaryButton, Badge, CoinMedallion } from "../components/ui";
import { CITY_IMAGES } from "../data/images";
import { C, FONT, RADIUS, PAGE_PAD, HERO_BLEED } from "../theme";

const CITY_NAMES = { BKK: "Bangkok", HKT: "Phuket", CNX: "Chiang Mai" };

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const TIER_TONE = {
  stay: { Budget: "green", Mid: "blue", Luxury: "purple" },
  flight: { Cheapest: "green", Balanced: "blue", Premium: "purple" },
  food: { Street: "gold", Casual: "blue", "Fine dining": "purple" },
};

function CardTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: sub ? 12 : 10 }}>
      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 16, color: C.ink }}>{children}</div>
      {sub && <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 0", borderBottom: `1px solid ${C.cardAlt}`, gap: 12, fontFamily: FONT.sans, fontSize: 13.5 }}>
      <span style={{ color: C.sub }}>{label}</span>
      <span style={{ color: C.ink, fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function PrefTile({ label, value, source, tone, override }) {
  const tint = { green: C.greenSoft, blue: C.blueSoft, purple: C.purpleSoft, gold: C.goldSoft, coral: C.coralSoft }[tone] || C.cardAlt;
  return (
    <div style={{ background: override ? C.coralSoft : tint, borderRadius: RADIUS.md, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontFamily: FONT.sans, fontSize: 10.5, color: C.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 800, color: override ? C.coralDark : C.ink }}>{value}</div>
      <div style={{ fontFamily: FONT.sans, fontSize: 11, color: override ? C.coral : C.muted, fontWeight: 600 }}>{source}</div>
    </div>
  );
}

function SplitRow({ label, pct, amount, reason, color }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 700, color: C.ink, flex: 1 }}>{label}</span>
        <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, color: C.sub }}>{Math.round(pct * 100)}%</span>
        <span style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 800, color: C.ink, minWidth: 86, textAlign: "right" }}>₹{amount.toLocaleString("en-IN")}</span>
      </div>
      <div style={{ height: 9, background: C.cardAlt, borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${Math.round(pct * 100)}%`, background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>
      <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub, fontStyle: "italic" }}>{reason}</div>
    </div>
  );
}

function FlowOption({ icon, title, desc, tone, badge, onClick }) {
  const coral = tone === "coral";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "flex-start", gap: 12,
        background: coral ? C.coralSoft : C.cardAlt,
        border: coral ? `1.5px solid ${C.coral}` : `1.5px solid ${C.line}`,
        borderRadius: RADIUS.md, padding: "15px 13px", cursor: "pointer", textAlign: "left",
        fontFamily: FONT.sans,
      }}
    >
      <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {title}
          {badge && <Badge tone="coral">{badge}</Badge>}
        </div>
        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{desc}</div>
      </div>
      <span style={{ fontSize: 18, color: coral ? C.coral : C.muted, alignSelf: "center", flexShrink: 0 }}>→</span>
    </button>
  );
}

export default function Summary() {
  const { onboardingAnswers, selectedUser, setConstraintObject } = useApp();
  const navigate = useNavigate();

  const constraints = useMemo(() => {
    if (!onboardingAnswers || !selectedUser) return null;
    return buildConstraintObject(selectedUser, onboardingAnswers);
  }, [onboardingAnswers, selectedUser]);

  useEffect(() => {
    if (constraints) setConstraintObject(constraints);
  }, [constraints, setConstraintObject]);

  if (!onboardingAnswers) {
    return (
      <div style={{ minHeight: "100dvh", paddingBottom: PAGE_PAD }}>
        <ScapiaHeader backTo="/" />
        <div style={{ padding: 16 }}>
          <p style={{ color: C.sub, fontFamily: FONT.sans }}>Complete onboarding first.</p>
          <PrimaryButton variant="coral" onClick={() => navigate("/onboarding")}>Go to Onboarding →</PrimaryButton>
        </div>
      </div>
    );
  }
  if (!constraints) return null;

  const {
    effectiveStay, effectiveFlight, effectiveVibeLabel, effectiveFood,
    vibeIsOverridden, vibeOverrideReason, budgetIsOverridden, budgetOverrideReason,
    budgetPerPerson, groupLabel,
    splitStay, splitFlight, splitExp, stayBudget, flightBudget, expBudget,
    stayReason, flightReason, expReason,
    cities, startDate, endDate, tripDays, cityStays, requiredFlightLegs,
  } = constraints;

  const heroCity = cities[0] || "BKK";

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: PAGE_PAD }}>
      <ScapiaHeader accent="itinerary" onBack={() => navigate("/onboarding")} transparent />

      {/* hero */}
      <div style={{ position: "relative", height: 150, marginTop: HERO_BLEED, backgroundImage: `url(${CITY_IMAGES[heroCity]})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(238,241,246,1) 0%, rgba(8,14,26,0.45) 100%)" }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 12 }}>
          <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 26, color: C.ink }}>Trip Plan Summary</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 12.5, color: C.body, fontWeight: 600 }}>{cities.map((c) => CITY_NAMES[c]).join(" → ")}</div>
        </div>
      </div>

      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* override banner */}
        {(vibeIsOverridden || budgetIsOverridden) && (
          <div style={{ background: C.coralSoft, borderRadius: RADIUS.md, padding: "12px 14px", fontFamily: FONT.sans }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.coral, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>⚡ Active overrides applied</div>
            {vibeIsOverridden && <div style={{ fontSize: 13, color: C.coralDark, marginTop: 3 }}>{vibeOverrideReason}</div>}
            {budgetIsOverridden && <div style={{ fontSize: 13, color: C.coralDark, marginTop: 3 }}>{budgetOverrideReason}</div>}
          </div>
        )}

        {/* flow choice */}
        <Card>
          <CardTitle>How would you like to build this trip?</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FlowOption icon="🤖" tone="coral" badge="Recommended" title="Let AI build it for me"
              desc="AI assembles 3 complete itineraries tailored to your profile. Compare and pick one."
              onClick={() => navigate("/auto-loading")} />
            <FlowOption icon="🧭" title="I'll build it step by step"
              desc="Browse AI-ranked flights, stays and experiences, then pick what you want."
              onClick={() => navigate("/flights")} />
          </div>
        </Card>

        {/* trip details */}
        <Card>
          <CardTitle>Trip details</CardTitle>
          <Row label="Traveller" value={selectedUser.name} />
          <Row label="Cities" value={cities.map((c) => CITY_NAMES[c]).join(" → ")} />
          <Row label="Dates" value={`${fmt(startDate)} → ${fmt(endDate)}`} />
          <Row label="Duration" value={`${tripDays} days`} />
          <Row label="Group" value={groupLabel} />
        </Card>

        {/* route */}
        <Card>
          <CardTitle sub="Computed deterministically from cities + dates">Route & city dates</CardTitle>
          {cityStays.map((stay) => (
            <Row key={stay.city} label={stay.cityName} value={`${fmt(stay.checkIn)} → ${fmt(stay.checkOut)} · ${stay.nights} ${stay.nights === 1 ? "night" : "nights"}`} />
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
            {requiredFlightLegs.map((leg) => (
              <div key={leg.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 12px", background: C.blueSoft, borderRadius: RADIUS.sm, fontFamily: FONT.sans, fontSize: 12, color: C.blue, fontWeight: 600 }}>
                <span>✈️ {leg.label}</span>
                <strong>{fmt(leg.date)}</strong>
              </div>
            ))}
          </div>
        </Card>

        {/* merged prefs */}
        <Card>
          <CardTitle sub="Your travel profile + this trip's answers combined">Merged preferences</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            <PrefTile label="Stay" value={effectiveStay} source="Profile" tone={TIER_TONE.stay[effectiveStay]} />
            <PrefTile label="Flights" value={effectiveFlight} source="Profile" tone={TIER_TONE.flight[effectiveFlight]} />
            <PrefTile label="Vibe" value={effectiveVibeLabel} source={vibeIsOverridden ? "This trip ⚡" : "Profile"} tone="blue" override={vibeIsOverridden} />
            <PrefTile label="Food" value={effectiveFood} source="Profile" tone={TIER_TONE.food[effectiveFood]} />
          </div>
        </Card>

        {/* budget ceiling */}
        <Card style={{ background: C.navy, border: "none" }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 13, color: "#AEBBD4" }}>Budget ceiling · per person (hard limit)</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
            <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: -0.5 }}>₹{budgetPerPerson.toLocaleString("en-IN")}</span>
            <span style={{ fontFamily: FONT.sans, fontSize: 13, color: "#AEBBD4" }}>per person · {groupLabel}</span>
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: 12, color: "#8C9BB8", marginTop: 6 }}>Every price in this trip is shown per person. No itinerary exceeds this.</div>
          {budgetIsOverridden && <div style={{ fontSize: 12.5, color: C.gold, marginTop: 8, fontWeight: 600 }}>⚡ {budgetOverrideReason}</div>}
        </Card>

        {/* split */}
        <Card>
          <CardTitle sub="Derived from your preferences — not a fixed 35/35/30 rule">Personalised budget split</CardTitle>
          <SplitRow label="✈️ Flights" pct={splitFlight} amount={flightBudget} reason={flightReason} color={C.navy} />
          <SplitRow label="🏨 Stays" pct={splitStay} amount={stayBudget} reason={stayReason} color={C.blue} />
          <SplitRow label="🎭 Experiences" pct={splitExp} amount={expBudget} reason={expReason} color={C.green} />
        </Card>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: FONT.sans, fontSize: 11.5, color: C.muted, marginTop: 4 }}>
          <CoinMedallion size={14} /> Demo · mock data — prices & availability are illustrative only
        </div>
      </div>
    </div>
  );
}
