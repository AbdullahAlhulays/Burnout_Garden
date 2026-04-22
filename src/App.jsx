import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import WateringCanOverlay from "./components/WateringCan";
import BreatheOverlay from "./components/BreatheOverlay";
import MicroChallengePrompt from "./components/MicroChallengePrompt";
import WordleGameModal from "./components/WordleGameModal";
import HomePage from "./pages/Home";
import CheckInPage from "./pages/CheckIn";
import DashboardPage from "./pages/Dashboard";
import SummaryPage from "./pages/Summary";
import {
  getGardenProgress,
  getLatestEntry,
  updateGardenSettings,
} from "./utils/localStorage";
import { getWeatherMood, needsChallengeForScores } from "./utils/insights";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [showWatering, setShowWatering] = useState(false);
  const [latestEntryResult, setLatestEntryResult] = useState(null);
  const [showChallengePrompt, setShowChallengePrompt] = useState(false);
  const [showBreathe, setShowBreathe] = useState(false);
  const [showWordle, setShowWordle] = useState(false);
  const [wordleVersion, setWordleVersion] = useState(0);

  const latestEntry = getLatestEntry();
  const weatherMood = getWeatherMood(latestEntry?.overall ?? 35);
  const gardenProgress = getGardenProgress(wordleVersion);

  useEffect(() => {
    if (window.Chart) return;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    document.head.appendChild(script);
  }, []);

  function navigate(page) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  function handleCheckInDone(entry) {
    setLatestEntryResult(entry);
    setShowWatering(true);
  }

  function handleWateringDone() {
    setShowWatering(false);

    if (latestEntryResult?.scores && needsChallengeForScores(latestEntryResult.scores)) {
      setShowChallengePrompt(true);
      return;
    }

    navigate("dashboard");
  }

  function handleChallengeDone() {
    setShowChallengePrompt(false);
    navigate("dashboard");
  }

  function handleWordleProgressChange() {
    setWordleVersion((value) => value + 1);
  }

  function handleGardenSettingsUpdate(patch) {
    updateGardenSettings(patch);
    handleWordleProgressChange();
  }

  return (
    <div>
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenBreathe={() => setShowBreathe(true)}
      />

      {currentPage === "home" ? (
        <HomePage
          onNavigate={navigate}
          weatherMood={weatherMood}
          totalPoints={gardenProgress.totalPoints}
          gardenSettings={gardenProgress.settings}
          onUpdateGardenSettings={handleGardenSettingsUpdate}
        />
      ) : null}

      {currentPage === "checkin" ? (
        <CheckInPage onDone={handleCheckInDone} />
      ) : null}

      {currentPage === "dashboard" ? (
        <DashboardPage
          onNavigate={navigate}
          weatherMood={weatherMood}
          totalPoints={gardenProgress.totalPoints}
          gardenSettings={gardenProgress.settings}
          onUpdateGardenSettings={handleGardenSettingsUpdate}
        />
      ) : null}

      {currentPage === "weekly" ? (
        <SummaryPage weatherMood={weatherMood} />
      ) : null}

      <button
        type="button"
        onClick={() => setShowWordle(true)}
        className="wordle-entry-button"
      >
        <span className="wordle-entry-icon">🍃</span>
        <span className="wordle-entry-copy">
          <strong>Daily Puzzle</strong>
          <small>{gardenProgress.playedToday ? "Played today" : "Play once for points"}</small>
        </span>
        <span className="wordle-entry-badge">Tier {gardenProgress.tier}</span>
      </button>

      {showWatering && latestEntryResult?.treeScores ? (
        <WateringCanOverlay
          treeScores={latestEntryResult.treeScores}
          onFinish={handleWateringDone}
        />
      ) : null}

      {showChallengePrompt && latestEntryResult?.scores ? (
        <MicroChallengePrompt
          scores={latestEntryResult.scores}
          onDone={handleChallengeDone}
        />
      ) : null}

      <WordleGameModal
        open={showWordle}
        onClose={() => setShowWordle(false)}
        onProgressChange={handleWordleProgressChange}
      />

      <BreatheOverlay
        open={showBreathe}
        onClose={() => setShowBreathe(false)}
        weatherMood={weatherMood}
      />
    </div>
  );
}
