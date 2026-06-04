import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { ScapiaHeader, Badge, CoinPill, CoinMedallion, PrimaryButton, Card, MediaCard } from "../components/ui";
import { cityImage, hotelImage, experienceImage } from "../data/images";
import { C, FONT, RADIUS, SHADOW, PAGE_PAD, HERO_BLEED } from "../theme";

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function fmtFull(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
function StarsRow({ count }) {
  return <span style={{ color: C.gold, fontSize: 13, lineHeight: 1 }}>{"★".repeat(count)}{"☆".repeat(Math.max(0, 5 - count))}</span>;
}

const CAT_TONE = { Adventure: "coral", Food: "gold", Dining: "purple", Culture: "gold", Wellness: "green", Nightlife: "blue", Leisure: "green" };

function FlightCard({ flight, date, theme }) {
  if (!flight) return null;
  const isIntercity = flight.leg === "intercity";
  return (
    <div style={{ background: C.card, borderRadius: RADIUS.md, padding: 14, marginBottom: 10, borderLeft: `3px solid ${theme.color}`, boxShadow: SHADOW.cardSoft, fontFamily: FONT.sans }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Badge tone="coral">{isIntercity ? "🔄 Intercity" : flight.leg === "return" ? "🛬 Return" : "🛫 Depart"}</Badge>
        <span style={{ fontSize: 12, color: C.sub }}>{fmtFull(date)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{flight.legFromName ?? flight.from}</span>
        <span style={{ fontSize: 14, color: C.muted, fontWeight: 700 }}>→</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{flight.legToName ?? flight.to}</span>
      </div>
      <div style={{ display: "flex", gap: 6, fontSize: 12, color: C.sub, marginBottom: 8 }}>
        <span>{flight.airline} {flight.flightNo}</span><span>·</span><span>{flight.duration}</span><span>·</span>
        <span>{flight.stops === 0 ? "Direct" : `${flight.stops} stop`}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>₹{flight.pricePerPerson.toLocaleString("en-IN")} /person</span>
        <CoinPill amount={flight.coinsEarned ?? Math.round(flight.pricePerPerson * 0.2)} />
      </div>
      {flight.aiReason && <div style={reasonLine}>✦ {flight.aiReason}</div>}
    </div>
  );
}

function HotelCard({ hotel, cityName }) {
  if (!hotel) return null;
  return (
    <MediaCard image={hotelImage(hotel)} imageHeight={140} imageBottomLeft={<Badge tone="dark" icon="📍">{cityName}</Badge>} style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 14.5, fontWeight: 800, color: C.ink, marginBottom: 3 }}>{hotel.name}</div>
          <StarsRow count={hotel.stars} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 18, fontWeight: 800, color: C.ink }}>₹{hotel.pricePerNight.toLocaleString("en-IN")}</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted }}>/ night</div>
        </div>
      </div>
      <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub, margin: "8px 0" }}>📅 {fmt(hotel.checkIn)} → {fmt(hotel.checkOut)} · {hotel.nights} {hotel.nights === 1 ? "night" : "nights"}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, color: C.body }}>₹{hotel.totalCost.toLocaleString("en-IN")} total</span>
        <CoinPill amount={hotel.coinsEarned ?? Math.round(hotel.totalCost * 0.2)} />
      </div>
      {hotel.aiReason && <div style={reasonLine}>✦ {hotel.aiReason}</div>}
    </MediaCard>
  );
}

function ExperienceCard({ exp }) {
  if (!exp) return null;
  return (
    <MediaCard image={experienceImage(exp)} imageHeight={130}
      topLeft={<Badge tone={CAT_TONE[exp.category] || "navy"}>{exp.category}</Badge>}
      style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 800, color: C.ink }}>{exp.name}</span>
        <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, flexShrink: 0, marginLeft: 8 }}>{exp.duration}</span>
      </div>
      <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub, lineHeight: 1.4, marginBottom: 8 }}>{exp.desc}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, color: C.ink }}>₹{exp.pricePerPerson.toLocaleString("en-IN")} /person</span>
        <CoinPill amount={exp.coinsEarned ?? Math.round(exp.pricePerPerson * 0.2)} />
      </div>
      {exp.aiReason && <div style={reasonLine}>✦ {exp.aiReason}</div>}
    </MediaCard>
  );
}

