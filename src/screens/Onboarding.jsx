import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { ScapiaHeader, PrimaryButton, InfoCallout } from "../components/ui";
import { CITY_IMAGES } from "../data/images";
import { C, FONT, RADIUS, SHADOW, NAV_SAFE_PAD } from "../theme";

const CITIES = [
  { id: "BKK", label: "Bangkok", emoji: "🏙️", desc: "City, temples, nightlife" },
  { id: "HKT", label: "Phuket", emoji: "🏖️", desc: "Beaches, islands, diving" },
  { id: "CNX", label: "Chiang Mai", emoji: "🌿", desc: "Mountains, culture, elephants" },
];

// roomShare = occupancy per hotel room (NOT a headcount). Solo rooms alone (÷1);
// everyone else pairs up in double/twin rooms (÷2). Drives only per-person stay cost.
const GROUP_OPTIONS = [
  { id: "solo",    label: "Solo",    roomShare: 1, emoji: "🧍" },
  { id: "couple",  label: "Couple",  roomShare: 2, emoji: "👫" },
  { id: "friends", label: "Friends", roomShare: 2, emoji: "🎒" },
  { id: "family",  label: "Family",  roomShare: 2, emoji: "👨‍👩‍👧" },
];

const VIBE_OPTIONS = [
  { id: "chill",     label: "Chill",     emoji: "🧘", desc: "Slow pace, beaches, spas" },
  { id: "cultural",  label: "Cultural",  emoji: "🏛️", desc: "Temples, markets, local life" },
  { id: "adventure", label: "Adventure", emoji: "🏄", desc: "Outdoors, full days, thrills" },
  { id: "party",     label: "Party",     emoji: "🎉", desc: "Nightlife and social scenes" },
];

const BUDGET_OPTIONS = [
  { id: "budget", label: "₹20k–40k", min: 20000, max: 40000, desc: "Budget trip" },
  { id: "mid", label: "₹40k–80k", min: 40000, max: 80000, desc: "Comfortable" },
  { id: "comfort", label: "₹80k–1.5L", min: 80000, max: 150000, desc: "Premium" },
  { id: "luxury", label: "₹1.5L+", min: 150000, max: 300000, desc: "Luxury" },
];

const TOTAL_STEPS = 5;

function StepIndicator({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, flex: 1 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 5,
            borderRadius: 99,
            background: i === step - 1 ? C.coral : i < step ? "#F2A88F" : C.line,
            transition: "background 0.2s",
          }}
        />
      ))}
    </div>
  );
}

function Chip({ active, opt, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
        padding: "14px 13px",
        border: active ? `2px solid ${C.coral}` : `2px solid ${C.line}`,
        borderRadius: RADIUS.md,
        background: active ? C.coralSoft : C.card,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        minHeight: 84,
        fontFamily: FONT.sans,
      }}
    >
      <span style={{ fontSize: 22 }}>{opt.emoji}</span>
      <span style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>{opt.label}</span>
      {opt.desc && <span style={{ fontSize: 11, color: C.sub, lineHeight: 1.3 }}>{opt.desc}</span>}
    </button>
  );
}

