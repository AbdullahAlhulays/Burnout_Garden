import { WORDLE_WORDS } from "../data/wordleWords";

export const WORDLE_MAX_ATTEMPTS = 6;

function hashString(value) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

export function getWordPool(length) {
  const pool = WORDLE_WORDS[length];
  if (!pool) return { answers: [], valid: [] };
  return pool;
}

export function getDailyWordAnswer(dateKey, length) {
  const pool = getWordPool(length).answers;
  if (!pool.length) return "";

  const index = hashString(`${dateKey}-${length}`) % pool.length;
  return pool[index].toLowerCase();
}

export function isValidWordGuess(value, length) {
  const normalized = normalizeWordGuess(value);
  if (normalized.length !== length) return false;

  const pool = getWordPool(length);
  const validSet = new Set(
    [...pool.answers, ...pool.valid].map((word) => word.toLowerCase())
  );

  return validSet.has(normalized);
}

export function normalizeWordGuess(value = "") {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export function evaluateWordGuess(guess, answer) {
  const result = Array.from({ length: guess.length }, () => "miss");
  const answerLetters = answer.split("");
  const guessLetters = guess.split("");

  guessLetters.forEach((letter, index) => {
    if (answerLetters[index] === letter) {
      result[index] = "hit";
      answerLetters[index] = null;
      guessLetters[index] = null;
    }
  });

  guessLetters.forEach((letter, index) => {
    if (!letter) return;

    const wrongSpotIndex = answerLetters.indexOf(letter);
    if (wrongSpotIndex >= 0) {
      result[index] = "near";
      answerLetters[wrongSpotIndex] = null;
    }
  });

  return result;
}

export function calculateWordlePoints({ solved, mode, attemptsUsed }) {
  if (!solved) return 0;

  let points = mode === 5 ? 2 : 1;

  if (attemptsUsed < 4) {
    points += 1;
  }

  return points;
}

export function getNextWordleAvailableLabel() {
  const next = new Date();
  next.setHours(24, 0, 0, 0);

  return next.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
