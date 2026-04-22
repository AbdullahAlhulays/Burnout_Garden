import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";

function HomePage({
  onNavigate,
  weatherMood,
  totalPoints,
  gardenSettings,
  onUpdateGardenSettings,
}) {
  return (
    <div className={`page-shell weather-${weatherMood}`}>
      <div className="page-content">
        <HeroSection
          onStartCheckin={() => onNavigate("checkin")}
          onViewGarden={() => onNavigate("dashboard")}
          totalPoints={totalPoints}
          gardenSettings={gardenSettings}
          onUpdateGardenSettings={onUpdateGardenSettings}
        />
        <HowItWorks />
      </div>
    </div>
  );
}

export default HomePage;
