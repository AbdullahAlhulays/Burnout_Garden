import { useState } from "react";
import { QUESTIONS } from "../data/questions";
import { computeScores } from "../data/scoring";
import { getTodayEntry, saveEntry } from "../utils/localStorage";

//
// One question at a time with a slider.
// Calls onComplete(scores) when the user finishes all questions.

function DailyCheckInForm({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    // Load today's saved answers if they exist
    const saved = getTodayEntry();
    if (saved) return { ...saved.answers };
    return Object.fromEntries(QUESTIONS.map(q => [q.id, q.min]));
  });

  const hasSavedToday = !!getTodayEntry();
  const question      = QUESTIONS[step];
  const isLastStep    = step === QUESTIONS.length - 1;
  const progress      = (step / QUESTIONS.length) * 100;

  function handleSliderChange(value) {
    setAnswers(prev => ({ ...prev, [question.id]: parseFloat(value) }));
  }

  function handleNext() {
    if (!isLastStep) {
      setStep(s => s + 1);
      return;
    }
    const scores = computeScores(answers);
    saveEntry(answers, scores);
    onComplete(scores);
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1);
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-900 mb-2">Daily Check-in 🌿</h2>
        <p className="text-sm text-green-700">How did your day go? Be honest — this garden reflects you.</p>
      </div>

      {hasSavedToday && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 font-medium text-center mb-5">
          ✓ Your answers from earlier today have been loaded
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-green-100 rounded-full h-1.5 mb-8 overflow-hidden">
        <div
          className="h-full bg-green-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
        <div className="bg-white rounded-2xl p-9 border border-green-100 shadow-md mb-6">
          <div className="text-3xl mb-3">{question.icon}</div>

          <div className="min-h-[78px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 leading-snug">
              {question.question}
            </h3>
            <p className="text-xs text-gray-400">
              {question.hint}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4">
          <input
            type="range"
            min={question.min}
            max={question.max}
            step={question.step}
            value={answers[question.id]}
            onChange={e => handleSliderChange(e.target.value)}
            className="flex-1 accent-green-600 cursor-pointer"
          />
          <div className="text-lg font-bold text-green-600 min-w-[60px] text-center">
            {answers[question.id]}
            <span className="text-xs text-gray-400 ml-1">{question.unit}</span>
          </div>
        </div>
      </div>

      {/* Back / step counter / Next */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className={`border-2 border-green-100 text-gray-500 hover:border-green-400 hover:text-green-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            step === 0 ? "invisible" : ""
          }`}
        >
          ← Back
        </button>
        <span className="text-xs text-gray-400 font-medium">{step + 1} / {QUESTIONS.length}</span>
        <button
          onClick={handleNext}
          className="bg-green-600 hover:bg-green-800 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          {isLastStep ? "Complete 🌱" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export default DailyCheckInForm;
