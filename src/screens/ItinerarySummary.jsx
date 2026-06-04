import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { ScapiaHeader, Card, PrimaryButton, CoinPill, CoinMedallion } from "../components/ui";
import { cityImage } from "../data/images";
import { C, FONT, RADIUS, SHADOW, NAV_SAFE_PAD, HERO_BLEED } from "../theme";

const CITY_NAMES = { BKK: "Bangkok", HKT: "Phuket", CNX: "Chiang Mai" };

function fmtINR(n) { return "₹" + (n ?? 0).toLocaleString("en-IN"); }
function fmtCoins(n) { return (n ?? 0).toLocaleString("en-IN") + " coins"; }

function LineItem({ label, sub, amount, coins, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "11px 0", borderBottom: `1px solid ${C.cardAlt}`, fontFamily: FONT.sans }}>
      <div style={{ paddingRight: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: highlight ? 800 : 600, color: highlight ? C.ink : C.body }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{amount}</div>
        {coins != null && <div style={{ fontSize: 11, color: C.goldDeep, fontWeight: 700, marginTop: 2 }}>+{fmtCoins(coins)}</div>}
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 800, color: C.sub, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
      {children}
    </Card>
  );
}

function BudgetBar({ label, budgeted, actual }) {
  const pct = budgeted > 0 ? Math.min(100, Math.round((actual / budgeted) * 100)) : 0;
  const over = actual > budgeted;
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, fontFamily: FONT.sans }}>
        <span style={{ color: C.sub }}>{label}</span>
        <span style={{ fontWeight: 700, color: over ? "#dc2626" : C.body }}>₹{actual.toLocaleString("en-IN")} / ₹{budgeted.toLocaleString("en-IN")}</span>
      </div>
      <div style={{ height: 6, background: C.cardAlt, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: over ? "#dc2626" : C.coral, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ItinerarySummary() {
  const { manualItinerary, constraintObject, selectedUser, saveToWishlist } = useApp();
  const navigate = useNavigate();

  if (!constraintObject) {
    navigate("/summary");
    return null;
  }

  const {
    flightSelections = {}, flightLegs = [], flightTotal = 0,
    stays = {}, stayTotal = 0, experiences = [], expTotal = 0,
  } = manualItinerary;

  const cityStays = constraintObject.cityStays ?? [];
  const roomShare = constraintObject.roomShare ?? 1;
  const stayPerPerson = Math.round(stayTotal / roomShare);

  const perPersonTotal = flightTotal + stayPerPerson + expTotal;

  const existingBalanceRupees = Math.floor(selectedUser.coinBalance / 5);
  const rupeesSaved = Math.min(existingBalanceRupees, perPersonTotal);
  const finalPayable = perPersonTotal - rupeesSaved;

  const coinsEarnedOnTrip = Math.round(finalPayable * 0.2);
  const coinsEarnedValue = Math.round(coinsEarnedOnTrip / 5);

  const flightItems = flightLegs.map((leg) => {
    const f = Object.values(flightSelections).find((v) => v?.id && leg.from === v.from && leg.to === v.to);
    return { leg, flight: f ?? null };
  });

  const stayItems = cityStays.map((cs) => ({ cs, hotel: stays[cs.city] ?? null }));

  const handleSaveToWishlist = () => {
    saveToWishlist({
      type: "manual",
      title: `${constraintObject.cities.join(", ")} — ${constraintObject.groupLabel}`,
      flightSelections, flightTotal, stays, stayTotal, experiences, expTotal,
      coinsEarnedOnTrip, rupeesSaved, finalPayable, constraintObject,
    });
    alert("Saved to My Itineraries! ✓");
  };

  const heroCity = constraintObject.cities[0] || "BKK";

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: NAV_SAFE_PAD }}>
      <ScapiaHeader accent="itinerary" onBack={() => navigate("/experiences")} transparent />

      {/* hero trip header */}
      <div style={{ position: "relative", height: 180, marginTop: HERO_BLEED, backgroundImage: `url(${cityImage(heroCity)})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(238,241,246,1) 0%, rgba(8,14,26,0.55) 100%)" }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14 }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, color: C.ink, lineHeight: 1.15 }}>
            {constraintObject.cities.map((c) => CITY_NAMES[c] ?? c).join(" → ")}
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: 12.5, color: C.body, fontWeight: 600, marginTop: 2 }}>
            {constraintObject.tripDays} days · {constraintObject.groupLabel} · {fmtDate(constraintObject.startDate)} – {fmtDate(constraintObject.endDate)}
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 16px" }}>
        {/* day-by-day CTA */}
        <PrimaryButton variant="outlineCoral" onClick={() => navigate("/day-by-day", { state: { flow: "manual" } })} style={{ marginBottom: 14 }}>
          🗓️ See day-by-day timeline →
        </PrimaryButton>

        {/* FLIGHTS */}
        {flightItems.length > 0 && (
          <SectionCard title="✈️ Flights">
            {flightItems.map(({ leg, flight }) => flight ? (
              <LineItem key={leg.id} label={`${leg.fromName ?? leg.from} → ${leg.toName ?? leg.to}`}
                sub={`${flight.airline} ${flight.flightNo} · ${fmtDate(leg.date)}`}
                amount={fmtINR(flight.pricePerPerson)} coins={Math.round(flight.pricePerPerson * 0.2)} />
            ) : (
              <div key={leg.id} style={missing}>{leg.label} — not selected</div>
            ))}
            <div style={subtotal}><span>Flights subtotal</span><span>{fmtINR(flightTotal)}</span></div>
          </SectionCard>
        )}

        {/* STAYS */}
        {stayItems.length > 0 && (
          <SectionCard title="🏨 Stays">
            {stayItems.map(({ cs, hotel }) => hotel ? (
              <LineItem key={cs.city} label={hotel.name}
                sub={`${cs.cityName} · ${cs.nights} nights · ${fmtDate(cs.checkIn)} – ${fmtDate(cs.checkOut)}`}
                amount={fmtINR(hotel.pricePerNight * cs.nights)} coins={Math.round(hotel.pricePerNight * cs.nights * 0.2)} />
            ) : (
              <div key={cs.city} style={missing}>{cs.cityName} stay — not selected</div>
            ))}
            <div style={subtotal}><span>Stays subtotal</span><span>{fmtINR(stayTotal)}</span></div>
          </SectionCard>
        )}

        {/* EXPERIENCES */}
        {experiences.length > 0 && (
          <SectionCard title="✨ Experiences">
            {experiences.map((exp) => (
              <LineItem key={exp.id} label={exp.name} sub={`${exp.cityName} · ${exp.category} · ${exp.duration}`}
                amount={fmtINR(exp.pricePerPerson)} coins={Math.round(exp.pricePerPerson * 0.2)} />
            ))}
            <div style={subtotal}><span>Experiences subtotal</span><span>{fmtINR(expTotal)}</span></div>
          </SectionCard>
        )}

        {/* COINS LOOP */}
        <div style={{ background: C.goldSoft, borderRadius: RADIUS.lg, padding: "16px", marginBottom: 12, boxShadow: SHADOW.cardSoft }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <CoinMedallion size={22} />
            <span style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 800, color: C.goldDeep }}>Scapia Coins loop</span>
          </div>

          <CoinsRow label="Per person total" sub="Flights + your share of stays + experiences" amount={fmtINR(perPersonTotal)} />
          <div style={goldDivider} />
          <CoinsRow label="Coins you can REDEEM now" labelColor={C.green}
            sub={`Balance: ${fmtCoins(selectedUser.coinBalance)} = ${fmtINR(existingBalanceRupees)} value`}
            amount={`− ${fmtINR(rupeesSaved)}`} amountColor={C.green} />
          <CoinsRow label="You pay per person" sub="After redemption" amount={fmtINR(finalPayable)} big />
          <div style={goldDivider} />
          <CoinsRow label="Coins you'll EARN on this booking" labelColor={C.goldDeep}
            sub={`20% of ${fmtINR(finalPayable)} = ${fmtCoins(coinsEarnedOnTrip)}`}
            amount={`+${fmtINR(coinsEarnedValue)}`} amountColor={C.goldDeep} />

          <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.goldDeep, opacity: 0.75, marginTop: 10, paddingTop: 8, borderTop: "1px dotted #E7C97A" }}>
            Coins, prices, and savings are illustrative — demo mock data only.
          </div>
        </div>

        {/* budget vs actual */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 12 }}>Budget vs actual · per person</div>
          <BudgetBar label="Flights" budgeted={constraintObject.flightBudget} actual={flightTotal} />
          <BudgetBar label="Stays (your share)" budgeted={constraintObject.stayBudget} actual={stayPerPerson} />
          <BudgetBar label="Experiences" budgeted={constraintObject.expBudget} actual={expTotal} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, paddingTop: 9, borderTop: `1px solid ${C.line}` }}>
            <span>Per person total</span>
            <span style={{ color: perPersonTotal > constraintObject.budgetPerPerson ? "#dc2626" : C.green }}>
              {fmtINR(perPersonTotal)} / {fmtINR(constraintObject.budgetPerPerson)}{perPersonTotal <= constraintObject.budgetPerPerson ? " ✓" : " over"}
            </span>
          </div>
        </Card>

        {/* actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton variant="coral" onClick={handleSaveToWishlist}>🔖 Save to My Itineraries</PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => navigate("/")}>← Start over with a different profile</PrimaryButton>
        </div>

        <div style={{ textAlign: "center", fontFamily: FONT.sans, fontSize: 11, color: C.muted, marginTop: 18, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          Demo · mock data — not real bookings or pricing
        </div>
      </div>
    </div>
  );
}

function CoinsRow({ label, sub, amount, labelColor, amountColor, dim, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 11, fontFamily: FONT.sans }}>
      <div style={{ paddingRight: 10 }}>
        <div style={{ fontSize: 13, fontWeight: labelColor ? 700 : 600, color: labelColor || C.body }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: big ? 18 : 14, fontWeight: big ? 900 : 800, color: amountColor || (dim ? C.sub : C.ink), flexShrink: 0 }}>{amount}</div>
    </div>
  );
}

const missing = { fontFamily: FONT.sans, fontSize: 12, color: C.muted, padding: "9px 0", borderBottom: `1px solid ${C.cardAlt}`, fontStyle: "italic" };
const subtotal = { display: "flex", justifyContent: "space-between", fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, color: C.ink, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${C.line}` };
const goldDivider = { borderTop: "1px solid #E7C97A", margin: "11px 0" };
