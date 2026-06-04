// ─── AUTO ASSEMBLY ENGINE ────────────────────────────────────────────────────
// Deterministically assembles 3 themed itineraries from the scored inventory.
// Uses the same scoredInventory cached from Phase 3 — ZERO new AI calls.
//
// Experiences are split into two independent buckets:
//
//   ACTIVITIES  → Adventure, Culture, Wellness, Nightlife, Leisure
//   FOOD+DINING → Food (cooking classes / food tours) + Dining (restaurants)
//
// "Food" category items stay in the food bucket because they are explicitly
// food-focused activities — a cooking class is not the same as Muay Thai.
// Only Dining-category items are restaurant sits, but both are governed by
// the foodAxis, so they belong together.
//
// Quotas per city:
//   Activities  = max(1, round(nights × VIBE_DENSITY[effectiveVibe]))
//   Food+Dining = max(1, round(nights × FOOD_DENSITY[effectiveFood]))
//
// expBudget internal split (derived from foodAxis, NOT hardcoded):
//   Street      → 85% activities / 15% food+dining
//   Casual      → 75% / 25%
//   Fine dining → 60% / 40%

import { ALL_INVENTORY } from '../data/inventory.js';

// ─── TABLES ──────────────────────────────────────────────────────────────────

// Activities per night, keyed by effectiveVibe (lowercase)
const VIBE_DENSITY = {
  chill:     0.40,   // 3n→1  4n→2  6n→2
  cultural:  0.60,   // 3n→2  4n→2  6n→4
  adventure: 0.85,   // 3n→3  4n→3  6n→5
  party:     0.55,   // 3n→2  4n→2  6n→3
};

// Food+dining experiences per night, keyed by effectiveFood
const FOOD_DENSITY = {
  Street:        0.20,   // 3n→1  6n→1  9n→2
  Casual:        0.30,   // 3n→1  6n→2  9n→3
  'Fine dining': 0.45,   // 3n→1  6n→3  9n→4
};

// Share of expBudget reserved for food+dining, keyed by effectiveFood
const FOOD_EXP_SHARE = {
  Street:        0.15,
  Casual:        0.25,
  'Fine dining': 0.40,
};

// Activity category priority per vibe — index = priority (0 = surfaces first)
const ACTIVITY_PRIORITY = {
  chill:     ['Wellness', 'Leisure', 'Culture', 'Adventure', 'Nightlife'],
  cultural:  ['Culture', 'Wellness', 'Adventure', 'Leisure', 'Nightlife'],
  adventure: ['Adventure', 'Leisure', 'Culture', 'Wellness', 'Nightlife'],
  party:     ['Nightlife', 'Adventure', 'Leisure', 'Culture', 'Wellness'],
};

// These two categories belong to the food+dining bucket
const FOOD_DINING_CATS = new Set(['Food', 'Dining']);

// ─── SCORING HELPERS ─────────────────────────────────────────────────────────

/** Attach AI scores + sort descending (no side-effects on original array) */
function withScores(items, scoredInventory) {
  return items
    .map(item => ({
      ...item,
      aiScore: scoredInventory[item.id]?.score ?? 50,
      aiReason: scoredInventory[item.id]?.reason ?? 'Good fit for this trip',
    }))
    .sort((a, b) => b.aiScore - a.aiScore);
}

// ─── TIER-FIRST SORT HELPERS ──────────────────────────────────────────────────
//
// The +bonus approach was insufficient: if AI scores one item 90 and another 40,
// a +15 bonus for the "right" tier never flips the result. Instead we use
// TIER-FIRST sorting: the strategy's preferred tier always surfaces first, then
// AI score breaks ties WITHIN the same tier. This guarantees visibly different
// picks across the 3 themes.

function flightTierRank(flight, strategy) {
  // Lower rank = surfaces first
  if (strategy === 'budget') {
    return { Cheapest: 0, Balanced: 1, Premium: 2 }[flight.flightAxis] ?? 3;
  }
  if (strategy === 'premium') {
    return { Premium: 0, Balanced: 1, Cheapest: 2 }[flight.flightAxis] ?? 3;
  }
  return 0; // bestMatch: no tier preference, pure AI score
}

