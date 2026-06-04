// ─── MY ITINERARIES — WISHLIST + COMPARE ────────────────────────────────────
// Select exactly 2 to unlock the side-by-side comparison table.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { ScapiaHeader, Badge, CoinPill, PrimaryButton } from "../components/ui";
import { cityImage } from "../data/images";
import { C, FONT, RADIUS, SHADOW, NAV_SAFE_PAD } from "../theme";

const CITY_MAP = { BKK: "Bangkok", HKT: "Phuket", CNX: "Chiang Mai" };

function normalise(item) {
  const co = item.constraintObject ?? {};
  const roomShare = co.roomShare ?? 1;

  const perPersonTotal = item.type === "auto"
    ? (item.perPersonTotal ?? 0)
    : (item.flightTotal ?? 0) + Math.round((item.stayTotal ?? 0) / roomShare) + (item.expTotal ?? 0);

  const coinsEarned = item.type === "auto" ? (item.totalCoinsEarned ?? 0) : (item.coinsEarnedOnTrip ?? 0);

  const cities = co.cityStays
    ? co.cityStays.map((cs) => cs.cityName).join(" + ")
    : (co.cities ?? []).map((c) => CITY_MAP[c] ?? c).join(" + ");

  const title = item.type === "auto" ? (item.name ?? item.theme ?? "AI Itinerary") : (item.title ?? "My Itinerary");
  const budgetPerPerson = co.budgetPerPerson ?? 0;
  const cityCode = co.cityStays?.[0]?.city ?? co.cities?.[0] ?? "BKK";

  return {
    title, type: item.type,
    emoji: item.emoji ?? (item.type === "auto" ? "✨" : "📋"),
    color: item.color ?? (item.type === "auto" ? C.coral : C.navy),
    cityCode, cities,
    startDate: co.startDate, endDate: co.endDate, tripDays: co.tripDays,
    nights: co.tripDays ? co.tripDays - 1 : null,
    groupLabel: co.groupLabel ?? "", roomShare,
    perPersonTotal,
    coinsEarned, coinsValue: Math.round(coinsEarned / 5),
    flightTotal: item.flightTotal ?? 0,
    stayPerPerson: Math.round((item.stayTotal ?? 0) / roomShare),
    expTotal: item.expTotal ?? 0,
    budgetPerPerson, overBudget: perPersonTotal > budgetPerPerson, budgetDelta: perPersonTotal - budgetPerPerson,
    user: item.user ?? "", savedAt: item.savedAt, strategy: item.strategy ?? null,
  };
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function fmtINR(n) { return "₹" + (n ?? 0).toLocaleString("en-IN"); }
function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ItinCard({ norm, index, isSelected, onToggleSelect, onRemove }) {
  const delta = norm.budgetDelta;
  return (
    <div style={{ background: C.card, borderRadius: RADIUS.lg, overflow: "hidden", border: isSelected ? `2px solid ${norm.color}` : `1px solid ${C.line}`, boxShadow: isSelected ? `0 0 0 3px ${norm.color}33, ${SHADOW.cardSoft}` : SHADOW.cardSoft }}>
      {/* image header with theme overlay */}
      <div style={{ position: "relative", height: 96, backgroundImage: `url(${cityImage(norm.cityCode)})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${norm.color}E6 0%, ${norm.color}99 60%, rgba(8,14,26,0.3) 100%)` }} />
        <div style={{ position: "absolute", inset: 0, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{norm.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: FONT.sans, fontSize: 15, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{norm.title}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{norm.type === "auto" ? "AI-built" : "Manual build"}{norm.user ? ` · ${norm.user}` : ""}</div>
            </div>
          </div>
          <button onClick={() => onToggleSelect(index)}
            style={{ width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isSelected ? "#fff" : "rgba(255,255,255,0.3)", color: isSelected ? norm.color : "#fff" }}>
            {isSelected ? "✓" : "○"}
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 11 }}>
          <Badge tone="navy" icon="📍">{norm.cities}</Badge>
          <Badge tone="navy" icon="📅">{fmtDate(norm.startDate)} → {fmtDate(norm.endDate)}</Badge>
          {norm.tripDays && <Badge tone="navy" icon="⏱">{norm.tripDays} days</Badge>}
          {norm.groupLabel && <Badge tone="navy" icon="👥">{norm.groupLabel}</Badge>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, marginBottom: 2 }}>Per person</div>
            <div style={{ fontFamily: FONT.sans, fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: -0.4 }}>{fmtINR(norm.perPersonTotal)}</div>
          </div>
          <CoinPill amount={norm.coinsEarned} />
        </div>

        <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: RADIUS.sm, marginBottom: 10, background: norm.overBudget ? "#FEE2E2" : C.greenSoft, color: norm.overBudget ? "#991b1b" : C.green }}>
          {norm.overBudget ? `⚠️ ${fmtINR(Math.abs(delta))}/person over budget` : `✓ ${fmtINR(Math.abs(delta))}/person under budget`}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 9, borderTop: `1px solid ${C.cardAlt}` }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted }}>Saved {timeAgo(norm.savedAt)}</span>
          <button onClick={() => onRemove(index)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FONT.sans, fontSize: 12, color: "#ef4444", padding: 0, fontWeight: 700 }}>Remove</button>
        </div>
      </div>
    </div>
  );
}

