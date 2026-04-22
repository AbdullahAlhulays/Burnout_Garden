import DailyCheckInForm from "../components/DailyCheckInForm";

function CheckInPage({ onDone }) {
  return (
    <div
      className="min-h-screen pt-14"
      style={{
        background:
          "linear-gradient(160deg, #eef7f2 0%, #f7f6ef 55%, #f1eadf 100%)",
      }}
    >
      <DailyCheckInForm onComplete={onDone} />
    </div>
  );
}

export default CheckInPage;
