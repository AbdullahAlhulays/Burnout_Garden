import { useEffect, useMemo, useState } from "react";
import MainTree from "./MainTree";
import { getLatestEntry } from "../utils/localStorage";

const TOTAL_DURATION_MS = 120000;
const CYCLE_MS = 12000;

function getBreathMoment(elapsedMs) {
  const cycleOffset = elapsedMs % CYCLE_MS;

  if (cycleOffset < 4000) {
    return { phase: "inhale", pulse: cycleOffset / 4000, counter: "4" };
  }

  if (cycleOffset < 8000) {
    return { phase: "hold", pulse: 1, counter: "4" };
  }

  return {
    phase: "exhale",
    pulse: 1 - (cycleOffset - 8000) / 4000,
    counter: "4",
  };
}

function BreatheOverlay({ open, onClose, weatherMood = "thriving" }) {
  const latestEntry = useMemo(() => getLatestEntry(), [open]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setElapsed(0);
      return undefined;
    }

    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt;

      if (nextElapsed >= TOTAL_DURATION_MS) {
        setElapsed(TOTAL_DURATION_MS);
        window.clearInterval(interval);
        window.setTimeout(onClose, 350);
        return;
      }

      setElapsed(nextElapsed);
    }, 120);

    return () => window.clearInterval(interval);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const breathMoment = getBreathMoment(elapsed);
  const brightness = 0.84 + breathMoment.pulse * 0.24;
  const progress = Math.min(100, (elapsed / TOTAL_DURATION_MS) * 100);

  return (
    <div className={`breathe-overlay weather-${weatherMood}`}>
      <button
        type="button"
        className="breathe-close"
        aria-label="Close breathing session"
        onClick={onClose}
      >
        ×
      </button>

      <div
        className={`breathe-scene phase-${breathMoment.phase}`}
        style={{ "--breathe-brightness": brightness }}
      >
        <div className="breathe-tree-shell">
          <MainTree
            scores={latestEntry?.treeScores ?? {}}
            breatheMode
            className="breathe-tree"
          />
        </div>

        <div className="breathe-counter" aria-hidden="true">
          <span>{breathMoment.counter}</span>
        </div>

        <div className="breathe-progress" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>

        <div className="breathe-drifters" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className="breathe-drifter"
              style={{
                "--delay": `${index * 1.2}s`,
                "--x": `${(index % 6) * 16 + 8}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default BreatheOverlay;
