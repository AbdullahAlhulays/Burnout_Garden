import { useEffect, useRef } from "react";
import { QUESTIONS } from "../data/questions";
import { getHealthLabel } from "../data/scoring";
import { getLastSevenDays } from "../utils/localStorage";
import RecommendationCard from "./RecommendationCard";

//
// Charts + recommendations for the last 7 days.
// Chart.js is used for the three charts.

function buildRecommendations(avg) {
  const recs = [];
  if (avg.sleep    < 60) recs.push({ level: "danger", text: "Sleep earlier and aim for 7–9 hours. Consistent sleep is the most impactful thing you can do for yourself." });
  if (avg.work     < 50) recs.push({ level: "danger", text: "Your work or study hours are high. Protect your evenings and take real breaks during the day." });
  if (avg.stress   < 50) recs.push({ level: "danger", text: "Stress levels have been elevated. Short breathing pauses or walks can make a real difference." });
  if (avg.exercise < 50) recs.push({ level: "warn",   text: "Try to move for at least 30 minutes most days. Even a gentle walk improves your mood and energy." });
  if (avg.friends  < 50) recs.push({ level: "warn",   text: "Spend more time with people you care about. Social connection is a strong protector against burnout." });
  if (avg.water    < 60) recs.push({ level: "warn",   text: "Drink more water throughout the day — 2–3 litres helps with focus, energy, and how you feel." });
  if (avg.screen   < 50) recs.push({ level: "warn",   text: "Reducing recreational screen time, especially in the evening, can meaningfully improve your sleep." });
  if (avg.hobbies  < 50) recs.push({ level: "warn",   text: "Make room for things you genuinely enjoy. Hobbies are how you recover and restore yourself." });
  if (avg.food     < 50) recs.push({ level: "warn",   text: "Small diet improvements can have a noticeable effect on your energy and emotional steadiness." });
  if (recs.length  === 0) recs.push({ level: "",       text: "You are doing well across all areas. Stay consistent and attentive to any area that starts to slip." });
  return recs;
}

const CAT_CHART_COLORS = {
  sleep: "#5b9bd5", work: "#ed7d31", family: "#82c45e", friends: "#ffc000",
  exercise: "#4caf50", hobbies: "#9c27b0", islamic: "#00bcd4",
  water: "#2196f3", food: "#ff5722", screen: "#607d8b", stress: "#e53935",
};

function WeeklySummary() {
  const entries = getLastSevenDays();
  const lineRef  = useRef(null);
  const barRef   = useRef(null);
  const radarRef = useRef(null);
  const charts   = useRef([]);

  useEffect(() => {
    if (!entries.length || !window.Chart) return;

    charts.current.forEach(c => { try { c.destroy(); } catch {} });
    charts.current = [];

    const labels  = entries.map(e => new Date(e.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }));
    const avg     = {};
    QUESTIONS.forEach(q => {
      avg[q.id] = Math.round(entries.reduce((sum, e) => sum + (e.scores[q.id] ?? 0), 0) / entries.length);
    });

    function addChart(ref, config) {
      if (!ref.current) return;
      charts.current.push(new window.Chart(ref.current, config));
    }

    // Overall health trend line
    addChart(lineRef, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Health",
          data: entries.map(e => e.overall),
          borderColor: "#2d8a4e",
          backgroundColor: "rgba(45,138,78,.08)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.45,
          pointBackgroundColor: "#2d8a4e",
          pointRadius: 5,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, grid: { color: "rgba(0,0,0,.04)" } },
          x: { grid: { display: false } },
        },
      },
    });

    // Category averages horizontal bar
    addChart(barRef, {
      type: "bar",
      data: {
        labels: QUESTIONS.map(q => q.name),
        datasets: [{
          data: QUESTIONS.map(q => avg[q.id]),
          backgroundColor: QUESTIONS.map(q => CAT_CHART_COLORS[q.id] + "cc"),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { min: 0, max: 100, grid: { color: "rgba(0,0,0,.04)" } },
          y: { grid: { display: false }, ticks: { font: { size: 12 } } },
        },
      },
    });

    // Balance radar
    addChart(radarRef, {
      type: "radar",
      data: {
        labels: QUESTIONS.map(q => q.name),
        datasets: [{
          data: QUESTIONS.map(q => avg[q.id]),
          borderColor: "#2d8a4e",
          backgroundColor: "rgba(45,138,78,.12)",
          borderWidth: 2,
          pointBackgroundColor: "#2d8a4e",
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: { min: 0, max: 100, ticks: { display: false }, grid: { color: "rgba(0,0,0,.08)" }, pointLabels: { font: { size: 10 } } },
        },
      },
    });

    return () => charts.current.forEach(c => { try { c.destroy(); } catch {} });
  }, [entries.length]);

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-5xl mb-4">🌱</div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">Not enough data yet</h3>
        <p className="text-sm text-gray-500">Complete at least one check-in to see your weekly summary.</p>
      </div>
    );
  }

  const avg        = {};
  QUESTIONS.forEach(q => {
    avg[q.id] = Math.round(entries.reduce((sum, e) => sum + (e.scores[q.id] ?? 0), 0) / entries.length);
  });
  const avgOverall  = Math.round(entries.reduce((sum, e) => sum + e.overall, 0) / entries.length);
  const healthLabel = getHealthLabel(avgOverall);
  const strongest   = QUESTIONS.reduce((a, b) => avg[b.id] > avg[a.id] ? b : a);
  const weakest     = QUESTIONS.reduce((a, b) => avg[b.id] < avg[a.id] ? b : a);
  const riskText    = avgOverall < 40 ? "High" : avgOverall < 60 ? "Moderate" : avgOverall < 75 ? "Low" : "Minimal";
  const riskColor   = avgOverall < 40 ? "#c0392b" : avgOverall < 60 ? "#d48a10" : avgOverall < 75 ? "#7ab840" : "#2a8048";
  const recs        = buildRecommendations(avg);

  const statCards = [
    { label: "7-Day Avg",       value: avgOverall,       sub: healthLabel.text,                  color: healthLabel.color, large: true },
    { label: "Burnout Risk",    value: riskText,          sub: "based on avg score",              color: riskColor,         small: true },
    { label: "Strongest Area",  value: strongest.icon,   sub: `${strongest.name} · ${avg[strongest.id]}` },
    { label: "Needs Most Care", value: weakest.icon,     sub: `${weakest.name} · ${avg[weakest.id]}` },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-white border border-green-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">{card.label}</p>
            <p
              className={`font-extrabold leading-none mb-1 ${card.large ? "text-3xl" : "text-xl"}`}
              style={{ color: card.color || "#1a2e1f" }}
            >
              {card.value}
            </p>
            <p className="text-xs text-gray-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white border border-green-100 rounded-2xl p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Overall health — last {entries.length} days</h3>
        <div style={{ position: "relative", height: 190 }}>
          <canvas ref={lineRef} role="img" aria-label="Overall health trend" />
        </div>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Category averages this week</h3>
        <div style={{ position: "relative", height: QUESTIONS.length * 34 + 60 }}>
          <canvas ref={barRef} role="img" aria-label="Category averages" />
        </div>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Balance overview</h3>
        <div style={{ position: "relative", height: 250 }}>
          <canvas ref={radarRef} role="img" aria-label="Radar balance chart" />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-green-100 rounded-2xl p-5 mb-8 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Gentle recommendations</h3>
        {recs.map((rec, i) => (
          <RecommendationCard key={i} text={rec.text} level={rec.level} />
        ))}
      </div>
    </div>
  );
}

export default WeeklySummary;
