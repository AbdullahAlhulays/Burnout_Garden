import ProgressBar from "./ProgressBar";
import { getBarColor, getLeafColor } from "../data/scoring";

//
// Displays one category's score, bar, and leaf color dot.
// Used in the Dashboard grid.

function CategoryCard({ category, score }) {
  const barColor  = getBarColor(score);
  const leafColor = getLeafColor(score);
  const isDanger  = score < 40;
  const isWarn    = score >= 40 && score < 60;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm transition-transform hover:-translate-y-0.5 bg-white ${
        isDanger
          ? "border-l-4 border-red-400 bg-red-50/50"
          : isWarn
          ? "border-amber-200 bg-amber-50/30"
          : "border-green-100"
      }`}
    >
      <span className="text-xl w-7 text-center flex-shrink-0">{category.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-gray-800">{category.name}</span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-extrabold"
              style={{ color: isDanger ? "#c0392b" : isWarn ? "#d48a10" : barColor }}
            >
              {score}
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0"
              style={{ background: leafColor }}
            />
          </div>
        </div>
        <ProgressBar value={score} color={barColor} />
      </div>
    </div>
  );
}

export default CategoryCard;
