import { QUESTIONS } from "./questions";

const MAX_ANSWER_SCORE = 5;
const MAX_TOTAL_SCORE = QUESTIONS.length * MAX_ANSWER_SCORE;

const CATEGORY_GROUPS = {
  exhaustion: {
    label: "Exhaustion",
    questionIds: [
      "emotionallyDrained",
      "physicallyExhausted",
      "wakeUpTired",
      "overwhelmed",
      "runDown",
      "noEnergyForSelf",
    ],
    maxScore: 30,
  },
  detachment: {
    label: "Detachment",
    questionIds: [
      "cantKeepUp",
      "disconnected",
      "frustrated",
      "meaningless",
    ],
    maxScore: 20,
  },
  reducedEffectiveness: {
    label: "Reduced Effectiveness",
    questionIds: [
      "lowMotivation",
      "lessEffective",
    ],
    maxScore: 10,
  },
};

function getQuestionBurnoutScore(answerValue) {
  const raw = Number(answerValue ?? 0);
  return Math.round((raw / MAX_ANSWER_SCORE) * 100);
}

function computeScores(answers) {
  const scores = {};

  QUESTIONS.forEach((question) => {
    scores[question.id] = getQuestionBurnoutScore(answers[question.id]);
  });

  return scores;
}

function computeTreeScores(scores) {
  const treeScores = {};

  Object.entries(scores).forEach(([key, value]) => {
    treeScores[key] = 100 - value;
  });

  return treeScores;
}

function calculateCategoryPercentage(answers, group) {
  const categoryScore = group.questionIds.reduce(
    (sum, id) => sum + Number(answers[id] ?? 0),
    0
  );

  return {
    score: categoryScore,
    percentage: Math.round((categoryScore / group.maxScore) * 100),
  };
}

function calculateBurnoutResult(answers) {
  const totalScore = QUESTIONS.reduce(
    (sum, question) => sum + Number(answers[question.id] ?? 0),
    0
  );

  const burnoutRate = Math.round((totalScore / MAX_TOTAL_SCORE) * 100);

  const exhaustion = calculateCategoryPercentage(
    answers,
    CATEGORY_GROUPS.exhaustion
  );
  const detachment = calculateCategoryPercentage(
    answers,
    CATEGORY_GROUPS.detachment
  );
  const reducedEffectiveness = calculateCategoryPercentage(
    answers,
    CATEGORY_GROUPS.reducedEffectiveness
  );

  const categories = {
    exhaustion: {
      label: CATEGORY_GROUPS.exhaustion.label,
      score: exhaustion.score,
      percentage: exhaustion.percentage,
    },
    detachment: {
      label: CATEGORY_GROUPS.detachment.label,
      score: detachment.score,
      percentage: detachment.percentage,
    },
    reducedEffectiveness: {
      label: CATEGORY_GROUPS.reducedEffectiveness.label,
      score: reducedEffectiveness.score,
      percentage: reducedEffectiveness.percentage,
    },
  };

  const weakestCategoryKey = Object.keys(categories).reduce((highest, key) => {
    if (!highest) return key;
    return categories[key].percentage > categories[highest].percentage
      ? key
      : highest;
  }, null);

  return {
    totalScore,
    maxTotalScore: MAX_TOTAL_SCORE,
    burnoutRate,
    burnoutLevel: getBurnoutLevel(burnoutRate),
    categories,
    weakestCategory: {
      key: weakestCategoryKey,
      label: categories[weakestCategoryKey].label,
      percentage: categories[weakestCategoryKey].percentage,
    },
  };
}

function getOverallScore(scores) {
  const values = Object.values(scores);
  if (!values.length) return 0;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function getBurnoutLevel(score) {
  if (score <= 20) return { text: "Very Low", color: "#2f8f56" };
  if (score <= 40) return { text: "Mild", color: "#6aa84f" };
  if (score <= 60) return { text: "Moderate", color: "#d48a10" };
  if (score <= 80) return { text: "High", color: "#d35400" };
  return { text: "Severe", color: "#c0392b" };
}

function getHealthLabel(score) {
  return getBurnoutLevel(score);
}

function getBarColor(score) {
  if (score <= 20) return "#2f8f56";
  if (score <= 40) return "#7ab840";
  if (score <= 60) return "#d48a10";
  if (score <= 80) return "#d35400";
  return "#c0392b";
}

function getLeafColor(score) {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = 120 - clamped * 1.2;
  return `hsl(${hue}, 55%, 38%)`;
}

function scoresToArray(scores) {
  return QUESTIONS.map((question) => scores[question.id] ?? 0);
}

export {
  CATEGORY_GROUPS,
  calculateBurnoutResult,
  computeScores,
  computeTreeScores,
  getOverallScore,
  getBurnoutLevel,
  getHealthLabel,
  getBarColor,
  getLeafColor,
  scoresToArray,
};