function CitySection({ cs, hotel, activities, foodDining, theme }) {
  const cityActivities = activities.filter((e) => e.city === cs.city);
  const cityFood = foodDining.filter((e) => e.city === cs.city);
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0 10px 12px", borderLeft: `3px solid ${theme.color}`, marginBottom: 8, marginLeft: -4 }}>
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 17, fontWeight: 800, color: C.ink }}>{cs.cityName}</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.sub, marginTop: 1 }}>{fmt(cs.checkIn)} → {fmt(cs.checkOut)} · {cs.nights} {cs.nights === 1 ? "night" : "nights"}</div>
        </div>
      </div>
      <HotelCard hotel={hotel} cityName={cs.cityName} />
      {cityActivities.length > 0 && (
        <div style={{ marginLeft: 4, marginBottom: 8 }}>
          <div style={expsTitle}>🎯 Activities</div>
          {cityActivities.map((exp) => <ExperienceCard key={exp.id} exp={exp} />)}
        </div>
      )}
      {cityFood.length > 0 && (
        <div style={{ marginLeft: 4, marginBottom: 8 }}>
          <div style={{ ...expsTitle, color: C.purple }}>🍽️ Food & Dining</div>
          {cityFood.map((exp) => <ExperienceCard key={exp.id} exp={exp} />)}
        </div>
      )}
    </div>
  );
}

