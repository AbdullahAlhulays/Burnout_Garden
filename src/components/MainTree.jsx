import { useEffect, useMemo, useRef } from "react";
import { getBranchTipPosition, drawTree } from "../utils/treeDrawing";
import { scoresToArray } from "../data/scoring";
import { QUESTION_INDEX } from "../data/questions";
import GardenRewardsLayer from "./GardenRewardsLayer";

function MainTree({
  scores,
  ribbonBranchId = null,
  breatheMode = false,
  className = "",
  totalPoints = null,
  gardenSettings = null,
  onUpdateGardenSettings = null,
  showRewards = false,
}) {
  const canvasRef = useRef(null);
  const scoreArray = useMemo(() => scoresToArray(scores ?? {}), [scores]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let frameId = 0;
    let running = true;

    const render = (time) => {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const sway = breatheMode ? Math.sin(time / 1300) * 8 : Math.sin(time / 1700) * 3;
      const boost = breatheMode ? (Math.sin(time / 1000) + 1) / 2 : 0;

      context.save();
      context.translate(sway, 0);
      drawTree(context, width / 2, height - 8, width - 12, scoreArray, time, -1, boost);
      context.restore();

      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [scoreArray, breatheMode]);

  const ribbonStyle = useMemo(() => {
    if (!ribbonBranchId) return null;

    const index = QUESTION_INDEX[ribbonBranchId];
    if (typeof index !== "number") return null;

    const tip = getBranchTipPosition(index, scoreArray, 480, 360);

    return {
      left: `${(tip.x / 480) * 100}%`,
      top: `${(tip.y / 360) * 100}%`,
    };
  }, [ribbonBranchId, scoreArray]);

  return (
    <div className={`tree-stage ${className} ${breatheMode ? "tree-stage-breathe" : ""}`}>
      {showRewards ? (
        <GardenRewardsLayer
          totalPoints={totalPoints ?? 0}
          settings={gardenSettings}
          onUpdateSettings={onUpdateGardenSettings}
        />
      ) : null}
      <canvas ref={canvasRef} className="tree-canvas" />
      {ribbonStyle ? (
        <div className="branch-ribbon" style={ribbonStyle}>
          <span />
        </div>
      ) : null}
    </div>
  );
}

export default MainTree;
