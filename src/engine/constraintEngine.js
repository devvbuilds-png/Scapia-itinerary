// Deterministic constraint engine — NO AI, NO randomness.
// Input: passive profile (user) + active onboarding answers.
// Output: an explicit, inspectable constraint object.
// Active layer overrides passive where specified.

// ─── WEIGHT TABLES ──────────────────────────────────────────────────────────
// Base budget share weights by axis value.
// These are raw weights; they get normalised to sum to 1.0.

const STAY_WEIGHTS = {
  Budget: 0.20,
  Mid: 0.32,
  Luxury: 0.46,
};

const FLIGHT_WEIGHTS = {
  Cheapest: 0.17,
  Balanced: 0.27,
  Premium: 0.37,
};

// Unified vibe set — same options for both profile axis and trip onboarding.
// Keys are lowercase ids used in both systems.
const VIBE_EXP_WEIGHTS = {
  chill:     0.14,
  cultural:  0.20,
  adventure: 0.26,
  party:     0.20,
};

// ─── REASON TEMPLATES ────────────────────────────────────────────────────────

const STAY_REASONS = {
  Budget: "Budget stay preference → lower hotel allocation, more room for experiences",
  Mid: "Mid-range stay preference → balanced hotel allocation",
  Luxury: "Luxury stay preference → higher hotel allocation for premium rooms",
};

const FLIGHT_REASONS = {
  Cheapest: "Cheapest flight preference → minimal flight spend, saving for hotels & activities",
  Balanced: "Balanced flight preference → moderate flight allocation for comfort + value",
  Premium: "Premium flight preference → higher flight allocation for business/premium class",
};

const VIBE_REASONS = {
  chill:     "Chill vibe → lighter experience schedule, more budget saved for unwinding",
  cultural:  "Cultural vibe → moderate experience allocation for temples, markets and workshops",
  adventure: "Adventure vibe → higher experience allocation for outdoor and active days",
  party:     "Party vibe → experience budget weighted toward nightlife and social events",
};

const OVERRIDE_REASONS = {
  vibe: (passive, active) =>
    `Trip vibe "${active}" overrides your usual "${passive}" style for this trip`,
  budget: (passive, active) =>
    `Trip budget (${active}) overrides your usual band (${passive})`,
};

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────

