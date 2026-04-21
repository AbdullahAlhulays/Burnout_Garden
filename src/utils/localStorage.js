import { getOverallScore } from "../data/scoring";

//
// All localStorage reads and writes go through these helpers.
// The rest of the app never touches localStorage directly.

const STORAGE_KEY = "burnout_garden_entries";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getAllEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveEntry(answers, scores) {
  // Remove any existing entry for today, then add the new one
  const existing = getAllEntries().filter(e => e.date !== getToday());
  const newEntry = {
    date: getToday(),
    answers,
    scores,
    overall: getOverallScore(scores),
  };
  const updated = [...existing, newEntry];
  // Keep only the last 30 days
  if (updated.length > 30) updated.splice(0, updated.length - 30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function getTodayEntry() {
  return getAllEntries().find(e => e.date === getToday()) || null;
}

function getLatestEntry() {
  const entries = getAllEntries();
  return entries.length ? entries[entries.length - 1] : null;
}

function getLastSevenDays() {
  return getAllEntries().slice(-7);
}

export { getToday, getAllEntries, saveEntry, getTodayEntry, getLatestEntry, getLastSevenDays };
