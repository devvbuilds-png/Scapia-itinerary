/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { MOCK_USERS } from "../data/mockUsers";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState(MOCK_USERS[0]);
  const [onboardingAnswers, setOnboardingAnswers] = useState(null);
  const [constraintObject, setConstraintObject] = useState(null);
  const [scoredInventory, setScoredInventory] = useState(null);
  const [autoItineraries, setAutoItineraries] = useState([]);
  const [manualItinerary, setManualItinerary] = useState({
    inboundFlight: null,
    returnFlight: null,
    intercityFlights: [],
    flightSelections: {},
    flightLegs: [],
    flightTotal: 0,
    stays: {},        // { cityCode: hotelObject }
    stayTotal: 0,
    experiences: [],  // array of enriched experience objects
    expTotal: 0,
  });
  const [wishlist, setWishlist] = useState([]);

  const switchUser = (userId) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      // Reset downstream state when switching users
      setOnboardingAnswers(null);
      setConstraintObject(null);
      setScoredInventory(null);
      setAutoItineraries([]);
      setManualItinerary({
        inboundFlight: null,
        returnFlight: null,
        intercityFlights: [],
        flightSelections: {},
        flightLegs: [],
        flightTotal: 0,
        stays: {},
        stayTotal: 0,
        experiences: [],
        expTotal: 0,
      });
    }
  };

  const saveToWishlist = (itinerary) => {
    setWishlist((prev) => [...prev, { ...itinerary, savedAt: Date.now() }]);
  };

  const removeFromWishlist = (index) => {
    setWishlist((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <AppContext.Provider
      value={{
        selectedUser,
        switchUser,
        onboardingAnswers,
        setOnboardingAnswers,
        constraintObject,
        setConstraintObject,
        scoredInventory,
        setScoredInventory,
        autoItineraries,
        setAutoItineraries,
        manualItinerary,
        setManualItinerary,
        wishlist,
        saveToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
