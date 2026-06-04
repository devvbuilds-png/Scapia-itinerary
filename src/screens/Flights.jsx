import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { scoreInventory } from "../engine/aiScoring";
import { ALL_INVENTORY, FLIGHTS_INBOUND, FLIGHTS_INTERCITY, FLIGHTS_RETURN } from "../data/inventory";
import AIPicksBanner from "../components/AIPicksBanner";
import { ScapiaHeader, PrimaryButton, Badge, CoinPill, SampleNote } from "../components/ui";
import { FLIGHT_HERO } from "../data/images";
import { C, FONT, RADIUS, SHADOW, NAV_SAFE_PAD, HERO_BLEED } from "../theme";

const ALL_FLIGHTS = [...FLIGHTS_INBOUND, ...FLIGHTS_INTERCITY, ...FLIGHTS_RETURN];

function ScoringLoader({ user }) {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const timer = setInterval(() => setDots((prev) => (prev.length >= 3 ? "." : prev + ".")), 500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={center}>
      <div style={{ width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", background: C.coral, color: "#fff", fontWeight: 800, fontFamily: FONT.sans, fontSize: 18 }}>AI</div>
      <div style={{ fontFamily: FONT.sans, fontSize: 22, fontWeight: 800, color: C.ink }}>Personalising your trip{dots}</div>
      <div style={{ fontFamily: FONT.sans, fontSize: 14, color: C.sub, lineHeight: 1.5 }}>
        Scoring every flight, hotel and experience against <strong>{user.name}'s</strong> travel profile.
      </div>
      <div style={{ width: "100%", textAlign: "left", background: C.card, border: `1px solid ${C.line}`, borderRadius: RADIUS.lg, padding: 16, fontSize: 14, color: C.body, display: "grid", gap: 8, fontFamily: FONT.sans }}>
        <div>✓ Profile read</div>
        <div>✓ Constraints computed</div>
        <div style={{ color: C.coral, fontWeight: 700 }}>Scoring inventory{dots}</div>
      </div>
    </div>
  );
}

function ScoringError({ error, onRetry }) {
  return (
    <div style={center}>
      <div style={{ fontFamily: FONT.sans, fontSize: 20, fontWeight: 800, color: C.ink }}>Scoring failed</div>
      <div style={{ fontFamily: FONT.sans, fontSize: 13, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 12, textAlign: "left" }}>{error}</div>
      <PrimaryButton variant="coral" full={false} onClick={onRetry}>Retry</PrimaryButton>
    </div>
  );
}

function FlightCard({ flight, rank, isSelected, onSelect, showAIPick }) {
  const coins = Math.round(flight.pricePerPerson * 0.2);
  return (
    <button
      onClick={() => onSelect(flight.id)}
      style={{
        width: "100%", textAlign: "left", background: isSelected ? "#FFFDFB" : C.card,
        borderRadius: RADIUS.lg, padding: 15, border: isSelected ? `2px solid ${C.coral}` : `1px solid ${C.line}`,
        boxShadow: SHADOW.cardSoft, cursor: "pointer", fontFamily: FONT.sans,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          {showAIPick && rank === 0 && <Badge tone="coral" icon="✨" style={{ marginBottom: 5 }}>AI Pick</Badge>}
          <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{flight.airline}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{flight.flightNo}</div>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: isSelected ? `2px solid ${C.coral}` : `2px solid #CBD2DE`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isSelected && <div style={{ width: 11, height: 11, borderRadius: "50%", background: C.coral }} />}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ minWidth: 48 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{flight.departure}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{flight.from}</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{flight.duration}</div>
          <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 3 }}>
            <div style={dot} />
            <div style={bar} />
            {flight.stops > 0 && <div style={{ ...dot, background: C.coral }} />}
            <div style={bar} />
            <span style={{ fontSize: 12 }}>✈️</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop (${flight.stopCity})`}</div>
        </div>
        <div style={{ minWidth: 48, textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{flight.arrival}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{flight.to}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: flight.aiReason ? 10 : 0 }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>
          ₹{flight.pricePerPerson.toLocaleString("en-IN")}
          <span style={{ fontSize: 12, fontWeight: 500, color: C.sub }}> /person</span>
        </div>
        <CoinPill amount={coins} />
      </div>

      {flight.aiReason && (
        <div style={{ display: "flex", gap: 6, background: C.greenSoft, borderRadius: RADIUS.sm, padding: "8px 10px", marginBottom: 8, fontSize: 12, color: C.green, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 800, flexShrink: 0 }}>Why:</span>
          <span>{flight.aiReason}</span>
        </div>
      )}

      {flight.aiScore != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: C.muted, width: 22 }}>Fit</div>
          <div style={{ flex: 1, height: 5, background: C.cardAlt, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${flight.aiScore}%`, borderRadius: 99, background: flight.aiScore >= 75 ? C.coral : flight.aiScore >= 50 ? C.gold : "#ef4444" }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.body, width: 22, textAlign: "right" }}>{flight.aiScore}</div>
        </div>
      )}
    </button>
  );
}

