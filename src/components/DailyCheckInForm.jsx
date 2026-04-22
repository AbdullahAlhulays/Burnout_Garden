import { useMemo, useState } from "react";
import {
  BURNOUT_ANSWER_OPTIONS,
  QUESTIONS,
  QUESTION_LABELS,
} from "../data/questions";
import { computeScores, computeTreeScores } from "../data/scoring";
import {
  getTodayEntry,
  getYesterdayCommitment,
  saveEntry,
  updateCommitmentOutcome,
} from "../utils/localStorage";

const COMMITMENT_OPTIONS = [
  { value: "done", label: "I did it" },
  { value: "partial", label: "I partly did it" },
  { value: "missed", label: "I didn’t do it" },
];

function DailyCheckInForm({ onComplete }) {
  const savedToday = getTodayEntry();
  const yesterdayCommitment = getYesterdayCommitment();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    if (savedToday) return { ...savedToday.answers };
    return Object.fromEntries(QUESTIONS.map((question) => [question.id, 0]));
  });
  const [commitmentAnswered, setCommitmentAnswered] = useState(
    !yesterdayCommitment || !!yesterdayCommitment.outcome
  );

  const question = QUESTIONS[step];
  const isLastStep = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const selectedValue = answers[question.id] ?? 0;
  const showRecommendation = selectedValue >= 4;

  const yesterdayBranchLabel = useMemo(() => {
    if (!yesterdayCommitment?.branchId) return "branch";
    return QUESTION_LABELS[yesterdayCommitment.branchId] ?? "branch";
  }, [yesterdayCommitment]);

  function handleCommitmentAnswer(option) {
    if (yesterdayCommitment) {
      updateCommitmentOutcome(yesterdayCommitment.date, option.value, option.label);
    }
    setCommitmentAnswered(true);
  }

  function handleAnswerSelect(value) {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: value,
    }));
  }

  function handleNext() {
    if (!isLastStep) {
      setStep((current) => current + 1);
      return;
    }

    const scores = computeScores(answers);
    const treeScores = computeTreeScores(scores);
    const entry = saveEntry(answers, scores, treeScores);

    onComplete(entry);
  }

  function handleBack() {
    if (step > 0) setStep((current) => current - 1);
  }

  if (!commitmentAnswered && yesterdayCommitment) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="rounded-[32px] border border-green-100 bg-white/85 p-8 shadow-xl">
          <div className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-green-700/80">
            A Small Follow-Up
          </div>

          <h2 className="mb-3 text-3xl font-black text-green-950">
            Yesterday you made a commitment to your {yesterdayBranchLabel} branch.
          </h2>

          <p className="mb-6 text-base leading-relaxed text-green-900/80">
            {yesterdayCommitment.action}
          </p>

          <p className="mb-4 text-sm font-medium text-green-800">
            How did it go?
          </p>

          <div className="flex flex-col gap-3">
            {COMMITMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleCommitmentAnswer(option)}
                className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-left text-sm font-semibold text-green-900 transition hover:border-green-400 hover:bg-green-100"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-green-900">
          Daily Check-in
        </h2>
        <p className="text-sm text-green-700">
          Answer honestly. This is here to reflect how you really feel.
        </p>
      </div>

      {savedToday && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-center text-sm font-medium text-green-700">
          Your answers from earlier today have been loaded.
        </div>
      )}

      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-green-100">
        <div
          className="h-full rounded-full bg-green-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-6 rounded-[28px] border border-green-100 bg-white p-8 shadow-md">
        <div className="mb-3 text-3xl">{question.icon}</div>

        <div className="mb-6 min-h-[96px]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-700/75">
            {question.category}
          </p>
          <h3 className="text-xl font-semibold leading-snug text-gray-800">
            {question.question}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {BURNOUT_ANSWER_OPTIONS.map((option) => {
            const selected = selectedValue === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAnswerSelect(option.value)}
                className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                  selected
                    ? "border-green-700 bg-green-700 text-white"
                    : "border-green-100 bg-green-50/70 text-green-900 hover:border-green-300 hover:bg-green-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>Never</span>
          <span>Always</span>
        </div>

        <div className="mt-5 min-h-[72px]">
          <div
            className={`rounded-2xl px-4 py-3 transition-all duration-200 ${
              showRecommendation
                ? "border border-amber-200 bg-amber-50 opacity-100"
                : "border border-transparent bg-transparent opacity-0"
            }`}
            aria-hidden={!showRecommendation}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Gentle suggestion
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-900">
              {question.staticRecommendation}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className={`rounded-xl border-2 border-green-100 px-5 py-2.5 text-sm font-medium text-gray-500 transition-all hover:border-green-400 hover:text-green-700 ${
            step === 0 ? "invisible" : ""
          }`}
        >
          ← Back
        </button>

        <span className="text-xs font-medium text-gray-400">
          {step + 1} / {QUESTIONS.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl bg-green-600 px-8 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-green-800"
        >
          {isLastStep ? "Complete" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export default DailyCheckInForm;
