import { useEffect } from "react";
import { saveCommitment } from "../utils/localStorage";
import { getChallengeForScores } from "../utils/insights";

function MicroChallengePrompt({ scores, onDone }) {
  const challenge = getChallengeForScores(scores);

  useEffect(() => {
    if (!challenge) {
      onDone();
    }
  }, [challenge, onDone]);

  if (!challenge) return null;

  function handleAccept() {
    saveCommitment({
      branchId: challenge.branchId,
      action: challenge.action,
      status: "committed",
    });

    onDone();
  }

  function handleSkip() {
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[rgba(9,20,12,0.72)] backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-xl rounded-[32px] border border-white/20 bg-white/90 p-8 shadow-2xl">
        <div className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-green-700/80">
          Water This Branch Today
        </div>

        <h2 className="mb-3 text-3xl font-black leading-tight text-green-950">
          Your {challenge.branchLabel} branch needs care today.
        </h2>

        <p className="mb-8 text-lg leading-relaxed text-green-900/85">
          {challenge.action}
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-green-800"
          >
            I&apos;ll try this
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full border border-green-200 bg-white px-6 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50"
          >
            Not today
          </button>
        </div>
      </div>
    </div>
  );
}

export default MicroChallengePrompt;