export default function Flights() {
  const { constraintObject, scoredInventory, setScoredInventory, selectedUser, manualItinerary, setManualItinerary } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestedLegId, setRequestedLegId] = useState("");
  const scoringStarted = useRef(false);

  const requiredLegs = useMemo(() => constraintObject?.requiredFlightLegs ?? [], [constraintObject]);

  const initialSelections = useMemo(() => {
    if (manualItinerary.flightSelections) {
      return Object.fromEntries(
        Object.entries(manualItinerary.flightSelections).map(([legId, flight]) => [legId, flight?.id])
      );
    }
    return {};
  }, [manualItinerary.flightSelections]);

  const [selectedFlights, setSelectedFlights] = useState(initialSelections);

  useEffect(() => {
    if (!constraintObject) navigate("/summary");
  }, [constraintObject, navigate]);

  useEffect(() => {
    if (scoredInventory || scoringStarted.current || !constraintObject) return;
    scoringStarted.current = true;
    setLoading(true);
    setError("");
    scoreInventory(constraintObject, ALL_INVENTORY)
      .then((scores) => { setScoredInventory(scores); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); scoringStarted.current = false; });
  }, [constraintObject, scoredInventory, setScoredInventory]);

  const handleRetry = () => { setError(""); scoringStarted.current = false; setScoredInventory(null); };

  const scoredFlightsByLeg = useMemo(() => {
    return Object.fromEntries(requiredLegs.map((leg) => {
      const flights = ALL_FLIGHTS
        .filter((flight) => flight.from === leg.from && flight.to === leg.to)
        .map((flight) => ({ ...flight, aiScore: scoredInventory?.[flight.id]?.score ?? null, aiReason: scoredInventory?.[flight.id]?.reason ?? "" }))
        .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
      return [leg.id, flights];
    }));
  }, [requiredLegs, scoredInventory]);

  const activeLeg = requiredLegs.find((leg) => leg.id === requestedLegId) ?? requiredLegs[0];
  const flights = activeLeg ? scoredFlightsByLeg[activeLeg.id] ?? [] : [];
  const completedLegCount = requiredLegs.filter((leg) => selectedFlights[leg.id]).length;
  const allRequiredSelected = requiredLegs.length > 0 && completedLegCount === requiredLegs.length;
  const nextIncompleteLeg = requiredLegs.find((leg) => !selectedFlights[leg.id]);

  const selectedFlightObjects = requiredLegs
    .map((leg) => ALL_FLIGHTS.find((flight) => flight.id === selectedFlights[leg.id]))
    .filter(Boolean);
  const flightCost = selectedFlightObjects.reduce((sum, flight) => sum + flight.pricePerPerson, 0);
  const flightCoins = Math.round(flightCost * 0.2);

  const selectFlight = (flightId) => {
    if (!activeLeg) return;
    setSelectedFlights((prev) => ({ ...prev, [activeLeg.id]: flightId }));
  };

  const handleConfirm = () => {
    const flightSelections = Object.fromEntries(
      requiredLegs.map((leg) => [leg.id, ALL_FLIGHTS.find((flight) => flight.id === selectedFlights[leg.id]) ?? null])
    );
    const selectedList = Object.values(flightSelections).filter(Boolean);
    const inboundFlight = flightSelections[requiredLegs[0]?.id] ?? null;
    const returnFlight = flightSelections[requiredLegs[requiredLegs.length - 1]?.id] ?? null;
    const intercityFlights = requiredLegs
      .filter((leg) => leg.type === "intercity")
      .map((leg) => flightSelections[leg.id])
      .filter(Boolean);

    setManualItinerary((prev) => ({
      ...prev, inboundFlight, returnFlight, intercityFlights, flightSelections,
      flightLegs: requiredLegs,
      flightTotal: selectedList.reduce((sum, flight) => sum + flight.pricePerPerson, 0),
    }));
    navigate("/stays");
  };

  if (!constraintObject) return null;
  if (loading) return <ScoringLoader user={selectedUser} />;
  if (error) return <ScoringError error={error} onRetry={handleRetry} />;

  const perPersonFlightBudget = constraintObject.flightBudget;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: NAV_SAFE_PAD }}>
      <ScapiaHeader accent="flights" onBack={() => navigate("/summary")} transparent />

      {/* hero */}
      <div style={{ position: "relative", height: 138, marginTop: HERO_BLEED, backgroundImage: `url(${FLIGHT_HERO})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(238,241,246,1) 0%, rgba(8,14,26,0.4) 100%)" }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 12 }}>
          <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 25, color: C.ink }}>Select your flights</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 12.5, color: C.body, fontWeight: 600 }}>{fmtShortDate(constraintObject.startDate)} → {fmtShortDate(constraintObject.endDate)}</div>
        </div>
      </div>

      <div style={{ padding: "10px 16px" }}>
        <AIPicksBanner />

        {/* context strip */}
        <div style={{ display: "flex", alignItems: "center", background: C.card, border: `1px solid ${C.line}`, borderRadius: RADIUS.md, padding: "11px 14px", marginTop: 12, marginBottom: 10 }}>
          <ContextItem label="Start" value={fmtDate(constraintObject.startDate)} />
          <div style={ctxDivider} />
          <ContextItem label="End" value={fmtDate(constraintObject.endDate)} />
          <div style={ctxDivider} />
          <ContextItem label="Flight budget/pp" value={`₹${perPersonFlightBudget.toLocaleString("en-IN")}`} />
        </div>

        {/* route plan */}
        <div style={{ background: C.blueSoft, borderRadius: RADIUS.md, padding: "11px 13px", marginBottom: 10 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 800, color: C.blue, marginBottom: 4 }}>Route fixed from your city choices</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.blue, lineHeight: 1.5 }}>
            {requiredLegs.map((leg) => `${leg.label} (${fmtShortDate(leg.date)})`).join("  ·  ")}
          </div>
        </div>

        {/* profile chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.muted }}>Scoring for:</span>
          <Badge tone="navy">{selectedUser.name}</Badge>
          <Badge tone="blue">Flight: {constraintObject.effectiveFlight}</Badge>
          <Badge tone="purple">Stay: {constraintObject.effectiveStay}</Badge>
        </div>

        {/* leg tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, marginBottom: 14 }}>
          {requiredLegs.map((leg) => {
            const done = !!selectedFlights[leg.id];
            const active = activeLeg?.id === leg.id;
            return (
              <button key={leg.id} onClick={() => setRequestedLegId(leg.id)}
                style={{
                  minHeight: 56, padding: "9px 8px", borderRadius: RADIUS.md,
                  border: active ? `1.5px solid ${C.coral}` : `1.5px solid ${C.line}`,
                  background: active ? C.coralSoft : C.card, color: active ? C.coralDark : C.sub,
                  cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2,
                  fontFamily: FONT.sans, fontSize: 12, fontWeight: 800,
                }}>
                <span>{leg.label} {done ? <span style={{ color: C.green }}>✓</span> : <span style={{ color: C.coral }}>*</span>}</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{fmtShortDate(leg.date)}</span>
              </button>
            );
          })}
        </div>

        {/* active leg header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 800, color: C.ink }}>{activeLeg?.label}</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, color: C.sub }}>{fmtDate(activeLeg?.date)}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {flights.map((flight, idx) => (
            <FlightCard key={flight.id} flight={flight} rank={idx}
              isSelected={selectedFlights[activeLeg?.id] === flight.id}
              onSelect={selectFlight} showAIPick={idx === 0 && !!scoredInventory} />
          ))}
          {flights.length === 0 && (
            <div style={{ background: C.goldSoft, borderRadius: RADIUS.md, padding: 14, fontSize: 13, color: C.goldDeep, fontFamily: FONT.sans }}>No sample flights found for this leg yet.</div>
          )}
        </div>

        {/* running total */}
        {completedLegCount > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: RADIUS.lg, padding: "14px 15px", marginTop: 16, fontFamily: FONT.sans }}>
            <div style={rtRow}>
              <span style={{ color: C.sub }}>Per person · flights ({completedLegCount}/{requiredLegs.length} legs)</span>
              <span style={{ fontWeight: 800, color: C.ink }}>₹{flightCost.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ ...rtRow, marginBottom: 0 }}>
              <span style={{ color: C.sub }}>Coins you'll earn (per person)</span>
              <CoinPill amount={flightCoins} />
            </div>
            {flightCost > perPersonFlightBudget && (
              <div style={{ fontSize: 12, color: C.goldDeep, background: C.goldSoft, borderRadius: RADIUS.sm, padding: "7px 10px", marginTop: 8 }}>
                Over your per-person flight budget by ₹{(flightCost - perPersonFlightBudget).toLocaleString("en-IN")} — you can still continue.
              </div>
            )}
          </div>
        )}

        {completedLegCount > 0 && !allRequiredSelected && nextIncompleteLeg && (
          <div style={{ background: C.blueSoft, borderRadius: RADIUS.md, padding: "10px 12px", fontSize: 13, color: C.blue, marginTop: 12, fontFamily: FONT.sans, fontWeight: 600 }}>
            👉 Now pick {nextIncompleteLeg.label} for {fmtDate(nextIncompleteLeg.date)}.
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <PrimaryButton variant="coral" disabled={!allRequiredSelected} onClick={handleConfirm}>
            {!nextIncompleteLeg ? "Confirm flights & choose stays →"
              : completedLegCount === 0 ? `Select ${nextIncompleteLeg.label} flight first`
              : `Select ${nextIncompleteLeg.label} to continue`}
          </PrimaryButton>
        </div>

        <SampleNote style={{ marginTop: 18, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          Sample inventory — airline names are real for realism, but prices, times & availability are mock data.
        </SampleNote>
      </div>
    </div>
  );
}

function ContextItem({ label, value }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, color: C.ink }}>{value}</div>
    </div>
  );
}

function fmtDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
function fmtShortDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const center = { padding: 32, maxWidth: 440, minHeight: "100dvh", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 };
const dot = { width: 6, height: 6, borderRadius: "50%", background: "#9ca3af", flexShrink: 0 };
const bar = { flex: 1, height: 1, background: "#CBD2DE" };
const ctxDivider = { width: 1, height: 32, background: C.line, margin: "0 12px" };
const rtRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 13.5 };
