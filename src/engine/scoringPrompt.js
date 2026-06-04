// Pure, secret-free helpers shared by the client (local dev) and the Vercel
// serverless function (/api/score). No API keys, no browser-only globals here.

// ─── INVENTORY FORMATTER ─────────────────────────────────────────────────────
// Compact representation for the AI — keeps tokens low while preserving every
// signal the scoring rules need.
export function formatInventoryForAI(allInventory) {
  const items = [];

  allInventory.flightsInbound.forEach((f) => {
    items.push({
      id: f.id,
      category: "flight_inbound",
      airline: f.airline,
      route: `BLR→BKK`,
      stops: f.stops === 0 ? "direct" : `${f.stops} stop via ${f.stopCity}`,
      duration: f.duration,
      pricePerPerson: f.pricePerPerson,
      flightTier: f.flightAxis,
    });
  });

  allInventory.flightsIntercity.forEach((f) => {
    items.push({
      id: f.id,
      category: "flight_intercity",
      airline: f.airline,
      route: `${f.from}→${f.to}`,
      stops: f.stops === 0 ? "direct" : `${f.stops} stop via ${f.stopCity}`,
      duration: f.duration,
      pricePerPerson: f.pricePerPerson,
      flightTier: f.flightAxis,
    });
  });

  allInventory.flightsReturn.forEach((f) => {
    items.push({
      id: f.id,
      category: "flight_return",
      airline: f.airline,
      route: `${f.from}→BLR`,
      stops: f.stops === 0 ? "direct" : `${f.stops} stop via ${f.stopCity}`,
      duration: f.duration,
      pricePerPerson: f.pricePerPerson,
      flightTier: f.flightAxis,
    });
  });

  allInventory.hotels.forEach((h) => {
    items.push({
      id: h.id,
      category: "hotel",
      name: h.name,
      city: h.cityName,
      stars: h.stars,
      stayTier: h.stayAxis,
      vibes: h.vibe,
      pricePerNight: h.pricePerNight,
    });
  });

  allInventory.experiences.forEach((e) => {
    items.push({
      id: e.id,
      category: "experience",
      name: e.name,
      city: e.cityName,
      type: e.category,
      priceTier: e.priceTier,
      vibes: e.vibe,
      foodType: e.foodType || "none",
      pricePerPerson: e.pricePerPerson,
    });
  });

  return items;
}

// ─── PROMPT BUILDER ──────────────────────────────────────────────────────────
export function buildPrompt(constraints, items) {
  const cityMap = { BKK: "Bangkok", HKT: "Phuket", CNX: "Chiang Mai" };
  const cityNames = constraints.cities.map((c) => cityMap[c]).join(", ");

  return `You are a travel recommendation engine for Scapia, an Indian travel fintech app.
Score every item below from 0–100 for how well it fits THIS specific traveller's profile and trip intent.
You MUST produce genuinely differentiated scores — a budget traveller and a luxury traveller must get opposite rankings on the same item.

═══ TRAVELLER PROFILE FOR THIS TRIP ═══
Stay tier: ${constraints.effectiveStay}   (Budget < Mid < Luxury)
Flight tier: ${constraints.effectiveFlight}   (Cheapest < Balanced < Premium)
Vibe: ${constraints.effectiveVibeLabel}${constraints.vibeIsOverridden ? `  ← ACTIVE CHOICE this trip (overrides their usual profile)` : "  (from travel profile)"}
Food preference: ${constraints.effectiveFood}
Cities: ${cityNames}
Duration: ${constraints.tripDays} days
Group: ${constraints.groupLabel}
Budget per person: ${constraints.budgetPerPersonLabel}   (all figures below are per person)
  → Flight budget: ₹${constraints.flightBudget.toLocaleString("en-IN")} (${Math.round(constraints.splitFlight * 100)}%)
  → Stay budget:   ₹${constraints.stayBudget.toLocaleString("en-IN")} (${Math.round(constraints.splitStay * 100)}%)
  → Experience budget: ₹${constraints.expBudget.toLocaleString("en-IN")} (${Math.round(constraints.splitExp * 100)}%)

═══ MANDATORY SCORING RULES ═══

FLIGHTS (flightTier must drive the score, not price alone):
• flightTier=Cheapest → budget/indirect flights: 80–95 | mid: 45–60 | premium: 10–28
• flightTier=Balanced → direct/mid: 78–92 | budget indirect: 48–65 | premium: 55–72
• flightTier=Premium  → premium/direct: 85–97 | mid: 52–68 | budget indirect: 10–28
Also adjust ±8 for: directness bonus, price vs budget target fit.

HOTELS (stayTier must drive the score):
• stayTier=Budget  → budget/1-2★: 82–93 | mid/4★: 38–55 | luxury/5★: 8–22
• stayTier=Mid     → mid/4★: 83–92 | budget: 42–58 | luxury: 45–62
• stayTier=Luxury  → luxury/5★: 85–97 | mid: 34–50 | budget: 5–18
Also adjust ±8 for: vibe match, price vs stay budget target.

EXPERIENCES:
Score primarily on vibe match:
• Strong match (vibe in traveller's list): 74–92
• Partial match: 44–64
• Poor match: 18–40
Apply these food bonuses (additive, cap at 97):
• foodType matches traveller's food preference → +10
• Only show cities the traveller is visiting: visiting ${cityNames}, so ignore items in other cities when ranking.

═══ REASON FORMAT ═══
One sentence. Must name a specific profile attribute. Be concrete:
✓ "Matches your Cheapest flight preference — saves ₹7,000 vs direct Air India"
✓ "Your Luxury stay profile calls for 5-star; Mandarin Oriental is Bangkok's best"
✓ "Adventure vibe + Packed trip choice makes this scuba day a perfect fit"
✗ "Good option for this traveller" (too vague — rejected)

Return ONLY valid JSON:
{"scores":{"ITEM_ID":{"score":85,"reason":"..."}}}

═══ INVENTORY ═══
${JSON.stringify(items, null, 2)}`;
}