function CityChip({ active, opt, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        height: 116,
        border: active ? `2.5px solid ${C.coral}` : `1px solid ${C.line}`,
        borderRadius: RADIUS.md,
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
        backgroundImage: `url(${CITY_IMAGES[opt.id]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: SHADOW.cardSoft,
        fontFamily: FONT.sans,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,14,26,0.82) 0%, rgba(8,14,26,0.1) 60%)" }} />
      {active && (
        <span style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: C.coral, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>✓</span>
      )}
      <div style={{ position: "absolute", left: 11, right: 11, bottom: 10, textAlign: "left" }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>{opt.label}</div>
        <div style={{ color: "rgba(255,255,255,0.88)", fontSize: 10.5, fontWeight: 600 }}>{opt.desc}</div>
      </div>
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { setOnboardingAnswers, selectedUser } = useApp();

  const [step, setStep] = useState(1);
  const [cities, setCities] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [group, setGroup] = useState("");
  const [vibe, setVibe] = useState("");
  const [budgetOption, setBudgetOption] = useState("");

  const tripDays =
    startDate && endDate
      ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
      : null;

  const toggleCity = (id) => {
    setCities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const canNext = () => {
    if (step === 1) return cities.length > 0;
    if (step === 2) return startDate && endDate && new Date(endDate) > new Date(startDate);
    if (step === 3) return !!group;
    if (step === 4) return !!vibe;
    if (step === 5) return !!budgetOption;
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      const groupData = GROUP_OPTIONS.find((g) => g.id === group);
      const budgetData = BUDGET_OPTIONS.find((b) => b.id === budgetOption);
      const answers = {
        cities,
        startDate,
        endDate,
        tripDays,
        groupId: group,
        roomShare: groupData?.roomShare ?? 1,
        groupLabel: groupData?.label ?? "",
        vibeId: vibe,
        vibeLabel: VIBE_OPTIONS.find((v) => v.id === vibe)?.label ?? "",
        budgetId: budgetOption,
        budgetMin: budgetData?.min ?? 0,
        budgetMax: budgetData?.max ?? 0,
        budgetLabel: budgetData?.label ?? "",
      };
      setOnboardingAnswers(answers);
      navigate("/summary");
    }
  };

  const stepTitles = [
    "Which cities in Thailand?",
    "When are you travelling?",
    "Who's coming along?",
    "What's your vibe this trip?",
    "Budget per person?",
  ];
  const stepSubtitles = [
    "Select all you want to visit",
    "Pick your travel dates",
    "So we can split costs correctly",
    "This overrides your usual travel style",
    "This trip's budget (not your usual)",
  ];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: NAV_SAFE_PAD, display: "flex", flexDirection: "column" }}>
      <ScapiaHeader accent="itinerary" onBack={() => (step > 1 ? setStep((s) => s - 1) : navigate("/"))} />

      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <StepIndicator step={step} />
          <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.muted, fontWeight: 700 }}>{step}/{TOTAL_STEPS}</span>
        </div>

        {/* title */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 24, color: C.ink, lineHeight: 1.2 }}>{stepTitles[step - 1]}</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 13.5, color: C.sub, marginTop: 4 }}>{stepSubtitles[step - 1]}</div>
        </div>

        {/* contextual hints */}
        {step === 4 && (
          <div style={hintStyle}>
            ✨ Your usual vibe: <strong>{selectedUser.vibeAxis}</strong>. Pick the same to stay on-brand, or a different one to override it for this trip.
          </div>
        )}
        {step === 5 && (
          <div style={hintStyle}>
            ✨ Your usual budget band: <strong>{selectedUser.budgetBand.label}</strong>. Pick your budget for this trip.
          </div>
        )}

        {/* content */}
        <div style={{ flex: 1 }}>
          {step === 1 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                {CITIES.map((o) => (
                  <CityChip key={o.id} opt={o} active={cities.includes(o.id)} onClick={() => toggleCity(o.id)} />
                ))}
              </div>
              <InfoCallout icon="🌏" title="Why only Thailand?" style={{ marginTop: 14 }}>
                This is a pitch prototype, so the destination is fixed to Thailand (Bangkok · Phuket · Chiang Mai) to keep the demo focused. The same AI engine + constraint logic works for any destination.
              </InfoCallout>
            </>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={dateLabelStyle}>Departure date</label>
                <input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} style={dateInputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={dateLabelStyle}>Return date</label>
                <input type="date" value={endDate} min={startDate || today} onChange={(e) => setEndDate(e.target.value)} style={dateInputStyle} />
              </div>
              {tripDays && (
                <div style={{ ...hintStyle, textAlign: "center", marginBottom: 0 }}>
                  🗓️ {tripDays} {tripDays === 1 ? "day" : "days"} trip
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {GROUP_OPTIONS.map((o) => (
                <Chip key={o.id} opt={o} active={group === o.id} onClick={() => setGroup(o.id)} />
              ))}
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {VIBE_OPTIONS.map((o) => (
                <Chip key={o.id} opt={o} active={vibe === o.id} onClick={() => setVibe(o.id)} />
              ))}
            </div>
          )}

          {step === 5 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {BUDGET_OPTIONS.map((o) => (
                <Chip key={o.id} opt={o} active={budgetOption === o.id} onClick={() => setBudgetOption(o.id)} />
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <PrimaryButton variant="coral" disabled={!canNext()} onClick={handleNext}>
            {step === TOTAL_STEPS ? "Build my itinerary →" : "Next →"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

const hintStyle = {
  background: C.coralSoft,
  borderRadius: RADIUS.md,
  padding: "11px 13px",
  fontSize: 13,
  color: C.coralDark,
  marginBottom: 16,
  fontFamily: FONT.sans,
  fontWeight: 600,
};
const dateLabelStyle = { fontSize: 13, fontWeight: 700, color: C.body, fontFamily: FONT.sans };
const dateInputStyle = {
  padding: "13px 14px",
  border: `1.5px solid ${C.line}`,
  borderRadius: RADIUS.md,
  fontSize: 16,
  color: C.ink,
  outline: "none",
  fontFamily: FONT.sans,
  background: C.card,
};
