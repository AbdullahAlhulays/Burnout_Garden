import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import WateringCanOverlay from "./components/WateringCan";
import HomePage from "./pages/Home";
import CheckInPage from "./pages/CheckIn";
import DashboardPage from "./pages/Dashboard";
import SummaryPage from "./pages/Summary";

//
// Root component. Manages which page is visible
// and shows the watering overlay after check-in.

export default function App() {
  const [currentPage,    setCurrentPage]    = useState("home");
  const [showWatering,   setShowWatering]   = useState(false);
  const [wateringScores, setWateringScores] = useState(null);

  // Load Chart.js once on mount
  useEffect(() => {
    if (window.Chart) return;
    const script = document.createElement("script");
    script.src   = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    document.head.appendChild(script);
  }, []);

  function navigate(page) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  function handleCheckInDone(scores) {
    setWateringScores(scores);
    setShowWatering(true);
  }

  function handleWateringDone() {
    setShowWatering(false);
    navigate("dashboard");
  }

  return (
    <div>
      <Navbar currentPage={currentPage} onNavigate={navigate} />

      {currentPage === "home"      && <HomePage      onNavigate={navigate} />}
      {currentPage === "checkin"   && <CheckInPage   onDone={handleCheckInDone} />}
      {currentPage === "dashboard" && <DashboardPage onNavigate={navigate} />}
      {currentPage === "weekly"    && <SummaryPage />}

      {showWatering && wateringScores && (
        <WateringCanOverlay
          scores={wateringScores}
          onFinish={handleWateringDone}
        />
      )}
    </div>
  );
}
