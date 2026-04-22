import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS } from "../data/questions";
import {
  calculateBurnoutResult,
  getBurnoutLevel,
} from "../data/scoring";
import { getLastSevenDays } from "../utils/localStorage";
import {
  buildBurnoutPayload,
  FALLBACK_RECOMMENDATIONS,
} from "../utils/recommendations";

const CAT_CHART_COLORS = {
  emotionallyDrained: "#c0392b",
  physicallyExhausted: "#d35400",
  wakeUpTired: "#d68910",
  overwhelmed: "#e67e22",
  cantKeepUp: "#af601a",
  lowMotivation: "#7d6608",
  disconnected: "#7b7d7d",
  frustrated: "#a93226",
  meaningless: "#884ea0",
  lessEffective: "#566573",
  runDown: "#cb4335",
  noEnergyForSelf: "#922b21",
};

function WeeklySummary() {
  const entries = getLastSevenDays();
  const lineRef = useRef(null);
  const barRef = useRef(null);
  const radarRef = useRef(null);
  const charts = useRef([]);
  const [gptRecommendations, setGptRecommendations] = useState(FALLBACK_RECOMMENDATIONS);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");

  const { avgScores, avgAnswers, avgOverall } = useMemo(() => {
    if (!entries.length) {
      return {
        avgScores: {},
        avgAnswers: {},
        avgOverall: 0,
      };
    }

    const nextAvgScores = {};
    const nextAvgAnswers = {};

    QUESTIONS.forEach((question) => {
      nextAvgScores[question.id] = Math.round(
        entries.reduce((sum, entry) => sum + (entry.scores[question.id] ?? 0), 0) /
          entries.length
      );

      nextAvgAnswers[question.id] =
        entries.reduce((sum, entry) => sum + Number(entry.answers[question.id] ?? 0), 0) /
        entries.length;
    });

    return {
      avgScores: nextAvgScores,
      avgAnswers: nextAvgAnswers,
      avgOverall: Math.round(
        entries.reduce((sum, entry) => sum + entry.overall, 0) / entries.length
      ),
    };
  }, [entries]);

  const burnoutPayload = useMemo(() => buildBurnoutPayload(avgScores), [avgScores]);
  const payloadKey = useMemo(() => burnoutPayload.join("|"), [burnoutPayload]);

  useEffect(() => {
    if (!entries.length || !window.Chart) return;

    charts.current.forEach((chart) => {
      try {
        chart.destroy();
      } catch {}
    });
    charts.current = [];

    const labels = entries.map((entry) =>
      new Date(entry.date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
      })
    );

    function addChart(ref, config) {
      if (!ref.current) return;
      charts.current.push(new window.Chart(ref.current, config));
    }

    addChart(lineRef, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Burnout Rate",
            data: entries.map((entry) => entry.overall),
            borderColor: "#c0392b",
            backgroundColor: "rgba(192,57,43,.08)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.45,
            pointBackgroundColor: "#c0392b",
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, grid: { color: "rgba(0,0,0,.04)" } },
          x: { grid: { display: false } },
        },
      },
    });

    addChart(barRef, {
      type: "bar",
      data: {
        labels: QUESTIONS.map((question) => question.name),
        datasets: [
          {
            data: QUESTIONS.map((question) => avgScores[question.id]),
            backgroundColor: QUESTIONS.map(
              (question) => `${CAT_CHART_COLORS[question.id]}cc`
            ),
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { min: 0, max: 100, grid: { color: "rgba(0,0,0,.04)" } },
          y: { grid: { display: false }, ticks: { font: { size: 12 } } },
        },
      },
    });

    addChart(radarRef, {
      type: "radar",
      data: {
        labels: QUESTIONS.map((question) => question.name),
        datasets: [
          {
            data: QUESTIONS.map((question) => avgScores[question.id]),
            borderColor: "#c0392b",
            backgroundColor: "rgba(192,57,43,.12)",
            borderWidth: 2,
            pointBackgroundColor: "#c0392b",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: "rgba(0,0,0,.08)" },
            pointLabels: { font: { size: 10 } },
          },
        },
      },
    });

    return () => {
      charts.current.forEach((chart) => {
        try {
          chart.destroy();
        } catch {}
      });
    };
  }, [entries, avgScores]);

  useEffect(() => {
    if (!entries.length) {
      setGptRecommendations(FALLBACK_RECOMMENDATIONS);
      setRecommendationsLoading(false);
      setRecommendationsError("");
      return;
    }

    let cancelled = false;

    async function fetchRecommendations() {
      setRecommendationsLoading(true);
      setRecommendationsError("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: burnoutPayload }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.error || "Could not load recommendations.");
        }

        const nextRecommendations = Array.isArray(result?.recommendations)
          ? result.recommendations
              .filter((item) => typeof item === "string" && item.trim())
              .slice(0, 3)
          : [];

        if (!cancelled) {
          setGptRecommendations(
            nextRecommendations.length === 3
              ? nextRecommendations
              : FALLBACK_RECOMMENDATIONS
          );
        }
      } catch (error) {
        if (!cancelled) {
          setRecommendationsError(
            error instanceof Error
              ? error.message
              : "Could not load recommendations."
          );
          setGptRecommendations(FALLBACK_RECOMMENDATIONS);
        }
      } finally {
        if (!cancelled) {
          setRecommendationsLoading(false);
        }
      }
    }

    fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [entries.length, payloadKey]);

  if (!entries.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 text-5xl">🌱</div>
        <h3 className="mb-2 text-xl font-semibold text-green-900">
          Not enough data yet
        </h3>
        <p className="text-sm text-gray-500">
          Complete at least one check-in to see your weekly summary.
        </p>
      </div>
    );
  }

  const burnoutLevel = getBurnoutLevel(avgOverall);
  const burnoutResult = calculateBurnoutResult(avgAnswers);

  const strongest = QUESTIONS.reduce((lowest, question) => {
    if (!lowest) return question;
    return avgScores[question.id] < avgScores[lowest.id] ? question : lowest;
  }, null);

  const weakest = QUESTIONS.reduce((highest, question) => {
    if (!highest) return question;
    return avgScores[question.id] > avgScores[highest.id] ? question : highest;
  }, null);

  const statCards = [
    {
      label: "7-Day Avg Burnout",
      value: `${avgOverall}%`,
      sub: burnoutLevel.text,
      color: burnoutLevel.color,
      large: true,
    },
    {
      label: "Weakest Category",
      value: `${burnoutResult.weakestCategory.percentage}%`,
      sub: burnoutResult.weakestCategory.label,
      color: "#c0392b",
    },
    {
      label: "Highest Sign",
      value: weakest.icon,
      sub: `${weakest.name} · ${avgScores[weakest.id]}%`,
    },
    {
      label: "Lowest Sign",
      value: strongest.icon,
      sub: `${strongest.name} · ${avgScores[strongest.id]}%`,
    },
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-green-100 bg-white p-4 text-center"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              {card.label}
            </p>
            <p
              className={`mb-1 font-extrabold leading-none ${
                card.large ? "text-3xl" : "text-xl"
              }`}
              style={{ color: card.color || "#1a2e1f" }}
            >
              {card.value}
            </p>
            <p className="text-xs text-gray-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          Burnout trend over the last {entries.length} days
        </h3>
        <div style={{ position: "relative", height: 190 }}>
          <canvas ref={lineRef} role="img" aria-label="Burnout trend" />
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          Weekly average for each burnout sign
        </h3>
        <div style={{ position: "relative", height: QUESTIONS.length * 34 + 60 }}>
          <canvas ref={barRef} role="img" aria-label="Average burnout signs" />
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          Category breakdown
        </h3>
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {Object.values(burnoutResult.categories).map((category) => (
            <div
              key={category.label}
              className="rounded-2xl border border-green-100 bg-green-50/40 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700/70">
                {category.label}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-green-950">
                {category.percentage}%
              </p>
            </div>
          ))}
        </div>
        <div style={{ position: "relative", height: 250 }}>
          <canvas ref={radarRef} role="img" aria-label="Burnout radar chart" />
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          Gentle recommendations
        </h3>

        {recommendationsLoading ? (
          <p className="text-sm text-green-700">Loading recommendations...</p>
        ) : null}

        {recommendationsError ? (
          <p className="mb-3 text-sm text-amber-700">
            {recommendationsError}
          </p>
        ) : null}

        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-green-950">
          {gptRecommendations.map((recommendation, index) => (
            <li key={`${recommendation}-${index}`}>{recommendation}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default WeeklySummary;
