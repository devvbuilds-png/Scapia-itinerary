import { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { ScapiaHeader, Badge, CoinPill, PrimaryButton } from "../components/ui";
import { cityImage } from "../data/images";
import { C, FONT, RADIUS, NAV_SAFE_PAD } from "../theme";

const CITY_NAMES = { BKK: "Bangkok", HKT: "Phuket", CNX: "Chiang Mai" };

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function StarRow({ count }) {
  return <span style={{ color: C.gold, fontSize: 12 }}>{"★".repeat(count)}{"☆".repeat(Math.max(0, 5 - count))}</span>;
}

function BudgetBar({ perPersonTotal, budgetPerPerson, color }) {
  const pct = Math.min(100, Math.round((perPersonTotal / budgetPerPerson) * 100));
  const over = perPersonTotal > budgetPerPerson;
  return (
    <div>
      <div style={{ height: 7, background: C.cardAlt, borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: over ? "#ef4444" : color, borderRadius: 99, transition: "width 0.5s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, fontFamily: FONT.sans }}>
        <span>₹0</span>
        <span>Ceiling: ₹{budgetPerPerson.toLocaleString("en-IN")}/person</span>
      </div>
    </div>
  );
}

function ItineraryCard({ itin, index, recommended, active, constraintObject }) {
  const navigate = useNavigate();
  const delta = itin.perPersonTotal - constraintObject.budgetPerPerson;
  const pctDelta = Math.round(Math.abs(delta / constraintObject.budgetPerPerson) * 100);
  const heroCity = itin.cityStays?.[0]?.city || constraintObject.cities[0] || "BKK";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderRadius: RADIUS.xl,
        overflow: "hidden",
        border: recommended ? `1.5px solid ${itin.color}` : "1px solid rgba(255,255,255,0.7)",
        boxShadow: active
          ? "0 24px 50px -14px rgba(18,32,59,0.38), 0 4px 14px rgba(18,32,59,0.10)"
          : "0 10px 28px -12px rgba(18,32,59,0.22)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* image header with theme overlay */}
      <div style={{ position: "relative", height: 132, backgroundImage: `url(${cityImage(heroCity)})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${itin.color}EE 0%, ${itin.color}99 55%, rgba(8,14,26,0.25) 100%)` }} />
        {/* glossy top highlight */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)" }} />
        {recommended && (
          <div style={{ position: "absolute", top: 12, right: 12 }}>
            <Badge tone="gold" icon="★">Recommended</Badge>
          </div>
        )}
        <div style={{ position: "absolute", left: 14, right: 14, bottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 30 }}>{itin.emoji}</span>
          <div>
            <div style={{ fontFamily: FONT.sans, fontSize: 18, fontWeight: 800, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>{itin.name}</div>
            <div style={{ fontFamily: FONT.sans, fontSize: 12, color: "rgba(255,255,255,0.92)" }}>{itin.tagline}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* cost */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
          <div>
            <div style={costLabel}>Total · per person</div>
            <div style={{ fontFamily: FONT.sans, fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>₹{itin.perPersonTotal.toLocaleString("en-IN")}</div>
          </div>
          <CoinPill amount={itin.totalCoinsEarned} />
        </div>

        <BudgetBar perPersonTotal={itin.perPersonTotal} budgetPerPerson={constraintObject.budgetPerPerson} color={itin.color} />
        <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: RADIUS.sm, lineHeight: 1.4, marginTop: 8, background: delta <= 0 ? C.greenSoft : "#FEE2E2", color: delta <= 0 ? C.green : "#991b1b" }}>
          {delta <= 0
            ? `✓ ${pctDelta}% under budget — ₹${Math.abs(delta).toLocaleString("en-IN")}/person to spare`
            : `⚠️ ${pctDelta}% over budget — ₹${delta.toLocaleString("en-IN")}/person above ceiling`}
        </div>

        <div style={divider} />

        {/* stays */}
        <div style={sectionTitle}>🏨 Stays</div>
        {itin.cityStays.map((cs) => {
          const hotel = itin.stays[cs.city];
          if (!hotel) return null;
          return (
            <div key={cs.city} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                <Badge tone="blue">{cs.cityName}</Badge>
                <span style={ellip}>{hotel.name}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                <StarRow count={hotel.stars} />
                <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub }}>₹{hotel.pricePerNight.toLocaleString("en-IN")}/night</span>
              </div>
            </div>
          );
        })}

        <div style={divider} />

        {/* flights */}
        <div style={sectionTitle}>✈️ Flights</div>
        {itin.flightLegs.map((leg) => {
          const f = itin.flightSelections[leg.id];
          if (!f) return null;
          const label = leg.type === "entry" ? `BLR → ${leg.toName}` : leg.type === "exit" ? `${leg.fromName} → BLR` : `${leg.fromName} → ${leg.toName}`;
          return (
            <div key={leg.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, color: C.ink }}>{label}</span>
                <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub }}>{f.airline} · {f.duration}</span>
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, color: C.ink, flexShrink: 0 }}>₹{f.pricePerPerson.toLocaleString("en-IN")}</div>
            </div>
          );
        })}

        <div style={divider} />

        {/* activities */}
        <div style={sectionTitle}>🎯 Activities <span style={countBadge}>{(itin.activities ?? []).length}</span></div>
        {(itin.activities ?? []).slice(0, 3).map((exp) => (
          <div key={exp.id} style={expRow}>
            <Badge tone="navy">{exp.cityName}</Badge>
            <span style={ellip}>{exp.name}</span>
            <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub, flexShrink: 0 }}>₹{exp.pricePerPerson.toLocaleString("en-IN")}</span>
          </div>
        ))}
        {(itin.activities ?? []).length > 3 && <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.muted, marginTop: 2 }}>+{itin.activities.length - 3} more activities</div>}

        <div style={{ height: 12 }} />

        {/* food */}
        <div style={{ ...sectionTitle, color: C.purple }}>🍽️ Food & Dining <span style={{ ...countBadge, background: C.purpleSoft, color: C.purple }}>{(itin.foodDining ?? []).length}</span></div>
        {(itin.foodDining ?? []).map((exp) => (
          <div key={exp.id} style={expRow}>
            <Badge tone="purple">{exp.cityName}</Badge>
            <span style={ellip}>{exp.name}</span>
            <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub, flexShrink: 0 }}>₹{exp.pricePerPerson.toLocaleString("en-IN")}</span>
          </div>
        ))}

        <div style={divider} />

        {/* coins */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.goldSoft, borderRadius: RADIUS.md, padding: "10px 13px", marginBottom: 14 }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 700, color: C.goldDeep }}>
            Earn ₹{Math.round(itin.totalCoinsEarned / 5).toLocaleString("en-IN")} in coins
          </span>
          <CoinPill amount={itin.totalCoinsEarned} />
        </div>

        <PrimaryButton variant="coral" onClick={() => navigate("/day-by-day", { state: { itinIndex: index } })} style={{ background: itin.color, boxShadow: "none" }}>
          🗓️ See day-by-day plan →
        </PrimaryButton>
      </div>
    </div>
  );
}

