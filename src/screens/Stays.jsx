import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { HOTELS } from "../data/inventory";
import AIPicksBanner from "../components/AIPicksBanner";
import { ScapiaHeader, PrimaryButton, Badge, CoinPill, MediaCard } from "../components/ui";
import { hotelImage } from "../data/images";
import { C, FONT, RADIUS, PAGE_PAD } from "../theme";

function Stars({ count, max = 5 }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < count ? C.gold : "#D9DEE8", fontSize: 13 }}>★</span>
      ))}
    </span>
  );
}

const STAY_TONE = { Budget: "green", Mid: "blue", Luxury: "purple" };

function BudgetMeter({ used, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const over = used > total;
  const barColor = over ? "#dc2626" : pct > 85 ? C.gold : C.coral;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5, fontFamily: FONT.sans }}>
        <span style={{ color: C.sub, fontWeight: 600 }}>Stay spend vs allocation</span>
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

function HotelCard({ hotel, rank, nights, isSelected, onSelect, showAIPick, roomShare }) {
  const isAIPick = showAIPick && rank < 3;
  const totalCost = hotel.pricePerNight * nights;
  const perPersonCost = roomShare > 1 ? Math.round(totalCost / roomShare) : null;
  const coinsEarned = Math.round(totalCost * 0.2);

  return (
    <MediaCard
      image={hotelImage(hotel)}
      imageHeight={160}
      selected={isSelected}
      onClick={onSelect}
      topLeft={isAIPick ? <Badge tone="coral" icon="✨">AI Pick #{rank + 1}</Badge> : null}
      topRight={isSelected ? <Badge tone="coral">✓ Selected</Badge> : null}
      imageBottomLeft={<Badge tone="dark" icon="📍">{hotel.cityName}</Badge>}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 16, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>{hotel.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Stars count={hotel.stars} />
            <Badge tone={STAY_TONE[hotel.stayAxis] || "navy"}>{hotel.stayAxis}</Badge>
          </div>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: isSelected ? `2px solid ${C.coral}` : "2px solid #CBD2DE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isSelected && <div style={{ width: 11, height: 11, borderRadius: "50%", background: C.coral }} />}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "10px 0" }}>
        {hotel.amenities.slice(0, 4).map((a) => (
          <span key={a} style={{ fontFamily: FONT.sans, fontSize: 11, background: C.cardAlt, color: C.body, padding: "3px 8px", borderRadius: RADIUS.pill, border: `1px solid ${C.line}` }}>{a}</span>
        ))}
      </div>

      <div style={{ fontFamily: FONT.sans, fontSize: 12.5, color: C.sub, marginBottom: 10, lineHeight: 1.45 }}>{hotel.desc}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <div>
          <span style={{ fontFamily: FONT.sans, fontSize: 18, fontWeight: 800, color: C.ink }}>₹{hotel.pricePerNight.toLocaleString("en-IN")}</span>
          <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.muted }}>/night</span>
          {nights > 0 && <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.body }}> × {nights}n = <strong>₹{totalCost.toLocaleString("en-IN")}</strong></span>}
          {perPersonCost && <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.sub, marginTop: 2 }}>₹{perPersonCost.toLocaleString("en-IN")} per person (shared room)</div>}
        </div>
        <CoinPill amount={coinsEarned} />
      </div>

      {hotel.aiReason && (
        <div style={{ display: "flex", gap: 6, background: C.greenSoft, borderRadius: RADIUS.sm, padding: "8px 10px", marginBottom: 8, fontFamily: FONT.sans, fontSize: 12, color: C.green, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 800, flexShrink: 0 }}>Why:</span><span>{hotel.aiReason}</span>
        </div>
      )}

      {hotel.aiScore != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, width: 22 }}>Fit</span>
          <div style={{ flex: 1, height: 5, background: C.cardAlt, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${hotel.aiScore}%`, borderRadius: 99, background: hotel.aiScore >= 75 ? C.coral : hotel.aiScore >= 50 ? C.gold : "#ef4444" }} />
          </div>
          <span style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 800, color: C.body, width: 22, textAlign: "right" }}>{hotel.aiScore}</span>
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

export default function Stays() {
  const { constraintObject, scoredInventory, manualItinerary, setManualItinerary, selectedUser } = useApp();
  const navigate = useNavigate();
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const [selections, setSelections] = useState(() => manualItinerary.stays ?? {});

  if (!constraintObject) {
    navigate("/summary");
    return null;
  }

  const cityStays = constraintObject.cityStays ?? [];
  const activeCity = cityStays[activeCityIdx];

  const hotelsForCity = useMemo(() => {
    if (!activeCity) return [];
    return HOTELS
      .filter((h) => h.city === activeCity.city)
      .map((h) => ({ ...h, aiScore: scoredInventory?.[h.id]?.score ?? null, aiReason: scoredInventory?.[h.id]?.reason ?? "" }))
      .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  }, [activeCity, scoredInventory]);

  const stayTotal = useMemo(() =>
    cityStays.reduce((sum, cs) => {
      const h = selections[cs.city];
      return sum + (h ? h.pricePerNight * cs.nights : 0);
    }, 0), [cityStays, selections]);

  const stayCoins = Math.round(stayTotal * 0.2);
  const completedCount = cityStays.filter((cs) => selections[cs.city]).length;
  const allSelected = completedCount === cityStays.length && cityStays.length > 0;
  const nextUnselected = cityStays.find((cs) => !selections[cs.city]);

  const handleSelect = (hotel) => {
    if (!activeCity) return;
    const newSel = { ...selections, [activeCity.city]: hotel };
    setSelections(newSel);
    const nextIdx = cityStays.findIndex((cs, i) => i > activeCityIdx && !newSel[cs.city]);
    if (nextIdx !== -1) setTimeout(() => setActiveCityIdx(nextIdx), 420);
  };

  const handleConfirm = () => {
    setManualItinerary((prev) => ({ ...prev, stays: selections, stayTotal }));
    navigate("/experiences");
  };

  const roomShare = constraintObject.roomShare ?? 1;
  const perPersonStayBudget = constraintObject.stayBudget;
  const stayPerPerson = Math.round(stayTotal / roomShare);

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: PAGE_PAD }}>
      <ScapiaHeader accent="stays" onBack={() => navigate("/flights")} />

      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 24, color: C.ink, marginBottom: 2 }}>Choose your stays</div>
        <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.sub, marginBottom: 12 }}>One hotel per city, ranked for your profile</div>

        <AIPicksBanner />

        {/* context strip */}
        <div style={{ display: "flex", alignItems: "center", background: C.card, border: `1px solid ${C.line}`, borderRadius: RADIUS.md, padding: "11px 14px", marginTop: 12, marginBottom: 10 }}>
          <ContextItem label="Stay budget/pp" value={`₹${perPersonStayBudget.toLocaleString("en-IN")}`} />
          <div style={{ width: 1, height: 32, background: C.line, margin: "0 12px" }} />
          <ContextItem label="Budget split" value={`${Math.round(constraintObject.splitStay * 100)}%`} />
          <div style={{ width: 1, height: 32, background: C.line, margin: "0 12px" }} />
          <ContextItem label="Cities done" value={`${completedCount} / ${cityStays.length}`} />
        </div>

        <BudgetMeter used={stayPerPerson} total={constraintObject.stayBudget} />

        <div style={{ background: C.greenSoft, borderRadius: RADIUS.md, padding: "9px 12px", fontFamily: FONT.sans, fontSize: 12, color: C.green, lineHeight: 1.5, marginBottom: 10 }}>
          <span style={{ fontWeight: 800 }}>Budget logic: </span>{constraintObject.stayReason}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.muted }}>Scoring for:</span>
          <Badge tone="navy">{selectedUser.name}</Badge>
          <Badge tone="purple">Stay: {constraintObject.effectiveStay}</Badge>
          <Badge tone="blue">Vibe: {constraintObject.effectiveVibeLabel}</Badge>
        </div>

        {/* city tabs */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cityStays.length}, 1fr)`, gap: 8, marginBottom: 14 }}>
          {cityStays.map((cs, idx) => {
            const active = idx === activeCityIdx;
            const done = !!selections[cs.city];
            return (
              <button key={cs.city} onClick={() => setActiveCityIdx(idx)}
                style={{
                  minHeight: 58, padding: "8px 6px", borderRadius: RADIUS.md,
                  border: active ? `1.5px solid ${C.coral}` : `1.5px solid ${C.line}`,
                  background: active ? C.coralSoft : C.card, color: active ? C.coralDark : C.body,
                  cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, fontFamily: FONT.sans,
                }}>
                <span style={{ fontSize: 12.5, fontWeight: 800 }}>{cs.cityName}</span>
                <span style={{ fontSize: 11, opacity: 0.8 }}>{cs.nights}n {done ? <span style={{ color: C.green }}>✓</span> : <span style={{ color: C.coral }}>*</span>}</span>
              </button>
            );
          })}
        </div>

        {activeCity && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 800, color: C.ink }}>{activeCity.cityName}</span>
            <span style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, color: C.sub }}>
              {activeCity.nights} night{activeCity.nights !== 1 ? "s" : ""} · {fmtDate(activeCity.checkIn)} – {fmtDate(activeCity.checkOut)}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {hotelsForCity.map((hotel, idx) => (
            <HotelCard key={hotel.id} hotel={hotel} rank={idx} nights={activeCity?.nights ?? 1}
              isSelected={selections[activeCity?.city]?.id === hotel.id}
              onSelect={() => handleSelect(hotel)} showAIPick={!!scoredInventory} roomShare={roomShare} />
          ))}
          {hotelsForCity.length === 0 && (
            <div style={{ background: C.goldSoft, borderRadius: RADIUS.md, padding: 14, fontSize: 13, color: C.goldDeep, fontFamily: FONT.sans }}>No hotels in inventory for this city.</div>
          )}
        </div>

        {/* running total */}
        {completedCount > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: RADIUS.lg, padding: "14px 15px", marginTop: 16, fontFamily: FONT.sans }}>
            {cityStays.map((cs) => {
              const h = selections[cs.city];
              if (!h) return null;
              const roomCost = h.pricePerNight * cs.nights;
              return (
                <div key={cs.city} style={totalRow}>
                  <span style={{ color: C.sub }}>{cs.cityName} · {h.name.length > 22 ? h.name.slice(0, 22) + "…" : h.name}</span>
                  <span style={{ fontWeight: 800, color: C.ink }}>₹{roomCost.toLocaleString("en-IN")}</span>
                </div>
              );
            })}
            <div style={{ borderTop: `1px solid ${C.line}`, margin: "9px 0" }} />
            <div style={totalRow}>
              <span style={{ fontWeight: 700, color: C.ink }}>Room cost ({completedCount}/{cityStays.length} cities)</span>
              <span style={{ fontWeight: 800, color: C.ink, fontSize: 16 }}>₹{stayTotal.toLocaleString("en-IN")}</span>
            </div>
            {roomShare > 1 && (
              <div style={totalRow}>
                <span style={{ color: C.coral, fontWeight: 700 }}>Per person (shared room)</span>
                <span style={{ fontWeight: 800, color: C.coral }}>₹{stayPerPerson.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div style={{ ...totalRow, marginBottom: 0 }}>
              <span style={{ color: C.sub }}>Coins you'll earn</span>
              <CoinPill amount={stayCoins} />
            </div>
            {stayPerPerson > constraintObject.stayBudget && (
              <div style={{ fontSize: 12, color: C.goldDeep, background: C.goldSoft, borderRadius: RADIUS.sm, padding: "7px 10px", marginTop: 8 }}>
                Over per-person stay budget by ₹{(stayPerPerson - constraintObject.stayBudget).toLocaleString("en-IN")} — you can still continue.
              </div>
            )}
          </div>
        )}

        {completedCount > 0 && !allSelected && nextUnselected && (
          <div style={{ background: C.blueSoft, borderRadius: RADIUS.md, padding: "10px 12px", fontSize: 13, color: C.blue, marginTop: 12, fontFamily: FONT.sans, fontWeight: 600 }}>
            👉 Next: pick a stay for <strong>{nextUnselected.cityName}</strong> ({nextUnselected.nights} nights).
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <PrimaryButton variant="coral" disabled={!allSelected} onClick={handleConfirm}>
            {allSelected ? "Confirm stays & choose experiences →" : nextUnselected ? `Pick stay for ${nextUnselected.cityName} to continue` : "Select a hotel for each city"}
          </PrimaryButton>
        </div>

        <div style={{ textAlign: "center", fontFamily: FONT.sans, fontSize: 11, color: C.muted, marginTop: 18, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          Demo · mock data — sample inventory, not live availability or pricing
        </div>
      </div>
    </div>
  );
}

function fmtDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const totalRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 13 };
