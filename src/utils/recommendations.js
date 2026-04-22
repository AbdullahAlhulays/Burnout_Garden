import { QUESTIONS } from "../data/questions";

export const FALLBACK_RECOMMENDATIONS = [
  "Keep your routine balanced",
  "Maintain healthy habits",
  "Stay consistent daily",
];

export function buildBurnoutPayload(avgScores = {}) {
  return QUESTIONS.map((question) => `${question.name}: ${avgScores[question.id] ?? 0}%`);
}

