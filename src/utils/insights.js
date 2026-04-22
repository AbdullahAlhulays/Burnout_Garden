import { MICRO_CHALLENGES, QUESTIONS, QUESTION_LABELS } from "../data/questions";

const CHALLENGE_TRIGGER_SCORE = 40;

function getWeakestBranch(scores = {}) {
  return QUESTIONS.reduce((highest, question) => {
    if (!highest) return question;

    const currentScore = scores[question.id] ?? 0;
    const highestScore = scores[highest.id] ?? 0;

    return currentScore > highestScore ? question : highest;
  }, null);
}

function needsChallengeForScores(scores = {}) {
  const weakest = getWeakestBranch(scores);
  if (!weakest) return false;

  const highestScore = scores[weakest.id] ?? 0;
  return highestScore >= CHALLENGE_TRIGGER_SCORE;
}

function getChallengeForScores(scores = {}) {
  const weakest = getWeakestBranch(scores);

  if (!weakest) return null;

  const highestScore = scores[weakest.id] ?? 0;
  if (highestScore < CHALLENGE_TRIGGER_SCORE) return null;

  return {
    branchId: weakest.id,
    branchLabel: QUESTION_LABELS[weakest.id] ?? weakest.label,
    action:
      MICRO_CHALLENGES[weakest.id] ||
      "Take one gentle step to care for this part of your life today.",
    score: highestScore,
  };
}

function getWeatherMood(overallScore = 35) {
  if (overallScore <= 20) return "thriving";
  if (overallScore <= 60) return "struggling";
  return "burnout";
}

export {
  getWeakestBranch,
  getChallengeForScores,
  needsChallengeForScores,
  getWeatherMood,
};
