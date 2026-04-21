import { useEffect, useRef, useState } from "react";
import { QUESTIONS, BRANCH_MAP } from "../data/questions";
import { scoresToArray } from "../data/scoring";
import { drawTree, getBranchTipPosition, drawWateringCan } from "../utils/treeDrawing";
//
// Full-screen overlay that plays after check-in.
// The watering can smoothly travels to each branch,
// waters it, and the bar fills in real time.

function WateringCanOverlay({ scores, onFinish }) {
  const canvasRef = useRef(null);

  // We use a ref for animation state to avoid re-renders during RAF loop
  const animRef = useRef({
    catIndex:    0,
    catProgress: 0,
    boost:       0,
    canX:        240,
    canY:        30,
    targetX:     240,
    targetY:     30,
    tick:        0,
    liveScores:  Object.fromEntries(QUESTIONS.map(q => [q.id, 0])),
    drops:       [],
    sparkles:    [],
  });

  const [barValues,  setBarValues]  = useState(Object.fromEntries(QUESTIONS.map(q => [q.id, 0])));
  const [activeCat,  setActiveCat]  = useState(0);

  const scoreArray = scoresToArray(scores);

  function moveCan(catIdx) {
    const tip = getBranchTipPosition(catIdx, scoreArray, 480, 352);
    animRef.current.targetX = tip.x;
    animRef.current.targetY = tip.y;
  }
  useEffect(() => {
    moveCan(0);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    let raf;

    function spawnWaterDrops(x, y) {
      for (let i = 0; i < 2; i++) {
        animRef.current.drops.push({
          x, y,
          vx: (Math.random() - 0.4) * 0.8,
          vy: 1.2 + Math.random() * 1.5,
          life: 1,
          r: 1.5 + Math.random() * 2,
        });
      }
    }

    function spawnSparkles(x, y) {
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        animRef.current.sparkles.push({
          x, y,
          vx: Math.cos(angle) * (1 + Math.random() * 2),
          vy: Math.sin(angle) * (1 + Math.random() * 2),
          life: 1,
          r: 2 + Math.random() * 2,
        });
      }
    }

    function drawParticles() {
      const a = animRef.current;

      a.drops = a.drops.filter(d => d.life > 0);
      a.drops.forEach(d => {
        d.x += d.vx; d.y += d.vy; d.vy += 0.12; d.life -= 0.025;
        const r = Math.max(0, d.r * d.life);
        if (r <= 0) return;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,200,255,${d.life * 0.8})`;
        ctx.fill();
      });

      a.sparkles = a.sparkles.filter(d => d.life > 0);
      a.sparkles.forEach(d => {
        d.x += d.vx; d.y += d.vy; d.life -= 0.03;
        const r = Math.max(0, d.r * d.life);
        if (r <= 0) return;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,255,160,${d.life})`;
        ctx.fill();
      });
    }

    function loop() {
      const a = animRef.current;
      a.tick += 16;
      ctx.clearRect(0, 0, 480, 370);

      // Smooth can movement towards target branch
      a.canX += (a.targetX - a.canX) * 0.09;
      a.canY += (a.targetY - a.canY) * 0.09;

      const distToTarget = Math.sqrt((a.targetX - a.canX) ** 2 + (a.targetY - a.canY) ** 2);
      const hasArrived   = distToTarget < 20;
      const isPouring    = hasArrived && a.catIndex < QUESTIONS.length;
      const canTilt      = isPouring ? 0.7 : 0.15;

      // Draw the tree with current live progress scores
      const liveArr = QUESTIONS.map(q => a.liveScores[q.id] ?? 0);
      drawTree(ctx, 240, 352, 480, liveArr, a.tick, a.catIndex, a.boost);

      // Spawn water drops and sparkles while pouring
      if (isPouring && a.tick % 2 === 0) {
        spawnWaterDrops(a.canX + Math.cos(canTilt) * 46, a.canY + Math.sin(canTilt) * 46);
      }
      if (isPouring && a.tick % 12 === 0) {
        spawnSparkles(a.canX + 40 + Math.random() * 20 - 10, a.canY + 50 + Math.random() * 20);
      }

      drawParticles();
      drawWateringCan(ctx, a.canX, a.canY, canTilt, isPouring);

      // Update boost (glow strength on watered branch)
      a.boost = hasArrived ? Math.min(1, a.boost + 0.04) : Math.max(0, a.boost - 0.02);

      // Advance fill progress for the current category
      if (isPouring) {
        const currentCat = QUESTIONS[a.catIndex];
        const target = scores[currentCat.id] ?? 0;

        const nextValue = Math.min(target, a.catProgress + 1.1);
        const roundedValue = Math.round(nextValue);

        a.catProgress = nextValue;

        a.liveScores = {
          ...a.liveScores,
          [currentCat.id]: roundedValue,
        };

        setBarValues(prev => ({
          ...prev,
          [currentCat.id]: roundedValue,
        }));

        if (nextValue >= target) {
          a.catIndex++;
          a.catProgress = 0;
          a.boost = 0;

          if (a.catIndex < QUESTIONS.length) {
            setActiveCat(a.catIndex);
            moveCan(a.catIndex);
          }
        }
      }

      if (a.catIndex >= QUESTIONS.length) {
        cancelAnimationFrame(raf);
        setTimeout(onFinish, 900);
        return;
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-12 overflow-hidden"
      style={{ background: "rgba(6,20,10,.92)", backdropFilter: "blur(6px)" }}
    >
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold text-white mb-1">💧 Tending Your Garden</h2>
        <p className="text-sm text-white/50">Your care is bringing each branch back to life...</p>
      </div>

      {/* Canvas + progress list side by side */}
      <div className="flex gap-5 items-start justify-center w-full max-w-3xl px-4">
        <canvas
          ref={canvasRef}
          width={480}
          height={370}
          className="rounded-2xl flex-shrink-0"
          style={{ background: "rgba(255,255,255,.03)" }}
        />

        {/* Category progress list */}
        <div className="flex flex-col gap-1.5 w-48 pt-2 flex-shrink-0">
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1 pl-1">Progress</p>
          {QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-300 ${
                i === activeCat ? "bg-green-400/20 translate-x-0.5" : "bg-white/5"
              }`}
            >
              <span className="w-4 text-center">{q.icon}</span>
              <span className="text-white/70 flex-1 truncate">{q.name}</span>
              <div className="flex-[2] h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${barValues[q.id]}%`, background: "#4abe6e" }}
              />
              </div>
              <span className="text-green-400 font-bold min-w-[24px] text-right">
                {barValues[q.id]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WateringCanOverlay;
