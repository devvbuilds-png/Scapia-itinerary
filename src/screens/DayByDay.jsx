// ─── DAY-BY-DAY ITINERARY VIEW ───────────────────────────────────────────────
// Horizontal pill nav: one pill per day, tapping a pill swaps the content area.
// Entry: auto → { itinIndex }, manual → { flow: 'manual' }.

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { ScapiaHeader, Badge, CoinPill, CoinMedallion, PrimaryButton } from "../components/ui";
import { cityImage, hotelImage, experienceImage } from "../data/images";
import { C, FONT, RADIUS, SHADOW, PAGE_PAD, HERO_BLEED, STICKY_BELOW_HEADER } from "../theme";

const FOOD_DINING_CATS = new Set(["Food", "Dining"]);
const SLOT_ORDER = { "early-morning": 0, morning: 1, midday: 2, afternoon: 3, evening: 4, night: 5 };
const SLOT_LABELS = {
  "early-morning": "🌅 Early morning", morning: "☀️ Morning", midday: "🌤 Midday",
  afternoon: "🌇 Afternoon", evening: "🌆 Evening", night: "🌙 Night",
};
const CAT_TONE = { Adventure: "coral", Culture: "gold", Food: "gold", Dining: "purple", Nightlife: "blue", Wellness: "green", Leisure: "green" };
const DAY_TYPE_STYLES = {
  arrival:    { dot: C.green,  label: "Arrival" },
  full:       { dot: C.coral,  label: "Full day" },
  transition: { dot: C.blue,   label: "City switch" },
  departure:  { dot: C.goldDeep, label: "Departure" },
};

function getAllDates(startStr, endStr) {
  const dates = [];
  const d = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  while (d <= end) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}
