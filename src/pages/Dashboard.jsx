import MainTree from "../components/MainTree";
import CategoryCard from "../components/CategoryCard";
import { getGardenTier } from "../data/gardenTiers";
import { QUESTIONS } from "../data/questions";
import { calculateBurnoutResult, getHealthLabel } from "../data/scoring";
import { getLatestEntry, getTodayCommitment } from "../utils/localStorage";

function DashboardPage({
  onNavigate,
  weatherMood,
  totalPoints,
  gardenSettings,
  onUpdateGardenSettings,
}) {
  const latest = getLatestEntry();
  const todayCommitment = getTodayCommitment();

  if (!latest) {
    return (
      <div className={`page-shell pt-14 weather-${weatherMood} flex items-center justify-center`}>
        <div className="page-content">
          <div className="text-center px-6">
            <div className="mb-5 text-7xl">🌱</div>
            <h3 className="mb-2 text-xl font-semibold text-green-900">Your garden is waiting</h3>
            <p className="mb-6 text-sm text-gray-500">
              Complete your first daily check-in to start growing your plant.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("checkin")}
              className="rounded-full bg-green-600 px-10 py-3.5 font-semibold text-white transition-all hover:bg-green-800"
            >
              Start Check-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { answers, scores, treeScores, overall } = latest;
  const burnoutLabel = getHealthLabel(overall);
  const burnoutResult = calculateBurnoutResult(answers);

  return (
    <div className={`page-shell pt-14 weather-${weatherMood}`}>
      <div className="page-content">
        <div className="max-w-4xl mx-auto px-5 py-10">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-green-900">Your Garden 🌳</h2>
            <p className="mt-1 text-sm text-green-700">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>

          <div className="mb-6 rounded-3xl border border-green-100 bg-white/60 p-5 text-center backdrop-blur-sm">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              <span
                className="inline-block rounded-full px-5 py-1.5 text-sm font-bold text-white"
                style={{ background: burnoutLabel.color }}
              >
                Burnout {burnoutLabel.text} · {overall}%
              </span>
              <span className="rounded-full bg-green-900 px-4 py-1.5 text-sm font-semibold text-white">
                Garden points: {totalPoints}
              </span>
            </div>

            <div className="flex justify-center">
              <MainTree
                scores={treeScores}
                ribbonBranchId={todayCommitment?.branchId ?? null}
                totalPoints={totalPoints}
                gardenSettings={gardenSettings}
                onUpdateGardenSettings={onUpdateGardenSettings}
                showRewards
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-green-900/80">
              <span className="rounded-full bg-green-50 px-4 py-1.5">
                Weakest category: {burnoutResult.weakestCategory.label} ({burnoutResult.weakestCategory.percentage}%)
              </span>
              <span className="rounded-full bg-emerald-50 px-4 py-1.5">
                Garden tier: {getGardenTier(totalPoints)}
              </span>

              {todayCommitment ? (
                <span className="rounded-full bg-amber-50 px-4 py-1.5">
                  Today&apos;s branch promise: {todayCommitment.action}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUESTIONS.map((question) => (
              <CategoryCard
                key={question.id}
                category={question}
                score={scores[question.id] ?? 0}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onNavigate("checkin")}
              className="rounded-full bg-green-600 px-10 py-3.5 font-semibold text-white shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 hover:bg-green-800"
            >
              Update Today&apos;s Check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