function hotelTierRank(hotel, strategy) {
  if (strategy === 'budget') {
    return { Budget: 0, Mid: 1, Luxury: 2 }[hotel.stayAxis] ?? 3;
  }
  if (strategy === 'premium') {
    return { Luxury: 0, Mid: 1, Budget: 2 }[hotel.stayAxis] ?? 3;
  }
  return 0;
}

function activityTierRank(exp, strategy) {
  if (strategy === 'budget') {
    return { budget: 0, mid: 1, luxury: 2 }[exp.priceTier] ?? 3;
  }
  if (strategy === 'premium') {
    return { luxury: 0, mid: 1, budget: 2 }[exp.priceTier] ?? 3;
  }
  return 0;
}

// ─── FLIGHT PICKER ────────────────────────────────────────────────────────────

function pickFlight(leg, allInventory, scoredInventory, strategy) {
  let pool;
  if (leg.type === 'entry') {
    pool = allInventory.flightsInbound.filter(f => f.to === leg.to);
  } else if (leg.type === 'intercity') {
    pool = allInventory.flightsIntercity.filter(
      f => f.from === leg.from && f.to === leg.to
    );
  } else {
    pool = allInventory.flightsReturn.filter(f => f.from === leg.from);
  }
  if (!pool.length) return null;

  const scored = withScores(pool, scoredInventory);
  scored.sort((a, b) => {
    const tierDiff = flightTierRank(a, strategy) - flightTierRank(b, strategy);
    if (tierDiff !== 0) return tierDiff;
    return b.aiScore - a.aiScore; // tie-break within tier
  });

  return scored[0];
}

// ─── HOTEL PICKER ─────────────────────────────────────────────────────────────

function pickHotel(cs, allInventory, scoredInventory, strategy) {
  const pool = allInventory.hotels.filter(h => h.city === cs.city);
  if (!pool.length) return null;

  const scored = withScores(pool, scoredInventory);
  scored.sort((a, b) => {
    const tierDiff = hotelTierRank(a, strategy) - hotelTierRank(b, strategy);
    if (tierDiff !== 0) return tierDiff;
    return b.aiScore - a.aiScore;
  });

  const picked = scored[0];
  if (!picked) return null;
  return {
    ...picked,
    nights: cs.nights,
    checkIn: cs.checkIn,
    checkOut: cs.checkOut,
    totalCost: picked.pricePerNight * cs.nights,
    coinsEarned: picked.coinsPerNight * cs.nights,
  };
}

// ─── ACTIVITY PICKER ─────────────────────────────────────────────────────────

function pickActivities(cityStays, allInventory, scoredInventory, strategy, vibe, actBudgetPerPerson) {
  const chosen = [];
  let spent = 0;
  const density = VIBE_DENSITY[vibe?.toLowerCase()] ?? 0.60;
  const vibeLower = vibe?.toLowerCase();

  for (const cs of cityStays) {
    const maxForCity = Math.max(1, Math.round(cs.nights * density));

    const pool = allInventory.experiences.filter(
      e => e.city === cs.city && !FOOD_DINING_CATS.has(e.category)
    );
    const scored = withScores(pool, scoredInventory);

    // Tier-first + vibe-category sort:
    //   1. Strategy tier (budget=budget-first, premium=luxury-first, bestMatch=no pref)
    //   2. Vibe category priority (adventure vibe → Adventure category first)
    //   3. AI score tie-break
    const order = ACTIVITY_PRIORITY[vibeLower] ?? ACTIVITY_PRIORITY.cultural;
    scored.sort((a, b) => {
      const tierDiff = activityTierRank(a, strategy) - activityTierRank(b, strategy);
      if (tierDiff !== 0) return tierDiff;
      // Within same tier, prefer vibe-matched category
      const catA = order.indexOf(a.category);
      const catB = order.indexOf(b.category);
      const catRankA = catA === -1 ? order.length : catA;
      const catRankB = catB === -1 ? order.length : catB;
      if (catRankA !== catRankB) return catRankA - catRankB;
      return b.aiScore - a.aiScore;
    });

    let pickedForCity = 0;
    for (const exp of scored) {
      if (pickedForCity >= maxForCity) break;
      if (spent + exp.pricePerPerson <= actBudgetPerPerson * 1.15) {
        chosen.push(exp);
        spent += exp.pricePerPerson;
        pickedForCity++;
      }
    }
    // Guarantee ≥1 per city — cheapest fallback if budget blown
    if (pickedForCity === 0 && scored.length > 0) {
      const fallback = [...scored].sort((a, b) => a.pricePerPerson - b.pricePerPerson)[0];
      chosen.push(fallback);
      spent += fallback.pricePerPerson;
    }
  }
  return chosen;
}

