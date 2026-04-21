import { QUESTIONS } from "../data/questions";
import { getHealthLabel, getOverallScore } from "../data/scoring";
import { getLatestEntry } from "../utils/localStorage";
import MainTree from "../components/MainTree";
import CategoryCard from "../components/CategoryCard";


function DashboardPage({ onNavigate }) {
  const latest = getLatestEntry();

  if (!latest) {
    return (
      <div
        className="min-h-screen pt-14 flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #e8f5ee 0%, #faf8f3 100%)" }}
      >
        <div className="text-center px-6">
          <div className="text-7xl mb-5">🌱</div>
          <h3 className="text-xl font-semibold text-green-900 mb-2">Your garden is waiting</h3>
          <p className="text-sm text-gray-500 mb-6">Complete your first daily check-in to start growing your plant.</p>
          <button
            onClick={() => onNavigate("checkin")}
            className="bg-green-600 hover:bg-green-800 text-white font-semibold px-10 py-3.5 rounded-full transition-all cursor-pointer"
          >
            Start Check-in
          </button>
        </div>
      </div>
    );
  }

  const { scores }   = latest;
  const overall      = getOverallScore(scores);
  const healthLabel  = getHealthLabel(overall);

  return (
    <div
      className="min-h-screen pt-14"
      style={{ background: "linear-gradient(160deg, #e8f5ee 0%, #faf8f3 100%)" }}
    >
      <div className="max-w-4xl mx-auto px-5 py-10">

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-900">Your Garden 🌳</h2>
          <p className="text-sm text-green-700 mt-1">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Tree — the main visual focus */}
        <div className="bg-white/50 border border-green-100 rounded-3xl p-5 mb-6 text-center">
          <span
            className="inline-block text-white text-sm font-bold px-5 py-1.5 rounded-full mb-4"
            style={{ background: healthLabel.color }}
          >
            {healthLabel.text} · {overall}
          </span>
          <div className="flex justify-center">
            <MainTree scores={scores} width={680} height={340} groundY={332} />
          </div>
        </div>

        {/* Category cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {QUESTIONS.map(q => (
            <CategoryCard key={q.id} category={q} score={scores[q.id] ?? 0} />
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => onNavigate("checkin")}
            className="bg-green-600 hover:bg-green-800 text-white font-semibold px-10 py-3.5 rounded-full transition-all shadow-lg shadow-green-200 cursor-pointer"
          >
            Update Today's Check-in
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
