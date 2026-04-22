import { useEffect, useRef, useState } from "react";
import { QUESTIONS } from "../data/questions";
import { scoresToArray } from "../data/scoring";
import { drawTree, getBranchTipPosition, drawWateringCan } from "../utils/treeDrawing";

function WateringCanOverlay({ treeScores, onFinish }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const finishTimeoutRef = useRef(0);
  const finishedRef = useRef(false);

  const animRef = useRef({
    catIndex: 0,
    catProgress: 0,
    boost: 0,
    canX: 240,
    canY: 30,
    targetX: 240,
    targetY: 30,
    tick: 0,
    liveScores: Object.fromEntries(QUESTIONS.map((q) => [q.id, 0])),
    drops: [],
    sparkles: [],
  });

  const [barValues, setBarValues] = useState(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, 0]))
  );
  const [activeCat, setActiveCat] = useState(0);

  const scoreArray = scoresToArray(treeScores);

  function moveCan(catIdx) {
    const tip = getBranchTipPosition(catIdx, scoreArray, 480, 352);
    animRef.current.targetX = tip.x;
    animRef.current.targetY = tip.y;
  }

  function completeWatering() {
    if (finishedRef.current) return;

    finishedRef.current = true;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = 0;
    }

    onFinish();
  }

  useEffect(() => {
    finishedRef.current = false;
    moveCan(0);

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");

    function spawnWaterDrops(x, y) {
      for (let i = 0; i < 2; i++) {
        animRef.current.drops.push({
          x,
          y,
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
          x,
          y,
          vx: Math.cos(angle) * (1 + Math.random() * 2),
          vy: Math.sin(angle) * (1 + Math.random() * 2),
          life: 1,
          r: 2 + Math.random() * 2,
        });
      }
    }

    function drawParticles() {
      const a = animRef.current;

      a.drops = a.drops.filter((drop) => drop.life > 0);
      a.drops.forEach((drop) => {
        drop.x += drop.vx;
        drop.y += drop.vy;
        drop.vy += 0.12;
        drop.life -= 0.025;

        const radius = Math.max(0, drop.r * drop.life);
        if (radius <= 0) return;

        ctx.beginPath();
        ctx.arc(drop.x, drop.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,200,255,${drop.life * 0.8})`;
        ctx.fill();
      });

      a.sparkles = a.sparkles.filter((sparkle) => sparkle.life > 0);
      a.sparkles.forEach((sparkle) => {
        sparkle.x += sparkle.vx;
        sparkle.y += sparkle.vy;
        sparkle.life -= 0.03;

        const radius = Math.max(0, sparkle.r * sparkle.life);
        if (radius <= 0) return;

        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,255,160,${sparkle.life})`;
        ctx.fill();
      });
    }

    function loop() {
      const a = animRef.current;
      a.tick += 16;
      ctx.clearRect(0, 0, 480, 370);

      a.canX += (a.targetX - a.canX) * 0.09;
      a.canY += (a.targetY - a.canY) * 0.09;

      const distToTarget = Math.sqrt(
        (a.targetX - a.canX) ** 2 + (a.targetY - a.canY) ** 2
      );
      const hasArrived = distToTarget < 20;
      const isPouring = hasArrived && a.catIndex < QUESTIONS.length;
      const canTilt = isPouring ? 0.7 : 0.15;

      const liveArr = QUESTIONS.map((q) => a.liveScores[q.id] ?? 0);
      drawTree(ctx, 240, 352, 480, liveArr, a.tick, a.catIndex, a.boost);

      if (isPouring && a.tick % 2 === 0) {
        spawnWaterDrops(
          a.canX + Math.cos(canTilt) * 46,
          a.canY + Math.sin(canTilt) * 46
        );
      }

      if (isPouring && a.tick % 12 === 0) {
        spawnSparkles(
          a.canX + 40 + Math.random() * 20 - 10,
          a.canY + 50 + Math.random() * 20
        );
      }

      drawParticles();
      drawWateringCan(ctx, a.canX, a.canY, canTilt, isPouring);

      a.boost = hasArrived ? Math.min(1, a.boost + 0.04) : Math.max(0, a.boost - 0.02);

      if (isPouring) {
        const currentCat = QUESTIONS[a.catIndex];
        const target = treeScores[currentCat.id] ?? 0;
        const nextValue = Math.min(target, a.catProgress + 1.1);
        const roundedValue = Math.round(nextValue);

        a.catProgress = nextValue;
        a.liveScores = {
          ...a.liveScores,
          [currentCat.id]: roundedValue,
        };

        setBarValues((previous) => ({
          ...previous,
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
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
        finishTimeoutRef.current = window.setTimeout(completeWatering, 900);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
        finishTimeoutRef.current = 0;
      }
    };
  }, [treeScores, onFinish]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-hidden pt-12"
      style={{ background: "rgba(6,20,10,.92)", backdropFilter: "blur(6px)" }}
    >
      <button
        type="button"
        onClick={completeWatering}
        className="absolute right-5 top-5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        Skip
      </button>

      <div className="mb-5 text-center">
        <h2 className="mb-1 text-2xl font-bold text-white">💧 Tending Your Garden</h2>
        <p className="text-sm text-white/50">
          Your care is bringing each branch back to life...
        </p>
      </div>

      <div className="flex w-full max-w-3xl items-start justify-center gap-5 px-4">
        <canvas
          ref={canvasRef}
          width={480}
          height={370}
          className="flex-shrink-0 rounded-2xl"
          style={{ background: "rgba(255,255,255,.03)" }}
        />

        <div className="flex w-48 flex-shrink-0 flex-col gap-1.5 pt-2">
          <p className="mb-1 pl-1 text-xs font-semibold uppercase tracking-wider text-white/40">
            Growth
          </p>

          {QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all duration-300 ${
                i === activeCat ? "translate-x-0.5 bg-green-400/20" : "bg-white/5"
              }`}
            >
              <span className="w-4 text-center">{q.icon}</span>
              <span className="flex-1 truncate text-white/70">{q.name}</span>
              <div className="h-1 flex-[2] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${barValues[q.id]}%`, background: "#4abe6e" }}
                />
              </div>
              <span className="min-w-[24px] text-right font-bold text-green-400">
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