function fmtDay(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
function fmtShort(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
const fmtPill = fmtShort;

function buildDayPlan(itin, constraintObject) {
  const { cityStays, requiredFlightLegs, startDate, endDate } = constraintObject;
  if (!cityStays?.length || !startDate || !endDate) return [];

  const activities = itin.activities ?? (itin.experiences ?? []).filter((e) => !FOOD_DINING_CATS.has(e.category));
  const foodDining = itin.foodDining ?? (itin.experiences ?? []).filter((e) => FOOD_DINING_CATS.has(e.category));

  const flightLegs = itin.flightLegs?.length ? itin.flightLegs : (requiredFlightLegs ?? []);
  const flightSelections = itin.flightSelections ?? {};

  const flightByDate = {};
  for (const leg of flightLegs) {
    if (leg.date) flightByDate[leg.date] = { leg, flight: flightSelections[leg.id] ?? null };
  }

  const actQueues = {};
  const diningQueues = {};
  for (const cs of cityStays) {
    actQueues[cs.city] = [...activities.filter((e) => e.city === cs.city)];
    diningQueues[cs.city] = [...foodDining.filter((e) => e.city === cs.city)];
  }

  const assigned = {};
  const initDate = (d) => { if (!assigned[d]) assigned[d] = { activities: [], dining: [] }; };

  for (let csIdx = 0; csIdx < cityStays.length; csIdx++) {
    const cs = cityStays[csIdx];
    const isFirstCity = csIdx === 0;
    const isLastCity = csIdx === cityStays.length - 1;
    const actList = actQueues[cs.city];
    const diningList = diningQueues[cs.city];
    const allCityDates = getAllDates(cs.checkIn, cs.checkOut);

    const actDates = allCityDates.filter((_, i) => {
      if (i === 0 && !isFirstCity) return false;
      if (i === allCityDates.length - 1 && isLastCity) return false;
      return true;
    });

    const diningDates = allCityDates.filter((date, i) => {
      if (i === allCityDates.length - 1 && isLastCity) return false;
      const fi = flightByDate[date];
      if (fi && (fi.leg.type === "intercity" || fi.leg.type === "exit") && date === cs.checkOut) return false;
      return true;
    });

    let actIdx = 0;
    for (let d = 0; d < actDates.length; d++) {
      if (actIdx >= actList.length) break;
      const date = actDates[d];
      initDate(date);
      assigned[date].activities.push(actList[actIdx++]);
      const isFullDay = !flightByDate[date];
      if (isFullDay && actIdx < actList.length) {
        const remainingDays = actDates.length - d - 1;
        if (actList.length - actIdx > remainingDays) assigned[date].activities.push(actList[actIdx++]);
      }
    }
    if (actIdx < actList.length && actDates.length > 0) {
      const last = actDates[actDates.length - 1];
      while (actIdx < actList.length) { initDate(last); assigned[last].activities.push(actList[actIdx++]); }
    }

    let diningIdx = 0;
    for (const date of diningDates) {
      if (diningIdx >= diningList.length) break;
      initDate(date);
      assigned[date].dining.push(diningList[diningIdx++]);
    }
  }

  const dateToCities = {};
  for (const cs of cityStays) {
    for (const date of getAllDates(cs.checkIn, cs.checkOut)) {
      if (!dateToCities[date]) dateToCities[date] = [];
      if (!dateToCities[date].find((c) => c.city === cs.city)) dateToCities[date].push(cs);
    }
  }

  return getAllDates(startDate, endDate).map((date, idx) => {
    const csList = dateToCities[date] ?? [];
    const primaryCS = csList[0] ?? null;
    const secondaryCS = csList[1] ?? null;
    const fi = flightByDate[date];
    const dayAssigned = assigned[date] ?? { activities: [], dining: [] };

    let dayType = "full";
    if (fi?.leg?.type === "entry") dayType = "arrival";
    else if (fi?.leg?.type === "exit") dayType = "departure";
    else if (fi?.leg?.type === "intercity") dayType = "transition";

    const cityLabel = secondaryCS && secondaryCS.city !== primaryCS?.city
      ? `${primaryCS?.cityName ?? "?"} → ${secondaryCS.cityName}`
      : (primaryCS?.cityName ?? "In transit");

    const slots = [];
    const add = (slot, type, icon, item, extra = {}) => slots.push({ slot, type, icon, item, ...extra });

    if (fi?.leg?.type === "entry" && fi.flight) add("early-morning", "flight", "🛫", fi.flight, { leg: fi.leg });
    if (primaryCS && date === primaryCS.checkIn && itin.stays?.[primaryCS.city])
      add(fi?.leg?.type === "entry" ? "afternoon" : "morning", "hotel_checkin", "🏨", itin.stays[primaryCS.city], { cs: primaryCS });
    if (primaryCS && date === primaryCS.checkOut && date !== primaryCS.checkIn && itin.stays?.[primaryCS.city])
      add("morning", "hotel_checkout", "🏨", itin.stays[primaryCS.city], { cs: primaryCS });

    dayAssigned.activities.forEach((act, i) => {
      let actSlot;
      if (act.category === "Nightlife") actSlot = "evening";
      else if (dayType === "departure" || dayType === "transition") actSlot = "morning";
      else if (dayType === "arrival") actSlot = "afternoon";
      else actSlot = i === 0 ? "morning" : "afternoon";
      add(actSlot, "activity", "🎯", act);
    });

    if (fi?.leg?.type === "intercity" && fi.flight) add("midday", "flight", "✈️", fi.flight, { leg: fi.leg });
    if (secondaryCS && date === secondaryCS.checkIn && itin.stays?.[secondaryCS.city])
      add("afternoon", "hotel_checkin", "🏨", itin.stays[secondaryCS.city], { cs: secondaryCS });
    dayAssigned.dining.forEach((dining) => add("evening", "dining", "🍽️", dining));
    if (fi?.leg?.type === "exit" && fi.flight) add("afternoon", "flight", "🛬", fi.flight, { leg: fi.leg });

    slots.sort((a, b) => (SLOT_ORDER[a.slot] ?? 9) - (SLOT_ORDER[b.slot] ?? 9));

    return { date, dayNum: idx + 1, dayType, cityLabel, primaryCS, secondaryCS, slots,
      isFirst: idx === 0, isLast: idx === getAllDates(startDate, endDate).length - 1 };
  });
}

// ── slot cards ──
function FlightSlotCard({ item, leg, themeColor }) {
  if (!item) return null;
  const coins = item.coinsEarned ?? Math.round(item.pricePerPerson * 0.2);
  const typeLabel = leg?.type === "entry" ? "Departure flight" : leg?.type === "exit" ? "Return flight" : "Intercity flight";
  return (
    <div style={{ ...slotCard, borderLeftColor: themeColor }}>
      <div style={slotTop}>
        <Badge tone="coral">{typeLabel}</Badge>
        <span style={meta}>{item.duration} · {item.stops === 0 ? "Direct" : `${item.stops} stop`}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 800, color: C.ink }}>{leg?.fromName ?? item.from}</span>
        <span style={{ color: C.muted, fontWeight: 700 }}>→</span>
        <span style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 800, color: C.ink }}>{leg?.toName ?? item.to}</span>
      </div>
      <div style={meta}>{item.airline} · {item.flightNo}</div>
      <div style={priceRow}>
        <span style={price}>₹{item.pricePerPerson.toLocaleString("en-IN")} /person</span>
        <CoinPill amount={coins} />
      </div>
    </div>
  );
}

