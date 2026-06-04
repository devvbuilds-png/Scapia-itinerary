import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { EXPERIENCES } from "../data/inventory";
import AIPicksBanner from "../components/AIPicksBanner";
import { ScapiaHeader, PrimaryButton, Badge, CoinPill, MediaCard } from "../components/ui";
import { experienceImage } from "../data/images";
import { C, FONT, RADIUS, NAV_SAFE_PAD } from "../theme";

const CATEGORIES = [
  { id: "All",       label: "All",       emoji: "🗺️" },
  { id: "Adventure", label: "Adventure", emoji: "🏄" },
  { id: "Food",      label: "Food",      emoji: "🍜" },
  { id: "Dining",    label: "Dining",    emoji: "🍽️" },
  { id: "Culture",   label: "Culture",   emoji: "🏛️" },
  { id: "Wellness",  label: "Wellness",  emoji: "🧘" },
  { id: "Nightlife", label: "Nightlife", emoji: "🌃" },
  { id: "Leisure",   label: "Leisure",   emoji: "🏖️" },
];

const CAT_TONE = {
  Adventure: "coral", Food: "gold", Dining: "purple", Culture: "gold",
  Wellness: "green", Nightlife: "blue", Leisure: "green",
};

function BudgetMeter({ used, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const over = used > total;
  const barColor = over ? "#dc2626" : pct > 85 ? C.gold : C.coral;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5, fontFamily: FONT.sans }}>
        <span style={{ color: C.sub, fontWeight: 600 }}>Experience spend vs allocation</span>
        <span style={{ fontWeight: 700, color: over ? "#dc2626" : C.body }}>
          ₹{used.toLocaleString("en-IN")} / ₹{total.toLocaleString("en-IN")}{over ? " ⚠️" : ` (${pct}%)`}
        </span>
      </div>
      <div style={{ height: 7, background: C.cardAlt, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 99, transition: "width 0.35s ease" }} />
      </div>
    </div>
  );
}

