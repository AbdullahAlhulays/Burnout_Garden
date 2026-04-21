
const HOW_IT_WORKS_CARDS = [
  {
    icon: "📋",
    title: "Daily Check-in",
    description: "Spend one minute answering 11 simple questions each day to better understand yourself.",
  },
  {
    icon: "🌿",
    title: "Watch It Grow",
    description: "Each answer shapes a living branch. Strong habits bloom, neglected ones quietly wilt.",
  },
  {
    icon: "📊",
    title: "Weekly Insights",
    description: "See 7-day trends, your overall balance, and gentle recommendations to guide you forward.",
  },
];

function HowItWorks() {
  return (
    <div className="bg-white/55 py-16 px-6 text-center">
      <h2 className="text-2xl font-bold text-green-900 mb-10">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl mx-auto">
        {HOW_IT_WORKS_CARDS.map(card => (
          <div key={card.title} className="bg-white rounded-2xl p-6 border border-green-100 text-left">
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="font-bold text-sm text-gray-800 mb-2">{card.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HowItWorks;
