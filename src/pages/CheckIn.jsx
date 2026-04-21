import DailyCheckInForm from "../components/DailyCheckInForm";


function CheckInPage({ onDone }) {
  return (
    <div
      className="min-h-screen pt-14"
      style={{ background: "linear-gradient(160deg, #eef7f2 0%, #faf8f3 100%)" }}
    >
      <DailyCheckInForm onComplete={onDone} />
    </div>
  );
}

export default CheckInPage;
