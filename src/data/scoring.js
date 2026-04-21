import { QUESTIONS } from "./questions";

//
// Converts raw slider values into 0–100 health scores.
// Each function reflects real wellness logic.

const scoringRules = {
  sleep:    v => v >= 7 && v <= 9 ? 100 : v >= 6 ? 80 : v >= 5 ? 52 : Math.max(0, v * 12),
  work:     v => v <= 6 ? 100 : v <= 8 ? 85 : v <= 10 ? 62 : v <= 12 ? 38 : Math.max(0, 100 - v * 6),
  family:   v => Math.min(100, v * 42),
  friends:  v => Math.min(100, v * 46),
  exercise: v => v >= 60 ? 100 : v >= 30 ? 85 : v >= 15 ? 62 : Math.min(55, v * 2),
  hobbies:  v => Math.min(100, v * 32),
  islamic:  v => Math.min(100, 20 + v * 42),
  water:    v => v >= 2 && v <= 3 ? 100 : v >= 1.5 ? 82 : v >= 1 ? 60 : Math.min(48, v * 36),
  food:     v => Math.round((v / 10) * 100),
  screen:   v => v <= 2 ? 100 : v <= 4 ? 75 : v <= 6 ? 48 : Math.max(0, 100 - v * 7),
  stress:   v => Math.round(((10 - v) / 9) * 100),
};

function computeScores(answers) {
  const scores = {};
  QUESTIONS.forEach(q => {
    const raw = answers[q.id] ?? q.min;
    scores[q.id] = Math.round(scoringRules[q.id](raw));
  });
  return scores;
}

function getOverallScore(scores) {
  const values = Object.values(scores);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function getHealthLabel(score) {
  if (score >= 80) return { text: "Blooming 🌸", color: "#2a8048" };
  if (score >= 60) return { text: "Growing 🌿",  color: "#4a9e38" };
  if (score >= 40) return { text: "Fading 🍂",   color: "#c8810a" };
  return               { text: "Burnout Risk 🥀", color: "#c0392b" };
}

function getBarColor(score) {
  if (score >= 70) return "#2d8a4e";
  if (score >= 50) return "#7ab840";
  if (score >= 35) return "#d48a10";
  return "#c0392b";
}

function getLeafColor(score) {
  const s = score / 100;
  if (s >= 0.75) return `hsl(${116 + s * 14}, ${50 + s * 30}%, ${26 + s * 20}%)`;
  if (s >= 0.50) return `hsl(${88  + s * 32}, ${40 + s * 22}%, ${30 + s * 16}%)`;
  if (s >= 0.30) return `hsl(${44  + s * 44}, ${42 + s * 14}%, ${33 + s * 12}%)`;
  return               `hsl(${18  + s * 28}, ${36 + s * 14}%, ${30 + s * 10}%)`;
}

// Converts a scores object { id: score } to a plain array
// in the same order as QUESTIONS — needed by the canvas tree.
function scoresToArray(scores) {
  return QUESTIONS.map(q => scores[q.id] ?? 0);
}

export { computeScores, getOverallScore, getHealthLabel, getBarColor, getLeafColor, scoresToArray };