export function buildConstraintObject(user, answers) {
  // ── 1. Merge layers (active overrides passive) ────────────────────────────
  // Both systems now use the same vibe set (Chill/Cultural/Adventure/Party).
  // vibeIsOverridden = true only when the user picks a DIFFERENT vibe from their profile.
  const vibeIsOverridden = !!answers.vibeId &&
    answers.vibeId !== user.vibeAxis.toLowerCase();

  const effectiveVibe = answers.vibeId || user.vibeAxis.toLowerCase();
  const effectiveVibeLabel = answers.vibeLabel || user.vibeAxis;

  // Stay and flight axes stay passive (no active override for these in onboarding)
  const effectiveStay = user.stayAxis;
  const effectiveFlight = user.flightAxis;
  const effectiveFood = user.foodAxis;

  // Budget: active overrides passive
  const budgetPerPerson = answers.budgetMax;
  const budgetPerPersonLabel = answers.budgetLabel;
  const budgetIsOverridden = !isInBand(answers.budgetMax, user.budgetBand);

  // Room-share = occupancy per hotel room (NOT a headcount).
  // Solo books a room alone (÷1); everyone else pairs up in double/twin rooms (÷2).
  // This is the ONLY thing the group choice drives — there is no group-size math.
  const roomShare = answers.roomShare ?? 1;

  // ── 2. Derive raw weights from axes ──────────────────────────────────────
  const rawStay = STAY_WEIGHTS[effectiveStay] ?? 0.32;
  const rawFlight = FLIGHT_WEIGHTS[effectiveFlight] ?? 0.27;
  const rawExp = VIBE_EXP_WEIGHTS[effectiveVibe.toLowerCase()] ?? 0.20;

  const total = rawStay + rawFlight + rawExp;

  const splitStay = rawStay / total;
  const splitFlight = rawFlight / total;
  const splitExp = rawExp / total;

  // ── 3. Compute absolute budget amounts (ALL per-person) ───────────────────
  // The per-person band IS the ceiling — no multiplication by any headcount.
  const stayBudget = Math.round(budgetPerPerson * splitStay);
  const flightBudget = Math.round(budgetPerPerson * splitFlight);
  const expBudget = budgetPerPerson - stayBudget - flightBudget; // absorbs rounding
  const route = buildTripRoute(answers.cities, answers.startDate, answers.endDate);

  // ── 4. Assemble constraint object ─────────────────────────────────────────
  return {
    // Merged effective preferences
    effectiveStay,
    effectiveFlight,
    effectiveVibe,
    effectiveVibeLabel,
    effectiveFood,

    // Override flags + explanations
    vibeIsOverridden,
    vibeOverrideReason: vibeIsOverridden
      ? OVERRIDE_REASONS.vibe(user.vibeAxis, effectiveVibeLabel)
      : null,
    budgetIsOverridden,
    budgetOverrideReason: budgetIsOverridden
      ? OVERRIDE_REASONS.budget(user.budgetBand.label, budgetPerPersonLabel)
      : null,

    // Budget (per-person is the only model)
    budgetPerPerson,
    budgetPerPersonLabel,
    roomShare,
    groupLabel: answers.groupLabel,

    // Derived split (fractions)
    splitStay: round2(splitStay),
    splitFlight: round2(splitFlight),
    splitExp: round2(splitExp),

    // Derived split (absolute ₹)
    stayBudget,
    flightBudget,
    expBudget,

    // Reasons for each weighting
    stayReason: STAY_REASONS[effectiveStay],
    flightReason: FLIGHT_REASONS[effectiveFlight],
    expReason: VIBE_REASONS[effectiveVibe.toLowerCase()] ?? VIBE_REASONS[user.vibeAxis.toLowerCase()],

    // Trip metadata
    cities: answers.cities,
    startDate: answers.startDate,
    endDate: answers.endDate,
    tripDays: answers.tripDays,
    route,
    cityOrder: route.cityOrder,
    cityStays: route.cityStays,
    requiredFlightLegs: route.flightLegs,

    // Soft targets passed to AI later (Phase 3)
    softTargets: {
      preferredStayTier: effectiveStay,
      preferredFlightTier: effectiveFlight,
      preferredVibe: effectiveVibe,
      preferredFood: effectiveFood,
      maxPerPersonBudget: budgetPerPerson,
      stayBudgetTarget: stayBudget,
      flightBudgetTarget: flightBudget,
      expBudgetTarget: expBudget,
    },
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function round2(n) {
  return Math.round(n * 100) / 100;
}

function isInBand(value, band) {
  return value >= band.min && value <= band.max;
}

const CITY_NAMES = {
  BKK: "Bangkok",
  HKT: "Phuket",
  CNX: "Chiang Mai",
};

function buildTripRoute(selectedCities = [], startDate, endDate) {
  const cityOrder = getCityOrder(selectedCities);
  const totalNights = Math.max(0, diffDays(startDate, endDate));
  const cityStays = splitCityStays(cityOrder, startDate, totalNights);
  const flightLegs = buildFlightLegs(cityOrder, startDate, endDate, cityStays);

  return {
    cityOrder,
    cityLabels: cityOrder.map((city) => CITY_NAMES[city] ?? city),
    totalNights,
    cityStays,
    flightLegs,
  };
}

function getCityOrder(selectedCities = []) {
  const cities = selectedCities.filter(Boolean);
  if (cities.length <= 1) return cities;
  if (cities.length === 3) return ["BKK", "CNX", "HKT"];

  const hub = cities.includes("BKK") ? "BKK" : cities.includes("HKT") ? "HKT" : cities[0];
  const other = cities.find((city) => city !== hub);
  return other ? [hub, other] : [hub];
}

function splitCityStays(cityOrder, startDate, totalNights) {
  if (!cityOrder.length) return [];

  const baseNights = Math.floor(totalNights / cityOrder.length);
  const remainder = totalNights % cityOrder.length;
  let cursor = startDate;

  return cityOrder.map((city, index) => {
    const nights = baseNights + (index < remainder ? 1 : 0);
    const checkIn = cursor;
    const checkOut = addDays(cursor, nights);
    cursor = checkOut;

    return {
      city,
      cityName: CITY_NAMES[city] ?? city,
      checkIn,
      checkOut,
      nights,
    };
  });
}

function buildFlightLegs(cityOrder, startDate, endDate, cityStays) {
  if (!cityOrder.length) return [];

  const legs = [makeLeg("entry", "BLR", cityOrder[0], startDate, 0)];

  for (let i = 0; i < cityOrder.length - 1; i += 1) {
    legs.push(makeLeg("intercity", cityOrder[i], cityOrder[i + 1], cityStays[i].checkOut, i + 1));
  }

  legs.push(makeLeg("exit", cityOrder[cityOrder.length - 1], "BLR", endDate, legs.length));
  return legs;
}

function makeLeg(type, from, to, date, index) {
  return {
    id: `${type}_${from}_${to}_${index}`,
    type,
    from,
    to,
    date,
    label: `${from} -> ${to}`,
    fromName: CITY_NAMES[from] ?? from,
    toName: CITY_NAMES[to] ?? to,
  };
}

function diffDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  return Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
}

function addDays(dateStr, days) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
