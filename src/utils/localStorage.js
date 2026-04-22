import { computeTreeScores, getOverallScore } from "../data/scoring";
import { getGardenTier } from "../data/gardenTiers";

const STORAGE_KEY = "burnout_garden_storage_v2";
const LEGACY_KEY = "burnout_garden_entries";

const DEFAULT_GARDEN_SETTINGS = {
  environmentVariant: "meadow",
  showSun: true,
  showClouds: true,
};

function createEmptyStore() {
  return {
    entries: [],
    commitments: [],
    wordle: {
      totalPoints: 0,
      currentGame: null,
      history: [],
      settings: { ...DEFAULT_GARDEN_SETTINGS },
    },
  };
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getToday() {
  return getLocalDateKey();
}

function getDateOffsetKey(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return getLocalDateKey(date);
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const scores = entry.scores ?? {};
  const treeScores = entry.treeScores ?? computeTreeScores(scores);

  return {
    ...entry,
    scores,
    treeScores,
    overall:
      typeof entry.overall === "number" ? entry.overall : getOverallScore(scores),
  };
}

function normalizeStore(raw) {
  if (!raw || typeof raw !== "object") return createEmptyStore();

  if (Array.isArray(raw)) {
    return {
      entries: raw.map(normalizeEntry).filter(Boolean),
      commitments: [],
      wordle: {
        totalPoints: 0,
        currentGame: null,
        history: [],
        settings: { ...DEFAULT_GARDEN_SETTINGS },
      },
    };
  }

  return {
    entries: (Array.isArray(raw.entries) ? raw.entries : [])
      .map(normalizeEntry)
      .filter(Boolean),
    commitments: Array.isArray(raw.commitments) ? raw.commitments : [],
    wordle: {
      totalPoints: Math.max(0, Number(raw.wordle?.totalPoints ?? 0) || 0),
      currentGame: raw.wordle?.currentGame ?? null,
      history: Array.isArray(raw.wordle?.history) ? raw.wordle.history : [],
      settings: {
        ...DEFAULT_GARDEN_SETTINGS,
        ...(raw.wordle?.settings ?? {}),
      },
    },
  };
}

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (parsed) return normalizeStore(parsed);

    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
    const migrated = normalizeStore(legacy);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return createEmptyStore();
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function sortByDate(items) {
  return [...items].sort((a, b) => a.date.localeCompare(b.date));
}

function getAllEntries() {
  return sortByDate(readStore().entries);
}

function saveEntry(answers, scores, treeScores) {
  const store = readStore();
  const today = getToday();

  const nextEntry = {
    date: today,
    answers,
    scores,
    treeScores,
    overall: getOverallScore(scores),
  };

  const entries = sortByDate([
    ...store.entries.filter((entry) => entry.date !== today),
    nextEntry,
  ]).slice(-30);

  writeStore({
    ...store,
    entries,
  });

  return nextEntry;
}

function getTodayEntry() {
  return getAllEntries().find((entry) => entry.date === getToday()) || null;
}

function getLatestEntry() {
  const entries = getAllEntries();
  return entries.length ? entries[entries.length - 1] : null;
}

function getLastSevenDays() {
  return getAllEntries().slice(-7);
}

function saveCommitment({ branchId, action, status = "committed" }) {
  const store = readStore();
  const today = getToday();

  const nextCommitment = {
    date: today,
    branchId,
    action,
    status,
    outcome: null,
    outcomeLabel: null,
    reflectionDate: null,
  };

  const commitments = sortByDate([
    ...store.commitments.filter((item) => item.date !== today),
    nextCommitment,
  ]).slice(-30);

  writeStore({
    ...store,
    commitments,
  });

  return nextCommitment;
}

function getCommitmentByDate(date) {
  return readStore().commitments.find((item) => item.date === date) || null;
}

function getTodayCommitment() {
  return getCommitmentByDate(getToday());
}

function getYesterdayCommitment() {
  return getCommitmentByDate(getDateOffsetKey(-1));
}

function getLatestCommitment() {
  const commitments = sortByDate(readStore().commitments);
  return commitments.length ? commitments[commitments.length - 1] : null;
}

function updateCommitmentOutcome(commitmentDate, outcome, outcomeLabel) {
  const store = readStore();

  const commitments = store.commitments.map((item) =>
    item.date === commitmentDate
      ? {
          ...item,
          outcome,
          outcomeLabel,
          reflectionDate: getToday(),
        }
      : item
  );

  writeStore({
    ...store,
    commitments,
  });
}

function getWordleData() {
  return readStore().wordle;
}

function getCurrentWordleGame() {
  const wordle = getWordleData();
  const currentGame = wordle.currentGame;

  if (!currentGame || currentGame.date !== getToday()) return null;

  return currentGame;
}

function getTodayWordleHistory() {
  const wordle = getWordleData();
  return wordle.history.find((entry) => entry.date === getToday()) || null;
}

function startWordleGame(game) {
  const store = readStore();

  writeStore({
    ...store,
    wordle: {
      ...store.wordle,
      currentGame: game,
    },
  });

  return game;
}

function updateWordleGame(game) {
  const store = readStore();

  writeStore({
    ...store,
    wordle: {
      ...store.wordle,
      currentGame: game,
    },
  });

  return game;
}

function finishWordleGame(result) {
  const store = readStore();
  const existingResult = store.wordle.history.find((entry) => entry.date === result.date);

  if (existingResult) {
    writeStore({
      ...store,
      wordle: {
        ...store.wordle,
        currentGame: null,
      },
    });

    return existingResult;
  }

  const nextHistory = [
    ...store.wordle.history.filter((entry) => entry.date !== result.date),
    result,
  ].sort((a, b) => a.date.localeCompare(b.date));

  writeStore({
    ...store,
    wordle: {
      ...store.wordle,
      totalPoints: store.wordle.totalPoints + (result.pointsEarned ?? 0),
      currentGame: null,
      history: nextHistory,
    },
  });

  return result;
}

function updateGardenSettings(patch) {
  const store = readStore();

  const nextSettings = {
    ...DEFAULT_GARDEN_SETTINGS,
    ...store.wordle.settings,
    ...patch,
  };

  writeStore({
    ...store,
    wordle: {
      ...store.wordle,
      settings: nextSettings,
    },
  });

  return nextSettings;
}

function getGardenProgress() {
  const wordle = getWordleData();
  const todayResult = getTodayWordleHistory();
  const currentGame = getCurrentWordleGame();
  const totalPoints = wordle.totalPoints;

  return {
    totalPoints,
    tier: getGardenTier(totalPoints),
    currentGame,
    playedToday: !!todayResult,
    todayResult,
    settings: {
      ...DEFAULT_GARDEN_SETTINGS,
      ...wordle.settings,
    },
  };
}

export {
  getGardenProgress,
  getCurrentWordleGame,
  getTodayWordleHistory,
  getToday,
  getLocalDateKey,
  getAllEntries,
  getTodayEntry,
  getLatestEntry,
  getLastSevenDays,
  saveEntry,
  saveCommitment,
  getCommitmentByDate,
  getTodayCommitment,
  getYesterdayCommitment,
  getLatestCommitment,
  updateCommitmentOutcome,
  startWordleGame,
  updateWordleGame,
  finishWordleGame,
  updateGardenSettings,
};