// ─── FOOD+DINING PICKER ───────────────────────────────────────────────────────

function pickFoodDining(cityStays, allInventory, scoredInventory, strategy, foodAxis, diningBudgetPerPerson) {
  const chosen = [];
  let spent = 0;
  const density = FOOD_DENSITY[foodAxis] ?? 0.30;

  // foodAxis drives the primary tier (Fine dining user stays in upscale dining even on budget strategy)
  // strategy nudges within tier (budget strategy slightly prefers cheaper options within the foodAxis tier)
  const foodTierRank = (exp) => {
    if (foodAxis === 'Street') {
      return { budget: 0, mid: 1, luxury: 2 }[exp.priceTier] ?? 3;
    }
    if (foodAxis === 'Fine dining') {
      return { luxury: 0, mid: 1, budget: 2 }[exp.priceTier] ?? 3;
    }
    // Casual: neutral tier, use strategy nudge
    if (strategy === 'budget') return { budget: 0, mid: 1, luxury: 2 }[exp.priceTier] ?? 3;
    if (strategy === 'premium') return { luxury: 0, mid: 1, budget: 2 }[exp.priceTier] ?? 3;
    return 0;
  };

  for (const cs of cityStays) {
    const maxForCity = Math.max(1, Math.round(cs.nights * density));

    const pool = allInventory.experiences.filter(
      e => e.city === cs.city && FOOD_DINING_CATS.has(e.category)
    );
    const scored = withScores(pool, scoredInventory);
    scored.sort((a, b) => {
      const tierDiff = foodTierRank(a) - foodTierRank(b);
      if (tierDiff !== 0) return tierDiff;
      return b.aiScore - a.aiScore;
    });

    let pickedForCity = 0;
    for (const exp of scored) {
      if (pickedForCity >= maxForCity) break;
      if (spent + exp.pricePerPerson <= diningBudgetPerPerson * 1.15) {
        chosen.push(exp);
        spent += exp.pricePerPerson;
        pickedForCity++;
      }
    }
    // Guarantee ≥1 per city
    if (pickedForCity === 0 && scored.length > 0) {
      const fallback = [...scored].sort((a, b) => a.pricePerPerson - b.pricePerPerson)[0];
      chosen.push(fallback);
      spent += fallback.pricePerPerson;
    }
  }
  return chosen;
}

// ─── THEMES ──────────────────────────────────────────────────────────────────