export default function AutoBuildDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const { autoItineraries, constraintObject, selectedUser, setManualItinerary, saveToWishlist } = useApp();

  const itin = autoItineraries?.[parseInt(index, 10)];

  if (!itin || !constraintObject) {
    return (
      <div style={{ minHeight: "100dvh", paddingBottom: PAGE_PAD }}>
        <ScapiaHeader accent="itinerary" backTo="/auto-compare" />
        <div style={{ padding: 32, textAlign: "center", fontFamily: FONT.sans }}>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>Itinerary not found.</div>
          <PrimaryButton variant="coral" full={false} onClick={() => navigate("/auto-compare")}>← Back to compare</PrimaryButton>
        </div>
      </div>
    );
  }

  const { budgetPerPerson } = constraintObject;
  const coinBalance = selectedUser?.coinBalance ?? 0;
  const existingBalanceRupees = Math.round(coinBalance / 5);
  const rupeesSaved = Math.min(existingBalanceRupees, itin.perPersonTotal);
  const finalPayable = itin.perPersonTotal - rupeesSaved;
  const coinsEarnedOnPayable = Math.round(finalPayable * 0.2); // per person — 20% of what you pay
  const coinsEarnedRupees = Math.round(coinsEarnedOnPayable / 5);
  const delta = itin.perPersonTotal - budgetPerPerson;

  const entryLeg = itin.flightLegs.find((l) => l.type === "entry");
  const intercityLegs = itin.flightLegs.filter((l) => l.type === "intercity");
  const exitLeg = itin.flightLegs.find((l) => l.type === "exit");

  function handleCustomise() {
    setManualItinerary({
      flightSelections: itin.flightSelections,
      flightLegs: itin.flightLegs,
      flightTotal: itin.flightTotal,
      stays: itin.stays,
      stayTotal: itin.stayTotal,
      experiences: itin.experiences,
      expTotal: itin.expTotal,
      inboundFlight: Object.values(itin.flightSelections).find((f) => f.legType === "entry") ?? null,
      returnFlight: Object.values(itin.flightSelections).find((f) => f.legType === "exit") ?? null,
      intercityFlights: Object.values(itin.flightSelections).filter((f) => f.legType === "intercity"),
    });
    navigate("/flights");
  }

  function handleSaveToWishlist() {
    saveToWishlist({ type: "auto", theme: itin.name, ...itin, constraintObject, user: selectedUser?.name });
    alert("Saved to My Itineraries! 🎉");
  }

  const heroCity = itin.cityStays?.[0]?.city || constraintObject.cities[0] || "BKK";

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: PAGE_PAD }}>
      <ScapiaHeader accent="itinerary" onBack={() => navigate("/auto-compare")} transparent />

      {/* image hero with theme overlay */}
      <div style={{ position: "relative", marginTop: HERO_BLEED, height: 250, backgroundImage: `url(${cityImage(heroCity)})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${itin.color}D9 0%, ${itin.color}AA 50%, rgba(8,14,26,0.55) 100%)` }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, color: "#fff", fontFamily: FONT.sans }}>
          <div style={{ fontSize: 34, marginBottom: 2 }}>{itin.emoji}</div>
          <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: -0.3 }}>{itin.name}</div>
          <div style={{ fontSize: 13, opacity: 0.92, marginBottom: 12 }}>{itin.tagline}</div>
          <div style={{ display: "flex", background: "rgba(8,14,26,0.32)", borderRadius: RADIUS.md, overflow: "hidden", backdropFilter: "blur(4px)" }}>
            {[
              { l: "Per person", v: `₹${itin.perPersonTotal.toLocaleString("en-IN")}` },
              { l: "After coins", v: `₹${finalPayable.toLocaleString("en-IN")}` },
              { l: "Coins earned", v: `+${itin.totalCoinsEarned.toLocaleString("en-IN")}` },
            ].map((it, i) => (
              <div key={i} style={{ flex: 1, padding: "10px 12px", textAlign: "center", borderLeft: i ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                <div style={{ fontSize: 10, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 }}>{it.l}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{it.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "inline-block", padding: "6px 11px", borderRadius: RADIUS.sm, fontFamily: FONT.sans, fontSize: 12, fontWeight: 700, marginBottom: 4, background: delta <= 0 ? C.greenSoft : "#FEE2E2", color: delta <= 0 ? C.green : "#991b1b" }}>
          {delta <= 0 ? `✓ ₹${Math.abs(delta).toLocaleString("en-IN")}/person under budget` : `⚠️ ₹${delta.toLocaleString("en-IN")}/person over budget`}
        </div>

        <div style={sectionHeading}>Your journey</div>
        {entryLeg && <FlightCard flight={itin.flightSelections[entryLeg.id]} date={entryLeg.date} theme={itin} />}
        {itin.cityStays.map((cs, i) => (
          <div key={cs.city}>
            <CitySection cs={cs} hotel={itin.stays[cs.city]} activities={itin.activities ?? []} foodDining={itin.foodDining ?? []} theme={itin} />
            {i < itin.cityStays.length - 1 && intercityLegs[i] && (
              <FlightCard flight={itin.flightSelections[intercityLegs[i].id]} date={intercityLegs[i].date} theme={itin} />
            )}
          </div>
        ))}
        {exitLeg && <FlightCard flight={itin.flightSelections[exitLeg.id]} date={exitLeg.date} theme={itin} />}

        {/* coins */}
        <div style={sectionHeading}>Scapia Coins breakdown</div>
        <div style={{ background: C.goldSoft, borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, boxShadow: SHADOW.cardSoft }}>
          <CoinsRow label="Total trip cost" note="per person" value={`₹${itin.perPersonTotal.toLocaleString("en-IN")}`} bold />
          <CoinsRow label="Coins you can redeem" note={`${coinBalance.toLocaleString("en-IN")} coins in your balance`} value={`− ₹${rupeesSaved.toLocaleString("en-IN")}`} color={C.green} />
          <div style={{ height: 1, background: "#E7C97A", margin: "4px 0 12px" }} />
          <CoinsRow label="Final payable" note="per person after redemption" value={`₹${finalPayable.toLocaleString("en-IN")}`} bold large />
          <div style={{ background: "#fff", borderRadius: RADIUS.md, padding: "11px 13px", marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <CoinMedallion size={26} />
            <div>
              <div style={{ fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 700, color: C.goldDeep }}>Coins you earn on this booking</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 19, fontWeight: 800, color: C.goldDeep }}>+{coinsEarnedOnPayable.toLocaleString("en-IN")} coins</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 11.5, color: C.goldDeep, opacity: 0.85 }}>= ₹{coinsEarnedRupees.toLocaleString("en-IN")} value added to your wallet</div>
            </div>
          </div>
          <div style={{ ...disclaimer, color: C.goldDeep, opacity: 0.75 }}>Prices, coins and savings are illustrative — demo prototype.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton variant="coral" onClick={handleSaveToWishlist} style={{ background: itin.color, boxShadow: "none" }}>♡ Save to My Itineraries</PrimaryButton>
          <PrimaryButton variant="navy" onClick={handleCustomise}>✏️ Customise this trip →</PrimaryButton>
          <PrimaryButton variant="ghost" onClick={() => navigate("/auto-compare")}>← See all 3 options</PrimaryButton>
        </div>

        <div style={disclaimer}>Demo · mock data — not real availability or pricing</div>
      </div>
    </div>
  );
}

function CoinsRow({ label, note, value, bold, large, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8, fontFamily: FONT.sans }}>
      <div>
        <div style={{ fontSize: 14, color: C.ink, fontWeight: bold ? 700 : 500 }}>{label}</div>
        {note && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{note}</div>}
      </div>
      <div style={{ fontWeight: bold ? 800 : 600, fontSize: large ? 20 : 15, color: color ?? C.ink, letterSpacing: -0.3 }}>{value}</div>
    </div>
  );
}

const sectionHeading = { fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 20, marginBottom: 12 };
const expsTitle = { fontFamily: FONT.sans, fontSize: 12, fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8, marginTop: 4 };
const reasonLine = { fontFamily: FONT.sans, fontSize: 12, color: C.sub, fontStyle: "italic", marginTop: 8, paddingTop: 6, borderTop: `1px solid ${C.cardAlt}`, lineHeight: 1.4 };
const disclaimer = { fontFamily: FONT.sans, fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8, lineHeight: 1.5 };
