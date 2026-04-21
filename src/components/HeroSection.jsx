import MainTree from "./MainTree";
import { QUESTIONS } from "../data/questions";
import { getLatestEntry } from "../utils/localStorage";


function HeroSection({ onStartCheckin, onViewGarden }) {
  const latest = getLatestEntry();
  const scores = latest?.scores ?? Object.fromEntries(QUESTIONS.map(q => [q.id, 55]));

  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">

      {/* Arabic verse */}
    <div className="inline-block bg-white/65 backdrop-blur border border-green-200 rounded-3xl px-10 py-6 mb-14">
      <p className="text-xl leading-loose font-semibold text-green-900" dir="rtl">
        ﴿ إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ ﴾ [الرعد: ١١]
      </p>
    </div>

      <h1
        className="font-extrabold text-green-900 mb-5 leading-none"
        style={{ fontSize: "clamp(42px, 6vw, 72px)", letterSpacing: "-2px" }}
      >
        Burnout <span className="text-green-600">Garden</span>
      </h1>

      <p className="text-base md:text-lg text-green-800 max-w-2xl mx-auto leading-relaxed mb-12 text-center">
        You are the gardener of your own life. The choices you make each day decide whether your garden blooms or dries out.
      </p>

      <div className="flex justify-center mb-12">
        <MainTree scores={scores} width={520} height={300} groundY={292} />
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={onStartCheckin}
          className="bg-green-600 hover:bg-green-800 text-white font-semibold px-10 py-4 rounded-full text-base transition-all hover:-translate-y-0.5 shadow-lg shadow-green-200 cursor-pointer"
        >
          Start Today's Check-in 🌱
        </button>
        <button
          onClick={onViewGarden}
          className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold px-8 py-3.5 rounded-full text-base transition-all cursor-pointer"
        >
          View My Garden
        </button>
      </div>
    </div>
  );
}

export default HeroSection;
