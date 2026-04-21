//
// All 11 daily check-in questions live here.
// Easy to add, remove, or edit questions in one place.

const QUESTIONS = [
  {
    id: "sleep",
    name: "Sleep",
    icon: "😴",
    unit: "hrs",
    min: 0, max: 12, step: 0.5,
    question: "How many hours did you sleep last night?",
    hint: "7–9 hours is the sweet spot",
  },
  {
    id: "work",
    name: "Work / Study",
    icon: "💼",
    unit: "hrs",
    min: 0, max: 16, step: 0.5,
    question: "How many hours did you work or study today?",
    hint: "Over 10 hours regularly raises burnout risk",
  },
  {
    id: "family",
    name: "Family Time",
    icon: "🏡",
    unit: "hrs",
    min: 0, max: 8, step: 0.5,
    question: "How much time did you spend with family today?",
    hint: "Even 30 quiet minutes counts",
  },
  {
    id: "friends",
    name: "Friends",
    icon: "👫",
    unit: "hrs",
    min: 0, max: 8, step: 0.5,
    question: "How much time did you spend with friends today?",
    hint: "Social connection buffers against burnout",
  },
  {
    id: "exercise",
    name: "Exercise",
    icon: "🏃",
    unit: "min",
    min: 0, max: 120, step: 5,
    question: "How many minutes did you exercise today?",
    hint: "30+ minutes most days is a healthy target",
  },
  {
    id: "hobbies",
    name: "Hobbies",
    icon: "🎨",
    unit: "hrs",
    min: 0, max: 6, step: 0.5,
    question: "How much time did you spend on hobbies today?",
    hint: "Joy and creativity restore your energy",
  },
  {
    id: "islamic",
    name: "Islamic Time",
    icon: "🕌",
    unit: "hrs",
    min: 0, max: 4, step: 0.25,
    question: "How much time did you spend on Islamic activities today?",
    hint: "Prayer, Quran, dhikr, Islamic learning — all count",
  },
  {
    id: "water",
    name: "Water Intake",
    icon: "💧",
    unit: "L",
    min: 0, max: 4, step: 0.25,
    question: "How many litres of water did you drink today?",
    hint: "2–3 litres is recommended",
  },
  {
    id: "food",
    name: "Healthy Food",
    icon: "🥗",
    unit: "/10",
    min: 1, max: 10, step: 1,
    question: "How well did you eat today?",
    hint: "10 = very healthy, 1 = very poor",
  },
  {
    id: "screen",
    name: "Screen Time",
    icon: "📱",
    unit: "hrs",
    min: 0, max: 16, step: 0.5,
    question: "How many hours did you spend on screens for fun today?",
    hint: "2 hours or less is ideal",
  },
  {
    id: "stress",
    name: "Stress Level",
    icon: "😤",
    unit: "/10",
    min: 1, max: 10, step: 1,
    question: "How stressed did you feel today?",
    hint: "10 = very stressed, 1 = calm and settled",
  },
];

// Which branch on the tree each category belongs to.
// 8 branches cover all 11 categories (some branches share 2).
const BRANCH_MAP = [
  { id: 0, angle: -75, len: 0.82, categoryIndexes: [0] },       // Sleep
  { id: 1, angle: -52, len: 0.90, categoryIndexes: [1] },       // Work
  { id: 2, angle: -30, len: 0.88, categoryIndexes: [2, 3] },    // Family + Friends
  { id: 3, angle: -10, len: 0.78, categoryIndexes: [4] },       // Exercise
  { id: 4, angle:  10, len: 0.78, categoryIndexes: [5] },       // Hobbies
  { id: 5, angle:  30, len: 0.88, categoryIndexes: [6, 7] },    // Islamic + Water
  { id: 6, angle:  52, len: 0.90, categoryIndexes: [8, 9] },    // Food + Screen
  { id: 7, angle:  75, len: 0.82, categoryIndexes: [10] },      // Stress
];

export { QUESTIONS, BRANCH_MAP };
