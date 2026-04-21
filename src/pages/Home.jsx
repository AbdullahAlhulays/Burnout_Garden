import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";


function HomePage({ onNavigate }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(170deg, #e4f3eb 0%, #faf8f3 55%, #f5eedf 100%)" }}
    >
      <HeroSection
        onStartCheckin={() => onNavigate("checkin")}
        onViewGarden={() => onNavigate("dashboard")}
      />
      <HowItWorks />
    </div>
  );
}

export default HomePage;