function ExperienceCard({ exp, rank, isSelected, onToggle, showAIPick }) {
  const isAIPick = showAIPick && rank < 3;
  const coins = Math.round(exp.pricePerPerson * 0.2);
  return (
    <MediaCard
      image={experienceImage(exp)}
      imageHeight={158}
      selected={isSelected}
      onClick={onToggle}
      topLeft={isAIPick ? <Badge tone="coral" icon="✨">AI Pick #{rank + 1}</Badge> : null}
      topRight={
        <div style={{ width: 26, height: 26, borderRadius: 8, background: isSelected ? C.coral : "rgba(255,255,255,0.92)", border: isSelected ? "none" : `1.5px solid #fff`, display: "flex", alignItems: "center", justifyContent: "center", color: isSelected ? "#fff" : C.ink, fontWeight: 900, fontSize: 14 }}>
          {isSelected ? "✓" : ""}
        </div>
      }
      imageBottomLeft={<Badge tone="dark" icon="📍">{exp.cityName}</Badge>}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <Badge tone={CAT_TONE[exp.category] || "navy"}>{exp.category}</Badge>
        <span style={{ fontFamily: FONT.sans, fontSize: 11.5, color: C.muted }}>⏱ {exp.duration}</span>
      </div>
      <div style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 800, color: C.ink, lineHeight: 1.25, marginBottom: 5 }}>{exp.name}</div>
      <div style={{ fontFamily: FONT.sans, fontSize: 12.5, color: C.sub, marginBottom: 10, lineHeight: 1.45 }}>{exp.desc}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: exp.aiReason ? 10 : 0 }}>
        <div>
          <span style={{ fontFamily: FONT.sans, fontSize: 17, fontWeight: 800, color: C.ink }}>₹{exp.pricePerPerson.toLocaleString("en-IN")}</span>
          <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.muted }}>/person</span>
        </div>
        <CoinPill amount={coins} />
      </div>

      {exp.aiReason && (
        <div style={{ display: "flex", gap: 6, background: C.greenSoft, borderRadius: RADIUS.sm, padding: "8px 10px", marginBottom: 8, fontFamily: FONT.sans, fontSize: 12, color: C.green, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 800, flexShrink: 0 }}>Why:</span><span>{exp.aiReason}</span>
        </div>
      )}

      {exp.aiScore != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, width: 22 }}>Fit</span>
          <div style={{ flex: 1, height: 5, background: C.cardAlt, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${exp.aiScore}%`, borderRadius: 99, background: exp.aiScore >= 75 ? C.coral : exp.aiScore >= 50 ? C.gold : "#ef4444" }} />
          </div>
          <span style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 800, color: C.body, width: 22, textAlign: "right" }}>{exp.aiScore}</span>
        </div>
      )}
    </MediaCard>
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

export default function Experiences() {
  const { constraintObject, scoredInventory, manualItinerary, setManualItinerary, selectedUser } = useApp();
  const navigate = useNavigate();
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIds, setSelectedIds] = useState(() => new Set((manualItinerary.experiences ?? []).map((e) => e.id)));

  if (!constraintObject) {
    navigate("/summary");
    return null;
  }

  const cityStays = constraintObject.cityStays ?? [];
  const activeCity = cityStays[activeCityIdx];
  const visitedCities = cityStays.map((cs) => cs.city);

  const visibleExperiences = useMemo(() => {
    if (!activeCity) return [];
    return EXPERIENCES
      .filter((e) => e.city === activeCity.city)
      .filter((e) => activeCategory === "All" || e.category === activeCategory)
      .map((e) => ({ ...e, aiScore: scoredInventory?.[e.id]?.score ?? null, aiReason: scoredInventory?.[e.id]?.reason ?? "" }))
      .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  }, [activeCity, activeCategory, scoredInventory]);

  const availableCategoryIds = useMemo(() => {
    if (!activeCity) return ["All"];
    const cats = new Set(EXPERIENCES.filter((e) => e.city === activeCity.city).map((e) => e.category));
    return ["All", ...CATEGORIES.filter((c) => c.id !== "All" && cats.has(c.id)).map((c) => c.id)];
  }, [activeCity]);

  const selectedExperiences = useMemo(() =>
    EXPERIENCES
      .filter((e) => visitedCities.includes(e.city) && selectedIds.has(e.id))
      .map((e) => ({ ...e, aiScore: scoredInventory?.[e.id]?.score ?? null, aiReason: scoredInventory?.[e.id]?.reason ?? "" })),
  [selectedIds, scoredInventory, visitedCities]);

  const expTotal = selectedExperiences.reduce((sum, e) => sum + e.pricePerPerson, 0);
  const expCoins = Math.round(expTotal * 0.2);

  const cityExpCounts = useMemo(() => {
    const counts = {};
    selectedExperiences.forEach((e) => { counts[e.city] = (counts[e.city] ?? 0) + 1; });
    return counts;
  }, [selectedExperiences]);

  const toggleExp = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    setManualItinerary((prev) => ({ ...prev, experiences: selectedExperiences, expTotal }));
    navigate("/itinerary");
  };

  const perPersonExpBudget = constraintObject.expBudget;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: NAV_SAFE_PAD }}>
      <ScapiaHeader accent="experiences" onBack={() => navigate("/stays")} />

      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 24, color: C.ink, marginBottom: 2 }}>Do the bucket-list stuff</div>
        <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.sub, marginBottom: 12 }}>Add experiences — top 3 per city are AI picks</div>

        <AIPicksBanner />

        <div style={{ display: "flex", alignItems: "center", background: C.card, border: `1px solid ${C.line}`, borderRadius: RADIUS.md, padding: "11px 14px", marginTop: 12, marginBottom: 10 }}>
          <ContextItem label="Exp. budget/pp" value={`₹${perPersonExpBudget.toLocaleString("en-IN")}`} />
          <div style={{ width: 1, height: 32, background: C.line, margin: "0 12px" }} />
          <ContextItem label="Budget split" value={`${Math.round(constraintObject.splitExp * 100)}%`} />
          <div style={{ width: 1, height: 32, background: C.line, margin: "0 12px" }} />
          <ContextItem label="Selected" value={`${selectedIds.size} picks`} />
        </div>

        <BudgetMeter used={expTotal} total={constraintObject.expBudget} />

        <div style={{ background: C.greenSoft, borderRadius: RADIUS.md, padding: "9px 12px", fontFamily: FONT.sans, fontSize: 12, color: C.green, lineHeight: 1.5, marginBottom: 10 }}>
          <span style={{ fontWeight: 800 }}>Budget logic: </span>{constraintObject.expReason}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.muted }}>Scoring for:</span>
          <Badge tone="navy">{selectedUser.name}</Badge>
          <Badge tone="blue">Vibe: {constraintObject.effectiveVibeLabel}</Badge>
          <Badge tone="gold">Food: {constraintObject.effectiveFood}</Badge>
        </div>

        {/* city tabs */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cityStays.length}, 1fr)`, gap: 8, marginBottom: 12 }}>
          {cityStays.map((cs, idx) => {
            const active = idx === activeCityIdx;
            return (
              <button key={cs.city} onClick={() => { setActiveCityIdx(idx); setActiveCategory("All"); }}
                style={{
                  minHeight: 54, padding: "8px 6px", borderRadius: RADIUS.md,
                  border: active ? `1.5px solid ${C.coral}` : `1.5px solid ${C.line}`,
                  background: active ? C.coralSoft : C.card, color: active ? C.coralDark : C.body,
                  cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 3, fontFamily: FONT.sans,
                }}>
                <span style={{ fontSize: 12.5, fontWeight: 800 }}>{cs.cityName}</span>
                {cityExpCounts[cs.city] ? (
                  <span style={{ fontSize: 10, fontWeight: 700, background: C.green, color: "#fff", padding: "2px 7px", borderRadius: 99 }}>{cityExpCounts[cs.city]} picked</span>
                ) : (
                  <span style={{ fontSize: 11, opacity: 0.6 }}>browse</span>
                )}
              </button>
            );
          })}
        </div>

        {/* category chips */}
        <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
          {availableCategoryIds.map((catId) => {
            const cat = CATEGORIES.find((c) => c.id === catId);
            const active = activeCategory === catId;
            return (
              <button key={catId} onClick={() => setActiveCategory(catId)}
                style={{
                  flexShrink: 0, padding: "7px 13px", borderRadius: RADIUS.pill,
                  border: active ? `1.5px solid ${C.coral}` : `1.5px solid ${C.line}`,
                  background: active ? C.coral : C.card, color: active ? "#fff" : C.body,
                  fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                }}>
                {cat?.emoji} {cat?.label ?? catId}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {visibleExperiences.map((exp, idx) => (
            <ExperienceCard key={exp.id} exp={exp} rank={idx} isSelected={selectedIds.has(exp.id)} onToggle={() => toggleExp(exp.id)} showAIPick={!!scoredInventory} />
          ))}
          {visibleExperiences.length === 0 && (
            <div style={{ background: C.goldSoft, borderRadius: RADIUS.md, padding: 14, fontSize: 13, color: C.goldDeep, fontFamily: FONT.sans }}>No experiences found for this filter.</div>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: RADIUS.lg, padding: "14px 15px", marginTop: 16, fontFamily: FONT.sans }}>
            <div style={totalRow}>
              <span style={{ fontWeight: 700, color: C.ink }}>Per person · experiences ({selectedIds.size})</span>
              <span style={{ fontWeight: 800, color: C.ink, fontSize: 16 }}>₹{expTotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ ...totalRow, marginBottom: 0 }}>
              <span style={{ color: C.sub }}>Coins you'll earn (per person)</span>
              <CoinPill amount={expCoins} />
            </div>
            {expTotal > perPersonExpBudget && (
              <div style={{ fontSize: 12, color: C.goldDeep, background: C.goldSoft, borderRadius: RADIUS.sm, padding: "7px 10px", marginTop: 8 }}>
                Over your per-person experience budget by ₹{(expTotal - perPersonExpBudget).toLocaleString("en-IN")} — you can still continue.
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <PrimaryButton variant="coral" onClick={handleConfirm}>
            {selectedIds.size === 0 ? "Continue without experiences →" : `View itinerary (${selectedIds.size} experience${selectedIds.size !== 1 ? "s" : ""}) →`}
          </PrimaryButton>
        </div>

        <div style={{ textAlign: "center", fontFamily: FONT.sans, fontSize: 11, color: C.muted, marginTop: 18, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          Demo · mock data — sample inventory, not live availability or pricing
        </div>
      </div>
    </div>
  );
}

const totalRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 13 };