function HotelSlotCard({ item, cs, isCheckout }) {
  if (!item) return null;
  const coins = item.coinsEarned ?? Math.round((item.totalCost ?? 0) * 0.2);
  return (
    <div style={{ ...slotCard, borderLeftColor: C.blue, display: "flex", gap: 11 }}>
      <div style={{ width: 52, height: 52, borderRadius: RADIUS.sm, flexShrink: 0, backgroundImage: `url(${hotelImage(item)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={slotTop}>
          <Badge tone="blue">{isCheckout ? "Check out" : "Check in"}</Badge>
          <span style={meta}>{"★".repeat(item.stars ?? 0)}</span>
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{item.name}</div>
        {!isCheckout ? (
          <div style={priceRow}>
            <span style={price}>₹{item.pricePerNight?.toLocaleString("en-IN")} /night</span>
            <CoinPill amount={coins} />
          </div>
        ) : (
          <div style={meta}>{cs?.nights} night{cs?.nights !== 1 ? "s" : ""} · {fmtShort(item.checkIn)} → {fmtShort(item.checkOut)}</div>
        )}
      </div>
    </div>
  );
}

function ExpSlotCard({ item }) {
  if (!item) return null;
  const coins = item.coinsEarned ?? Math.round(item.pricePerPerson * 0.2);
  const isFood = FOOD_DINING_CATS.has(item.category);
  return (
    <div style={{ ...slotCard, borderLeftColor: isFood ? C.purple : C.coral, display: "flex", gap: 11 }}>
      <div style={{ width: 52, height: 52, borderRadius: RADIUS.sm, flexShrink: 0, backgroundImage: `url(${experienceImage(item)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={slotTop}>
          <Badge tone={CAT_TONE[item.category] || "navy"}>{item.category}</Badge>
          <span style={meta}>{item.duration}</span>
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 3 }}>{item.name}</div>
        <div style={priceRow}>
          <span style={price}>₹{item.pricePerPerson.toLocaleString("en-IN")} /person</span>
          <CoinPill amount={coins} />
        </div>
        {item.aiReason && <div style={reasonLine}>✦ {item.aiReason}</div>}
      </div>
    </div>
  );
}

export default function DayByDay() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { autoItineraries, manualItinerary, constraintObject, selectedUser, setManualItinerary, saveToWishlist } = useApp();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (!constraintObject) {
    return (
      <div style={{ minHeight: "100dvh", paddingBottom: PAGE_PAD }}>
        <div style={{ padding: 32, textAlign: "center", fontFamily: FONT.sans }}>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>No itinerary found. Complete onboarding first.</div>
          <PrimaryButton variant="coral" full={false} onClick={() => navigate("/summary")}>← Back</PrimaryButton>
        </div>
      </div>
    );
  }

  const isManual = state?.flow === "manual";
  const itinIndex = parseInt(state?.itinIndex ?? 0, 10);
  let itin, themeColor, themeName, backPath;

  if (isManual) {
    itin = {
      flightSelections: manualItinerary.flightSelections ?? {},
      flightLegs: manualItinerary.flightLegs ?? [],
      stays: manualItinerary.stays ?? {},
      activities: (manualItinerary.experiences ?? []).filter((e) => !FOOD_DINING_CATS.has(e.category)),
      foodDining: (manualItinerary.experiences ?? []).filter((e) => FOOD_DINING_CATS.has(e.category)),
      experiences: manualItinerary.experiences ?? [],
      cityStays: constraintObject.cityStays,
    };
    themeColor = C.coral;
    themeName = "Your Itinerary";
    backPath = "/itinerary";
  } else {
    itin = autoItineraries?.[itinIndex];
    if (!itin) {
      return (
        <div style={{ minHeight: "100dvh", paddingBottom: PAGE_PAD }}>
          <div style={{ padding: 32, textAlign: "center", fontFamily: FONT.sans }}>
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>Itinerary not found.</div>
            <PrimaryButton variant="coral" full={false} onClick={() => navigate("/auto-compare")}>← Back</PrimaryButton>
          </div>
        </div>
      );
    }
    themeColor = itin.color ?? C.coral;
    themeName = itin.name ?? "Itinerary";
    backPath = "/auto-compare";
  }

  const days = buildDayPlan(itin, constraintObject);
  const selectedDay = days[Math.min(selectedDayIdx, days.length - 1)];
  const cityNames = constraintObject.cityStays?.map((cs) => cs.cityName).join(" + ") ?? "";
  const dtStyle = DAY_TYPE_STYLES[selectedDay?.dayType ?? "full"];
  const heroCity = constraintObject.cityStays?.[0]?.city || constraintObject.cities[0] || "BKK";

  const handleSave = () => {
    saveToWishlist({ type: "auto", theme: itin.name, ...itin, constraintObject, user: selectedUser?.name });
    alert("Saved to My Itineraries! 🎉");
  };
  const handleCustomise = () => {
    setManualItinerary({
      flightSelections: itin.flightSelections, flightLegs: itin.flightLegs, flightTotal: itin.flightTotal,
      stays: itin.stays, stayTotal: itin.stayTotal, experiences: itin.experiences, expTotal: itin.expTotal,
      inboundFlight: Object.values(itin.flightSelections).find((f) => f.legType === "entry") ?? null,
      returnFlight: Object.values(itin.flightSelections).find((f) => f.legType === "exit") ?? null,
      intercityFlights: Object.values(itin.flightSelections).filter((f) => f.legType === "intercity"),
    });
    navigate("/flights");
  };

  const coinBalance = selectedUser?.coinBalance ?? 0;
  const existingRupees = Math.round(coinBalance / 5);
  const rupeesSaved = !isManual ? Math.min(existingRupees, itin.perPersonTotal) : 0;
  const finalPayable = !isManual ? itin.perPersonTotal - rupeesSaved : 0;
  const coinsEarned = !isManual ? Math.round(finalPayable * 0.2) : 0;

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: PAGE_PAD }}>
      <ScapiaHeader accent="itinerary" onBack={() => navigate(backPath)} transparent />

      {/* immersive themed hero (bleeds up under the transparent header) */}
      <div style={{ position: "relative", height: 200, marginTop: HERO_BLEED, backgroundImage: `url(${cityImage(heroCity)})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${themeColor}D9 0%, ${themeColor}A6 55%, rgba(8,14,26,0.5) 100%)` }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, color: "#fff", fontFamily: FONT.sans }}>
          <div style={{ fontSize: 21, fontWeight: 800 }}>🗓️ Day-by-day</div>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 10 }}>{themeName}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[cityNames, `${days.length} days`, `${fmtShort(constraintObject.startDate)} → ${fmtShort(constraintObject.endDate)}`].map((t, i) => (
              <span key={i} style={{ background: "rgba(8,14,26,0.3)", borderRadius: 20, padding: "4px 11px", fontSize: 12, fontWeight: 600, backdropFilter: "blur(4px)" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* sticky pill row — sits just under the sticky header */}
      <div style={{ position: "sticky", top: STICKY_BELOW_HEADER, zIndex: 20, background: "rgba(247,249,252,0.92)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <div className="no-scrollbar" style={{ display: "flex", gap: 7, padding: "10px 14px", overflowX: "auto" }}>
          {days.map((day, i) => {
            const ts = DAY_TYPE_STYLES[day.dayType];
            const active = selectedDayIdx === i;
            return (
              <button key={day.date} onClick={() => setSelectedDayIdx(i)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "7px 11px",
                  background: active ? ts.dot : C.card, border: active ? `1.5px solid ${ts.dot}` : `1.5px solid ${C.line}`,
                  borderRadius: RADIUS.md, cursor: "pointer", flexShrink: 0, minWidth: 54, fontFamily: FONT.sans,
                }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: active ? "#fff" : C.body }}>Day {day.dayNum}</div>
                <div style={{ fontSize: 10, color: active ? "rgba(255,255,255,0.9)" : C.muted }}>{fmtPill(day.date)}</div>
                <div style={{ width: 5, height: 5, borderRadius: "50%", marginTop: 3, background: active ? "rgba(255,255,255,0.6)" : ts.dot }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* day content */}
      {selectedDay ? (
        <div style={{ padding: "14px 14px 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderLeft: `3px solid ${dtStyle.dot}`, paddingLeft: 11, marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 2 }}>Day {selectedDay.dayNum} · {fmtDay(selectedDay.date)}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub, fontWeight: 500 }}>{selectedDay.cityLabel}</div>
            </div>
            <span style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 800, padding: "4px 9px", borderRadius: RADIUS.pill, textTransform: "uppercase", letterSpacing: 0.3, flexShrink: 0, background: dtStyle.dot + "22", color: dtStyle.dot }}>{dtStyle.label}</span>
          </div>

          {selectedDay.slots.length === 0 ? (
            <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.muted, fontStyle: "italic", padding: "16px 0", textAlign: "center" }}>Rest day — no scheduled items</div>
          ) : (
            selectedDay.slots.map((slot, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ width: 76, flexShrink: 0, paddingTop: 4, textAlign: "right" }}>
                  <span style={{ fontFamily: FONT.sans, fontSize: 10, color: C.muted, fontWeight: 700, lineHeight: 1.4 }}>{SLOT_LABELS[slot.slot] ?? slot.slot}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {slot.type === "flight" && <FlightSlotCard item={slot.item} leg={slot.leg} themeColor={themeColor} />}
                  {slot.type === "hotel_checkin" && <HotelSlotCard item={slot.item} cs={slot.cs} isCheckout={false} />}
                  {slot.type === "hotel_checkout" && <HotelSlotCard item={slot.item} cs={slot.cs} isCheckout={true} />}
                  {(slot.type === "activity" || slot.type === "dining") && <ExpSlotCard item={slot.item} />}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13, fontFamily: FONT.sans }}>No days found for this itinerary.</div>
      )}

      {/* coins + actions (auto) */}
      {!isManual && itin && (
        <div style={{ padding: "4px 14px 8px" }}>
          <div style={{ background: C.goldSoft, borderRadius: RADIUS.lg, padding: "14px", marginBottom: 12, boxShadow: SHADOW.cardSoft }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CoinMedallion size={20} />
              <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, color: C.goldDeep }}>Scapia Coins</span>
            </div>
            <div style={{ display: "flex", alignItems: "stretch", marginBottom: 11 }}>
              {[
                { l: "Trip cost / person", v: `₹${itin.perPersonTotal.toLocaleString("en-IN")}`, c: C.ink },
                { l: "Redeem from balance", v: `− ₹${rupeesSaved.toLocaleString("en-IN")}`, c: C.green },
                { l: "You pay", v: `₹${finalPayable.toLocaleString("en-IN")}`, c: C.ink, bold: true },
              ].map((it, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", borderLeft: i ? "1px solid #E7C97A" : "none", padding: "0 6px" }}>
                  <div style={{ fontFamily: FONT.sans, fontSize: 10, color: C.goldDeep, opacity: 0.75, marginBottom: 3 }}>{it.l}</div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: it.bold ? 800 : 700, color: it.c }}>{it.v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.goldDeep, paddingTop: 9, borderTop: "1px dashed #E7C97A", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span>Earn on this booking</span>
              <CoinPill amount={coinsEarned} />
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: 10, color: C.goldDeep, opacity: 0.65, marginTop: 6 }}>Coins, prices and savings are illustrative — demo mock data only.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <PrimaryButton variant="coral" onClick={handleSave} style={{ background: themeColor, boxShadow: "none" }}>♡ Save to My Itineraries</PrimaryButton>
            <PrimaryButton variant="navy" onClick={handleCustomise}>✏️ Customise this trip →</PrimaryButton>
            <PrimaryButton variant="ghost" onClick={() => navigate("/auto-compare")}>← Compare all 3 options</PrimaryButton>
          </div>
        </div>
      )}

      {isManual && (
        <div style={{ padding: "4px 14px 8px" }}>
          <PrimaryButton variant="coral" onClick={() => navigate("/itinerary")}>← Back to summary</PrimaryButton>
        </div>
      )}

      <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, textAlign: "center", padding: "8px 16px 0" }}>Demo · mock data — not real availability or pricing</div>
    </div>
  );
}

const slotCard = { background: C.card, borderRadius: RADIUS.md, padding: "11px 12px", borderLeft: "3px solid", boxShadow: SHADOW.cardSoft };
const slotTop = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 };
const meta = { fontFamily: FONT.sans, fontSize: 11, color: C.muted };
const priceRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 };
const price = { fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 700, color: C.ink };
const reasonLine = { fontFamily: FONT.sans, fontSize: 11, color: C.sub, fontStyle: "italic", marginTop: 6, paddingTop: 5, borderTop: `1px solid ${C.cardAlt}`, lineHeight: 1.4 };
