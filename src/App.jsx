import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import TravelProfile from "./screens/TravelProfile";
import Onboarding from "./screens/Onboarding";
import Summary from "./screens/Summary";
import Flights from "./screens/Flights";
import Stays from "./screens/Stays";
import Experiences from "./screens/Experiences";
import ItinerarySummary from "./screens/ItinerarySummary";
import AutoBuildLoading from "./screens/AutoBuildLoading";
import AutoBuildCompare from "./screens/AutoBuildCompare";
import AutoBuildDetail from "./screens/AutoBuildDetail";
import DayByDay from "./screens/DayByDay";
import MyItineraries from "./screens/MyItineraries";
import { BottomNav } from "./components/ui";

// Reset scroll to the top on every route change so each screen opens at its top,
// not wherever the previous screen was scrolled to.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div style={{ background: "#EEF1F6", minHeight: "100dvh", maxWidth: 440, margin: "0 auto", position: "relative", overflowX: "clip" }}>
          <Routes>
            {/* ── Profile + onboarding ── */}
            <Route path="/" element={<TravelProfile />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/summary" element={<Summary />} />

            {/* ── Flow 1: AI Auto-Build ── */}
            <Route path="/auto-loading" element={<AutoBuildLoading />} />
            <Route path="/auto-compare" element={<AutoBuildCompare />} />
            <Route path="/auto-detail/:index" element={<AutoBuildDetail />} />
            <Route path="/day-by-day" element={<DayByDay />} />
            <Route path="/my-itineraries" element={<MyItineraries />} />

            {/* ── Flow 2: Manual Build ── */}
            <Route path="/flights" element={<Flights />} />
            <Route path="/stays" element={<Stays />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/itinerary" element={<ItinerarySummary />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
