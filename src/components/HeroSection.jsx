import MainTree from "./MainTree";
import { getGardenTier, getNextTierUnlock } from "../data/gardenTiers";
import { QUESTIONS } from "../data/questions";
import { getLatestEntry } from "../utils/localStorage";

function HeroSection({
  onStartCheckin,
  onViewGarden,
  totalPoints = 0,
  gardenSettings,
  onUpdateGardenSettings,
}) {
  const latest = getLatestEntry();
  const scores =
    latest?.treeScores ??
    Object.fromEntries(QUESTIONS.map((question) => [question.id, 55]));
  const tier = getGardenTier(totalPoints);
  const nextUnlock = getNextTierUnlock(totalPoints);

  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
      <div className="inline-block rounded-3xl border border-green-200 bg-white/65 px-10 py-6 mb-10 backdrop-blur">
        <p className="text-xl font-semibold leading-loose text-green-900" dir="rtl">
          ﴿ إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنْفُسِهِمْ ﴾ [الرعد: 11]
        </p>
      </div>

      <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-green-100 bg-white/70 px-5 py-2 text-sm font-semibold text-green-900 backdrop-blur">
        <span>Garden points: {totalPoints}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        <span>Tier {tier}</span>
        {nextUnlock ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Next: {nextUnlock.label}</span>
          </>
        ) : null}
      </div>

      <h1
        className="mb-5 font-extrabold leading-none text-green-900"
        style={{ fontSize: "clamp(42px, 6vw, 72px)", letterSpacing: "-2px" }}
      >
        Burnout <span className="text-green-600">Garden</span>
      </h1>

      <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-green-800 md:text-lg">
        Check in with yourself, tend your tree, and return each day for a small letter puzzle that unlocks new life in the garden.
      </p>

      <div className="mb-12 flex justify-center">
        <MainTree
          scores={scores}
          totalPoints={totalPoints}
          gardenSettings={gardenSettings}
          onUpdateGardenSettings={onUpdateGardenSettings}
          showRewards
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onStartCheckin}
          className="cursor-pointer rounded-full bg-green-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 hover:bg-green-800"
        >
          Start Today&apos;s Check-in 🌱
        </button>
        <button
          onClick={onViewGarden}
          className="cursor-pointer rounded-full border-2 border-green-600 px-8 py-3.5 text-base font-semibold text-green-600 transition-all hover:bg-green-50"
        >
          View My Garden
        </button>
      </div>
    </div>
  );
}

export default HeroSection;
