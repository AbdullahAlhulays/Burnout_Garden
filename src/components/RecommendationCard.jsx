//
// One recommendation item in the weekly summary.

function RecommendationCard({ text, level }) {
  const dotColor =
    level === "danger" ? "#c0392b" :
    level === "warn"   ? "#d48a10" :
    "#2d8a4e";

  return (
    <div className="flex gap-3 items-start py-2.5 border-b border-green-50 last:border-0">
      <span
        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
        style={{ background: dotColor }}
      />
      <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
    </div>
  );
}

export default RecommendationCard;
