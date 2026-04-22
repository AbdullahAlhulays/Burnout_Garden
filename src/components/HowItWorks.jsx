const HOW_IT_WORKS_CARDS = [
  {
    icon: "📋",
    title: "Daily Check-in",
    description: "Answer 12 short burnout questions each day using a simple 0 to 5 scale.",
  },
  {
    icon: "🍃",
    title: "Daily Puzzle",
    description: "Play one Wordle-style mini game each day to earn points and grow your garden tier.",
  },
  {
    icon: "📊",
    title: "Weekly Insights",
    description: "See 7 day trends, your overall balance, and gentle recommendations to guide you forward.",
  },
];

function HowItWorks() {
  return (
    <div className="bg-white/55 px-6 py-16 text-center">
      <h2 className="mb-10 text-2xl font-bold text-green-900">How It Works</h2>
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-3">
        {HOW_IT_WORKS_CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-green-100 bg-white p-6 text-left"
          >
            <div className="mb-3 text-3xl">{card.icon}</div>
            <h3 className="mb-2 text-sm font-bold text-gray-800">{card.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HowItWorks;
