import { useEffect, useRef } from "react";
import { scoresToArray } from "../data/scoring";
import { drawTree } from "../utils/treeDrawing";

//
// Reusable animated tree canvas.
// Pass scores + dimensions, it handles the animation loop.

function MainTree({ scores, width, height, groundY, wateredCatIndex = -1, waterBoost = 0 }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tickRef   = useRef(0);

  const scoreArray = scoresToArray(scores);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function loop() {
      tickRef.current += 16;
      ctx.clearRect(0, 0, width, height);
      drawTree(ctx, width / 2, groundY, width, scoreArray, tickRef.current, wateredCatIndex, waterBoost);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(scoreArray), wateredCatIndex, waterBoost]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block" }}
    />
  );
}

export default MainTree;
