import WeeklySummary from "../components/WeeklySummary";

function SummaryPage({ weatherMood }) {
  return (
    <div className={`page-shell pt-14 weather-${weatherMood}`}>
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-green-900">Weekly Summary 📊</h2>
          <p className="mt-1 text-sm text-green-700">Your last 7 days at a glance</p>
        </div>
        <WeeklySummary />
      </div>
    </div>
  );
}

export default SummaryPage;
