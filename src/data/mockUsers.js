// Mock user profiles derived from card spend + booking history
// Each user has 4 axes: stay, flight, vibe, food + budget band + derived facts + coin balance

export const MOCK_USERS = [
  {
    id: "user_1",
    name: "Priya Sharma",
    avatar: "PS",
    avatarUrl: "/avatars/priya.jpg",
    city: "Bangalore",
    homeAirport: "BLR",
    // Axis 1: Stay preference
    stayAxis: "Luxury",         // Budget | Mid | Luxury
    // Axis 2: Flight preference
    flightAxis: "Balanced",     // Cheapest | Balanced | Premium
    // Axis 3: Vibe preference
    vibeAxis: "Adventure",      // Chill | Cultural | Adventure
    // Axis 4: Food preference
    foodAxis: "Fine dining",    // Street | Casual | Fine dining
    // Budget band (₹ per person per trip)
    budgetBand: { min: 80000, max: 150000, label: "₹80k–1.5L" },
    // Derived facts from booking history
    derivedFacts: [
      "Prefers 4-5 star hotels",
      "Books adventure activities",
      "Fine dining 3+ times per trip",
      "Usually travels as couple",
    ],
    coinBalance: 24500,
    cardSpendCategory: "Premium Traveller",
    // For display
    profileSummary: "Luxury stays, adventure seeker, fine diner",
  },
  {
    id: "user_2",
    name: "Rahul Mehta",
    avatar: "RM",
    avatarUrl: "/avatars/rahul.avif",
    city: "Bangalore",
    homeAirport: "BLR",
    stayAxis: "Budget",
    flightAxis: "Cheapest",
    vibeAxis: "Chill",
    foodAxis: "Street",
    budgetBand: { min: 25000, max: 50000, label: "₹25k–50k" },
    derivedFacts: [
      "Prefers hostels or budget hotels",
      "Always picks cheapest flight",
      "Street food enthusiast",
      "Flexible on dates for deals",
    ],
    coinBalance: 8200,
    cardSpendCategory: "Budget Explorer",
    profileSummary: "Budget stays, chill traveller, street food lover",
  },
  {
    id: "user_3",
    name: "Ananya Iyer",
    avatar: "AI",
    avatarUrl: "/avatars/ananya.avif",
    city: "Bangalore",
    homeAirport: "BLR",
    stayAxis: "Mid",
    flightAxis: "Balanced",
    vibeAxis: "Cultural",
    foodAxis: "Casual",
    budgetBand: { min: 45000, max: 80000, label: "₹45k–80k" },
    derivedFacts: [
      "Mid-range hotel preference",
      "Visits museums and temples",
      "Enjoys local cafes",
      "Books direct flights when price diff < ₹2000",
    ],
    coinBalance: 14800,
    cardSpendCategory: "Culture Seeker",
    profileSummary: "Mid-range stays, culture lover, casual diner",
  },
  {
    id: "user_4",
    name: "Karan Singh",
    avatar: "KS",
    avatarUrl: "/avatars/karan.avif",
    city: "Bangalore",
    homeAirport: "BLR",
    stayAxis: "Luxury",
    flightAxis: "Premium",
    vibeAxis: "Chill",
    foodAxis: "Fine dining",
    budgetBand: { min: 150000, max: 300000, label: "₹1.5L–3L" },
    derivedFacts: [
      "5-star hotels only",
      "Business/premium economy preferred",
      "Spa and pool must-have",
      "Dines at rated restaurants",
    ],
    coinBalance: 62000,
    cardSpendCategory: "Luxury Lounger",
    profileSummary: "Luxury stays, premium flights, relaxed pace",
  },
  {
    id: "user_5",
    name: "Meera Nair",
    avatar: "MN",
    avatarUrl: "/avatars/meera.jpg",
    city: "Bangalore",
    homeAirport: "BLR",
    stayAxis: "Mid",
    flightAxis: "Cheapest",
    vibeAxis: "Adventure",
    foodAxis: "Street",
    budgetBand: { min: 35000, max: 65000, label: "₹35k–65k" },
    derivedFacts: [
      "Comfortable mid-range hotels",
      "Always searches for flight deals",
      "Outdoor activities over nightlife",
      "Tries local street food first",
    ],
    coinBalance: 11300,
    cardSpendCategory: "Adventure on a Budget",
    profileSummary: "Mid-range stays, cheap flights, adventure + street food",
  },
];

export const getUserById = (id) => MOCK_USERS.find((u) => u.id === id) || MOCK_USERS[0];

// Axis color coding for display
export const AXIS_COLORS = {
  // Stay
  Budget: { bg: "#e8f5e9", text: "#2e7d32" },
  Mid: { bg: "#e3f2fd", text: "#1565c0" },
  Luxury: { bg: "#f3e5f5", text: "#6a1b9a" },
  // Flight
  Cheapest: { bg: "#e8f5e9", text: "#2e7d32" },
  Balanced: { bg: "#e3f2fd", text: "#1565c0" },
  Premium: { bg: "#fce4ec", text: "#880e4f" },
  // Vibe
  Chill: { bg: "#e0f7fa", text: "#00695c" },
  Cultural: { bg: "#fff3e0", text: "#e65100" },
  Adventure: { bg: "#fbe9e7", text: "#bf360c" },
  Party: { bg: "#fdf4ff", text: "#9333ea" },
  // Food
  Street: { bg: "#f9fbe7", text: "#558b2f" },
  Casual: { bg: "#fafafa", text: "#424242" },
  "Fine dining": { bg: "#fce4ec", text: "#880e4f" },
};
