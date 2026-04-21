import WeeklySummary from "../components/WeeklySummary";


function SummaryPage() {
  return (
    <div
      className="min-h-screen pt-14"
      style={{ background: "linear-gradient(160deg, #e8f5ee 0%, #faf8f3 100%)" }}
    >
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-900">Weekly Summary 📊</h2>
          <p className="text-sm text-green-700 mt-1">Your last 7 days at a glance</p>
        </div>
        <WeeklySummary />
      </div>
    </div>
  );
}

export default SummaryPage;