function CompareTable({ items }) {
  const [a, b] = items.map(normalise);
  const rows = [
    { label: "Cities", va: a.cities, vb: b.cities },
    { label: "Dates", va: `${fmtDate(a.startDate)} → ${fmtDate(a.endDate)}`, vb: `${fmtDate(b.startDate)} → ${fmtDate(b.endDate)}` },
    { label: "Duration", va: a.tripDays ? `${a.tripDays} days` : "—", vb: b.tripDays ? `${b.tripDays} days` : "—" },
    { label: "Group", va: a.groupLabel, vb: b.groupLabel },
    { label: "Per person", va: fmtINR(a.perPersonTotal), vb: fmtINR(b.perPersonTotal), highlight: true },
    { label: "Flights", va: fmtINR(a.flightTotal), vb: fmtINR(b.flightTotal) },
    { label: "Stays / person", va: fmtINR(a.stayPerPerson), vb: fmtINR(b.stayPerPerson) },
    { label: "Experiences", va: fmtINR(a.expTotal), vb: fmtINR(b.expTotal) },
    { label: "Coins earned", va: `${a.coinsEarned.toLocaleString("en-IN")}`, vb: `${b.coinsEarned.toLocaleString("en-IN")}`, highlight: true },
    { label: "Coins value", va: `= ${fmtINR(a.coinsValue)}`, vb: `= ${fmtINR(b.coinsValue)}` },
    { label: "vs. budget", va: a.overBudget ? `⚠️ +${fmtINR(a.budgetDelta)}` : `✓ −${fmtINR(Math.abs(a.budgetDelta))}`, vb: b.overBudget ? `⚠️ +${fmtINR(b.budgetDelta)}` : `✓ −${fmtINR(Math.abs(b.budgetDelta))}` },
  ];
  const cheaperIdx = a.perPersonTotal <= b.perPersonTotal ? 0 : 1;
  const moreCoinsIdx = a.coinsEarned >= b.coinsEarned ? 0 : 1;
  const grid = "92px 1fr 1fr";

  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: RADIUS.lg, overflow: "hidden", marginBottom: 16, boxShadow: SHADOW.cardSoft }}>
      <div style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 800, color: C.ink, padding: "12px 14px 10px", borderBottom: `1px solid ${C.cardAlt}` }}>📊 Side-by-side comparison</div>
      <div style={{ display: "grid", gridTemplateColumns: grid, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ padding: "8px 10px" }} />
        {[a, b].map((x, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 6px", textAlign: "center", background: x.color + "14", color: x.color }}>
            <span style={{ fontSize: 18 }}>{x.emoji}</span>
            <span style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 800, lineHeight: 1.3 }}>{x.title}</span>
          </div>
        ))}
      </div>
      {rows.map((row, i) => {
        const isCoins = row.label === "Coins earned";
        const isCost = row.label === "Per person";
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: grid, borderBottom: `1px solid ${C.cardAlt}`, background: row.highlight ? C.cardAlt : C.card }}>
            <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, fontWeight: 600, padding: "9px 10px", display: "flex", alignItems: "center" }}>{row.label}</div>
            {["va", "vb"].map((key, col) => {
              const win = (isCost && cheaperIdx === col) || (isCoins && moreCoinsIdx === col);
              const lose = (isCost || isCoins) && !win;
              return (
                <div key={key} style={{ fontFamily: FONT.sans, fontSize: 12, padding: "9px 6px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 3, lineHeight: 1.4, fontWeight: row.highlight ? 800 : 500, color: win ? (isCoins ? C.goldDeep : C.green) : lose ? C.sub : C.ink }}>
                  {row[key]}
                  {isCost && win && <Badge tone="green">Cheaper</Badge>}
                  {isCoins && win && <Badge tone="gold">More coins</Badge>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function MyItineraries() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useApp();
  const [selected, setSelected] = useState([]);

  const toggleSelect = (index) => {
    setSelected((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 2) return [prev[1], index];
      return [...prev, index];
    });
  };

  const handleRemove = (index) => {
    removeFromWishlist(index);
    setSelected((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
  };

  const compareItems = selected.length === 2 ? selected.map((i) => wishlist[i]).filter(Boolean) : [];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: NAV_SAFE_PAD }}>
      <ScapiaHeader accent="itinerary" backTo="/" />

      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 25, color: C.ink }}>My Itineraries</span>
          {wishlist.length > 0 && <span style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 800, background: C.coral, color: "#fff", padding: "2px 9px", borderRadius: RADIUS.pill }}>{wishlist.length}</span>}
        </div>

        {wishlist.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", fontFamily: FONT.sans }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 8 }}>No saved itineraries yet</div>
            <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.6, marginBottom: 20 }}>Build a trip and tap "Save to My Itineraries" — it'll appear here.</div>
            <PrimaryButton variant="coral" full={false} onClick={() => navigate("/onboarding")}>Plan a trip →</PrimaryButton>
          </div>
        )}

        {wishlist.length >= 2 && selected.length === 0 && (
          <div style={hint}>Tap ○ on any two cards to compare them side by side</div>
        )}
        {selected.length === 1 && <div style={hint}>Select one more to compare</div>}

        {compareItems.length === 2 && <CompareTable items={compareItems} />}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {wishlist.map((item, i) => (
            <ItinCard key={item.savedAt + "-" + i} norm={normalise(item)} index={i} isSelected={selected.includes(i)} onToggleSelect={toggleSelect} onRemove={handleRemove} />
          ))}
        </div>

        {wishlist.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <PrimaryButton variant="coral" onClick={() => navigate("/onboarding")}>+ Plan another trip</PrimaryButton>
            <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.muted, textAlign: "center", lineHeight: 1.5, marginTop: 12 }}>Demo · mock data — coins, prices and savings are illustrative</div>
          </div>
        )}
      </div>
    </div>
  );
}

const hint = { fontFamily: FONT.sans, fontSize: 12, color: C.coral, fontWeight: 700, background: C.coralSoft, borderRadius: RADIUS.md, padding: "9px 12px", marginBottom: 12, textAlign: "center" };