const THEMES = [
  {
    id: 'best_match',
    name: 'Your Best Match',
    emoji: '✨',
    tagline: 'Highest-scored picks tailored to your travel profile',
    color: '#6366f1',
    bgLight: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  {
    id: 'budget_smart',
    name: 'Budget Smart',
    emoji: '💡',
    tagline: 'Maximum experiences, minimum spend',
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  {
    id: 'premium_upgrade',
    name: 'Premium Upgrade',
    emoji: '👑',
    tagline: 'Elevated picks — when you want to truly indulge',
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
  },
];

const STRATEGIES = ['bestMatch', 'budget', 'premium'];

// ─── BUILDER ─────────────────────────────────────────────────────────────────

function buildItinerary(themeIndex, constraintObject, scoredInventory) {
  const theme = THEMES[themeIndex];
  const strategy = STRATEGIES[themeIndex];
  const {
    requiredFlightLegs,
    cityStays,
    cityOrder,
    roomShare,
    expBudget,            // already per-person
    budgetPerPerson,
    effectiveVibe,
    effectiveFood,
  } = constraintObject;

  // ── expBudget split derived from foodAxis (expBudget is per-person) ────────
  const foodShare = FOOD_EXP_SHARE[effectiveFood] ?? 0.25;
  const actBudgetPerPerson    = Math.round(expBudget * (1 - foodShare));
  const diningBudgetPerPerson = expBudget - actBudgetPerPerson;

  // ── Flights ───────────────────────────────────────────────────────────────
  const flightSelections = {};
  let flightTotal = 0;
  for (const leg of requiredFlightLegs) {
    const flight = pickFlight(leg, ALL_INVENTORY, scoredInventory, strategy);
    if (flight) {
      flightSelections[leg.id] = {
        ...flight,
        legId: leg.id,
        legType: leg.type,
        legDate: leg.date,
        legLabel: leg.label,
        legFromName: leg.fromName,
        legToName: leg.toName,
      };
      flightTotal += flight.pricePerPerson;
    }
  }

  // ── Hotels ────────────────────────────────────────────────────────────────
  const stays = {};
  let stayTotal = 0;
  for (const cs of cityStays) {
    const hotel = pickHotel(cs, ALL_INVENTORY, scoredInventory, strategy);
    if (hotel) {
      stays[cs.city] = hotel;
      stayTotal += hotel.pricePerNight * cs.nights;
    }
  }

  // ── Activities (Adventure / Culture / Wellness / Nightlife / Leisure) ─────
  const activities = pickActivities(
    cityStays, ALL_INVENTORY, scoredInventory, strategy, effectiveVibe, actBudgetPerPerson
  );
  const actTotal = activities.reduce((s, e) => s + e.pricePerPerson, 0);

  // ── Food & Dining (Food cooking tours + Dining restaurants) ───────────────
  const foodDining = pickFoodDining(
    cityStays, ALL_INVENTORY, scoredInventory, strategy, effectiveFood, diningBudgetPerPerson
  );
  const diningTotal = foodDining.reduce((s, e) => s + e.pricePerPerson, 0);

  const expTotal = actTotal + diningTotal;

  // ── Totals (per-person only) ──────────────────────────────────────────────
  const stayPerPerson   = Math.round(stayTotal / roomShare);
  const perPersonTotal  = flightTotal + stayPerPerson + expTotal;

  // ── Coins (per-person — 20% of what this traveller actually pays) ──────────
  const flightCoins = Object.values(flightSelections).reduce(
    (s, f) => s + (f.coinsEarned ?? Math.round(f.pricePerPerson * 0.2)), 0
  );
  const stayCoins   = Math.round(Object.values(stays).reduce((s, h) => s + (h.coinsEarned ?? 0), 0) / roomShare);
  const actCoins    = activities.reduce((s, e) => s + (e.coinsEarned ?? Math.round(e.pricePerPerson * 0.2)), 0);
  const diningCoins = foodDining.reduce((s, e) => s + (e.coinsEarned ?? Math.round(e.pricePerPerson * 0.2)), 0);
  const totalCoinsEarned = flightCoins + stayCoins + actCoins + diningCoins;

  return {
    ...theme,
    strategy,
    // Flights
    flightSelections,
    flightLegs: requiredFlightLegs,
    flightTotal,
    // Stays
    stays,
    stayTotal,
    stayPerPerson,
    // Experiences — two separate buckets + combined for any shared consumers
    activities,
    foodDining,
    experiences: [...activities, ...foodDining],
    actTotal,
    diningTotal,
    expTotal,
    // Totals
    perPersonTotal,
    totalCoinsEarned,
    overBudget: perPersonTotal > budgetPerPerson,
    budgetDelta: perPersonTotal - budgetPerPerson,
    // Trip shape
    cityStays,
    cityOrder,
    roomShare,
    // Budget context (useful for "why" lines in UI)
    actBudgetPerPerson,
    diningBudgetPerPerson,
    effectiveVibe,
    effectiveFood,
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function assembleAutoItineraries(constraintObject, scoredInventory) {
  return [0, 1, 2].map(i => buildItinerary(i, constraintObject, scoredInventory));
}