export default function AutoBuildCompare() {
  const navigate = useNavigate();
  const { autoItineraries, constraintObject } = useApp();
  const scrollerRef = useRef(null);

  // Reorder so the recommended (Best Match) itinerary sits in the MIDDLE,
  // with the other two flanking it. Each entry keeps its ORIGINAL index so
  // navigation (itinIndex → autoItineraries[i]) stays correct.
  const ordered = useMemo(() => {
    const list = autoItineraries ?? [];
    const idxs = list.map((_, i) => i);
    const recIdx = list.findIndex((it) => it.strategy === "bestMatch" || it.id === "best_match");
    if (recIdx < 0 || list.length < 3) return idxs.map((i) => ({ itin: list[i], index: i }));
    const others = idxs.filter((i) => i !== recIdx);
    return [others[0], recIdx, others[1]].map((i) => ({ itin: list[i], index: i }));
  }, [autoItineraries]);

  const midPos = Math.floor((ordered.length || 1) / 2);
  const [active, setActive] = useState(midPos);

  // Land centred on the middle (recommended) card.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !el.children.length) return;
    const mid = el.children[midPos];
    if (mid) el.scrollLeft = mid.offsetLeft - (el.clientWidth - mid.offsetWidth) / 2;
    setActive(midPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered.length]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const c = child.offsetLeft + child.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setActive(best);
  };

  const goTo = (i) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  if (!autoItineraries?.length || !constraintObject) {
    return (
      <div style={{ minHeight: "100vh", paddingBottom: NAV_SAFE_PAD }}>
        <ScapiaHeader accent="itinerary" backTo="/summary" />
        <div style={{ textAlign: "center", padding: "60px 20px", color: C.body, fontFamily: FONT.sans }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>No itineraries yet</div>
          <PrimaryButton variant="coral" full={false} onClick={() => navigate("/auto-loading")}>Build itineraries →</PrimaryButton>
        </div>
      </div>
    );
  }

  const { startDate, endDate, tripDays, groupLabel, cities } = constraintObject;
  const cityNames = cities.map((c) => CITY_NAMES[c] ?? c).join(" → ");

  return (
    <div style={{ minHeight: "100vh", paddingBottom: NAV_SAFE_PAD, position: "relative" }}>
      {/* soft aurora behind the glass cards */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 150, left: -50, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,73,29,0.22), transparent 70%)", filter: "blur(8px)" }} />
        <div style={{ position: "absolute", top: 400, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,107,216,0.20), transparent 70%)", filter: "blur(8px)" }} />
        <div style={{ position: "absolute", top: 660, left: 30, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,168,23,0.20), transparent 70%)", filter: "blur(8px)" }} />
      </div>

      <ScapiaHeader accent="itinerary" onBack={() => navigate("/summary")} />

      <div style={{ padding: "12px 16px", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 25, color: C.ink, marginBottom: 4 }}>Your 3 AI itineraries</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          <Badge tone="navy" icon="📍">{cityNames}</Badge>
          <Badge tone="navy" icon="📅">{fmt(startDate)} → {fmt(endDate)}</Badge>
          <Badge tone="navy" icon="👥">{groupLabel}</Badge>
          <Badge tone="navy" icon="⏱">{tripDays} days</Badge>
        </div>

        <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.sub, marginBottom: 12, lineHeight: 1.5 }}>
          AI assembled these 3 complete trips from your travel profile. <strong style={{ color: C.body }}>Swipe</strong> to compare, then pick one.
        </div>

        {/* swipe affordance — kept ABOVE the carousel so it reads at first glance */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 11.5, fontWeight: 800, color: C.muted, letterSpacing: 0.5 }}>‹ SWIPE TO COMPARE ›</span>
        </div>

        {/* horizontal swipe carousel — neighbouring cards peek at the edges */}
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            margin: "0 -16px",
            padding: "4px 16px 8px",
            alignItems: "flex-start",
          }}
        >
          {ordered.map(({ itin, index }, pos) => {
            const isActive = active === pos;
            const recommended = itin.strategy === "bestMatch" || itin.id === "best_match";
            return (
              <div
                key={itin.id}
                style={{
                  flex: "0 0 72%",
                  scrollSnapAlign: "center",
                  transformOrigin: "center center",
                  transform: isActive ? "scale(1)" : "scale(0.96)",
                  opacity: isActive ? 1 : 0.82,
                  transition: "transform 0.3s ease, opacity 0.3s ease",
                  paddingBottom: 6,
                }}
              >
                <ItineraryCard itin={itin} index={index} recommended={recommended} active={isActive} constraintObject={constraintObject} />
              </div>
            );
          })}
        </div>

        {/* dot indicators (below the carousel) */}
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 14, marginBottom: 18 }}>
          {ordered.map(({ itin }, pos) => (
            <button
              key={pos}
              onClick={() => goTo(pos)}
              aria-label={`Go to itinerary ${pos + 1}`}
              style={{
                width: active === pos ? 24 : 8,
                height: 8,
                borderRadius: 99,
                border: "none",
                cursor: "pointer",
                padding: 0,
                background: active === pos ? (itin.color ?? C.coral) : "#CBD2DE",
                transition: "width 0.22s ease, background 0.22s ease",
              }}
            />
          ))}
        </div>

        <div style={{ textAlign: "center", fontFamily: FONT.sans, fontSize: 13, color: C.muted, margin: "4px 0 12px" }}>or</div>
        <PrimaryButton variant="outline" onClick={() => navigate("/flights")}>🧭 Build it yourself step-by-step →</PrimaryButton>

        <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, textAlign: "center", marginTop: 14 }}>
          Demo · mock data — prices and availability are illustrative only
        </div>
      </div>
    </div>
  );
}

const costLabel = { fontFamily: FONT.sans, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 };
const divider = { height: 1, background: C.cardAlt, margin: "14px 0" };
const sectionTitle = { fontFamily: FONT.sans, fontSize: 12, fontWeight: 800, color: C.body, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 9, display: "flex", alignItems: "center", gap: 6 };
const countBadge = { fontFamily: FONT.sans, fontSize: 11, background: C.cardAlt, color: C.body, padding: "1px 8px", borderRadius: 99, fontWeight: 700, textTransform: "none", letterSpacing: 0 };
const expRow = { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 };
const ellip = { fontFamily: FONT.sans, fontSize: 13, color: C.ink, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
