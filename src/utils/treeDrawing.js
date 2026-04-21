//
// Natural 11-branch tree drawing utilities for the Burnout Garden app.
//
// Exports used by the app:
// - drawTree(ctx, centerX, baseY, width, liveArr, tick, activeCat, boost)
// - getBranchTipPosition(branchId, scoreArray, width, height)
// - drawWateringCan(ctx, x, y, tilt, isPouring)
//
// This version:
// - uses 11 branches (one for each activity)
// - keeps the tree centered
// - makes weak branches look dry / thin / droopy
// - makes healthy branches fuller with more leaves and buds
//

const BRANCH_LAYOUT = [
  { angle: -2.35, attach: 0.22, curve: -24, baseLen: 54 },
  { angle: -2.18, attach: 0.30, curve: -22, baseLen: 62 },
  { angle: -2.00, attach: 0.38, curve: -18, baseLen: 72 },
  { angle: -1.84, attach: 0.46, curve: -14, baseLen: 82 },
  { angle: -1.68, attach: 0.56, curve: -10, baseLen: 92 },
  { angle: -1.57, attach: 0.66, curve: 0,   baseLen: 98 },
  { angle: -1.46, attach: 0.56, curve: 10,  baseLen: 92 },
  { angle: -1.30, attach: 0.46, curve: 14,  baseLen: 82 },
  { angle: -1.14, attach: 0.38, curve: 18,  baseLen: 72 },
  { angle: -0.96, attach: 0.30, curve: 22,  baseLen: 62 },
  { angle: -0.79, attach: 0.22, curve: 24,  baseLen: 54 },
];

const DEFAULT_BRANCH_COUNT = 11;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getNormalizedScore(score) {
  return clamp((score ?? 0) / 100, 0, 1);
}

function getBranchIndex(branchId) {
  if (typeof branchId === "number" && Number.isFinite(branchId)) {
    return Math.max(0, Math.min(DEFAULT_BRANCH_COUNT - 1, branchId));
  }

  const numeric = Number(branchId);
  if (!Number.isNaN(numeric)) {
    return Math.max(0, Math.min(DEFAULT_BRANCH_COUNT - 1, numeric));
  }

  return 0;
}

function getTreeMetrics(centerX, baseY, width) {
  const scale = width / 480;

  return {
    scale,
    centerX,
    baseY,
    trunkHeight: 132 * scale,
    trunkWidth: 28 * scale,
  };
}

function pointOnCubic(p0, p1, p2, p3, t) {
  const mt = 1 - t;

  const x =
    mt * mt * mt * p0.x +
    3 * mt * mt * t * p1.x +
    3 * mt * t * t * p2.x +
    t * t * t * p3.x;

  const y =
    mt * mt * mt * p0.y +
    3 * mt * mt * t * p1.y +
    3 * mt * t * t * p2.y +
    t * t * t * p3.y;

  return { x, y };
}

function getBranchGeometry(index, score, centerX, baseY, width) {
  const metrics = getTreeMetrics(centerX, baseY, width);
  const layout = BRANCH_LAYOUT[index] || BRANCH_LAYOUT[0];
  const pct = getNormalizedScore(score);

  const trunkTopY = metrics.baseY - metrics.trunkHeight;
  const startY = trunkTopY + metrics.trunkHeight * layout.attach;

  const side = index < 5 ? -1 : index > 5 ? 1 : 0;
  const startX = metrics.centerX + side * metrics.trunkWidth * 0.14;

  const length = (layout.baseLen + pct * 76) * metrics.scale;
  const curve = layout.curve * metrics.scale * (0.82 + pct * 0.32);
  const droop = (1 - pct) * 18 * metrics.scale;

  const endX = startX + Math.cos(layout.angle) * length + curve;
  const endY = startY + Math.sin(layout.angle) * length - 8 * metrics.scale + droop;

  const ctrl1X = startX + Math.cos(layout.angle) * length * 0.30 + curve * 0.10;
  const ctrl1Y = startY + Math.sin(layout.angle) * length * 0.22 - 8 * metrics.scale;

  const ctrl2X = startX + Math.cos(layout.angle) * length * 0.72 + curve * 0.65;
  const ctrl2Y = startY + Math.sin(layout.angle) * length * 0.70 - 10 * metrics.scale + droop * 0.45;

  return {
    index,
    pct,
    side,
    angle: layout.angle,
    startX,
    startY,
    ctrl1X,
    ctrl1Y,
    ctrl2X,
    ctrl2Y,
    endX,
    endY,
    length,
    thickness: lerp(7 * metrics.scale, 13 * metrics.scale, pct),
    twigLength: lerp(14 * metrics.scale, 24 * metrics.scale, pct),
  };
}

function drawGround(ctx, centerX, baseY, width) {
  const grad = ctx.createLinearGradient(0, baseY - 20, 0, baseY + 40);
  grad.addColorStop(0, "rgba(88,126,70,0.18)");
  grad.addColorStop(1, "rgba(63,97,52,0.42)");

  ctx.beginPath();
  ctx.ellipse(centerX, baseY + 8, width * 0.18, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawRoots(ctx, centerX, baseY, width) {
  const scale = width / 480;

  ctx.save();
  ctx.strokeStyle = "rgba(89,60,37,0.55)";
  ctx.lineWidth = 3.3 * scale;
  ctx.lineCap = "round";

  const roots = [
    { dx: -76, dy: 18, c1x: -18, c1y: 8, c2x: -52, c2y: 20 },
    { dx: -44, dy: 28, c1x: -14, c1y: 10, c2x: -30, c2y: 26 },
    { dx:  44, dy: 28, c1x:  14, c1y: 10, c2x:  30, c2y: 26 },
    { dx:  76, dy: 18, c1x:  18, c1y: 8, c2x:  52, c2y: 20 },
  ];

  roots.forEach(root => {
    ctx.beginPath();
    ctx.moveTo(centerX, baseY - 2);
    ctx.bezierCurveTo(
      centerX + root.c1x * scale,
      baseY + root.c1y * scale,
      centerX + root.c2x * scale,
      baseY + root.c2y * scale,
      centerX + root.dx * scale,
      baseY + root.dy * scale
    );
    ctx.stroke();
  });

  ctx.restore();
}

function drawTrunk(ctx, centerX, baseY, width) {
  const { trunkHeight, trunkWidth, scale } = getTreeMetrics(centerX, baseY, width);
  const topY = baseY - trunkHeight;

  const barkGrad = ctx.createLinearGradient(centerX - trunkWidth, topY, centerX + trunkWidth, baseY);
  barkGrad.addColorStop(0, "#5d3f25");
  barkGrad.addColorStop(0.35, "#744d2f");
  barkGrad.addColorStop(0.65, "#8a603c");
  barkGrad.addColorStop(1, "#593c24");

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(centerX - trunkWidth * 0.95, baseY);
  ctx.bezierCurveTo(
    centerX - trunkWidth * 1.12,
    baseY - trunkHeight * 0.28,
    centerX - trunkWidth * 0.60,
    baseY - trunkHeight * 0.82,
    centerX - trunkWidth * 0.25,
    topY
  );
  ctx.bezierCurveTo(
    centerX - trunkWidth * 0.08,
    topY - 8 * scale,
    centerX + trunkWidth * 0.08,
    topY - 8 * scale,
    centerX + trunkWidth * 0.25,
    topY
  );
  ctx.bezierCurveTo(
    centerX + trunkWidth * 0.60,
    baseY - trunkHeight * 0.82,
    centerX + trunkWidth * 1.12,
    baseY - trunkHeight * 0.28,
    centerX + trunkWidth * 0.95,
    baseY
  );
  ctx.closePath();
  ctx.fillStyle = barkGrad;
  ctx.fill();

  ctx.fillStyle = "rgba(48,28,14,0.12)";
  ctx.fillRect(centerX - trunkWidth * 0.10, topY + 10 * scale, trunkWidth * 0.20, trunkHeight * 0.80);

  ctx.restore();
}

function drawBarkVeins(ctx, centerX, baseY, width) {
  const { trunkHeight, trunkWidth, scale } = getTreeMetrics(centerX, baseY, width);
  const topY = baseY - trunkHeight + 10 * scale;

  ctx.save();
  ctx.lineCap = "round";

  for (let i = -2; i <= 2; i++) {
    const x = centerX + i * trunkWidth * 0.22;

    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.bezierCurveTo(
      x - 4 * scale,
      topY + trunkHeight * 0.18,
      x + 6 * scale,
      topY + trunkHeight * 0.56,
      x - 2 * scale,
      baseY - 10 * scale
    );
    ctx.strokeStyle = "rgba(73,45,22,0.28)";
    ctx.lineWidth = 1.4 * scale;
    ctx.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const y = topY + i * trunkHeight * 0.10;
    const side = i % 2 === 0 ? -1 : 1;
    const startX = centerX + side * trunkWidth * (0.16 + (i % 3) * 0.05);

    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.quadraticCurveTo(
      startX + side * 9 * scale,
      y + 4 * scale,
      startX + side * 4 * scale,
      y + 10 * scale
    );
    ctx.strokeStyle = "rgba(89,58,34,0.22)";
    ctx.lineWidth = 1.0 * scale;
    ctx.stroke();
  }

  ctx.restore();
}

function drawLeaf(ctx, x, y, size, rotation, isActive, boost, health = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (isActive) {
    ctx.shadowColor = `rgba(115,225,120,${0.24 + boost * 0.28})`;
    ctx.shadowBlur = 7 + boost * 6;
  }

  let c1 = "#4b9448";
  let c2 = "#77c367";
  let c3 = "#458441";

  if (health < 0.18) {
    c1 = "#7a6847";
    c2 = "#9a8258";
    c3 = "#6b5838";
  } else if (health < 0.35) {
    c1 = "#7f7a42";
    c2 = "#9f9654";
    c3 = "#6f6c38";
  }

  const grad = ctx.createLinearGradient(-size, 0, size, 0);
  grad.addColorStop(0, c1);
  grad.addColorStop(0.5, c2);
  grad.addColorStop(1, c3);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.92, -size * 0.62, size * 1.18, 0);
  ctx.quadraticCurveTo(size * 0.92, size * 0.62, 0, size * 1.12);
  ctx.quadraticCurveTo(-size * 0.84, size * 0.62, -size * 1.08, 0);
  ctx.quadraticCurveTo(-size * 0.84, -size * 0.62, 0, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(240,255,232,0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.78, 0);
  ctx.quadraticCurveTo(0, size * 0.08, size * 0.82, 0);
  ctx.stroke();

  ctx.restore();
}

function drawBranchStroke(ctx, geometry, isActive, boost, scale) {
  const { startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY, thickness, pct } = geometry;

  const health = pct;

  let branchColor = "#6d4a2d";
  if (health < 0.15) branchColor = "#6f5b49";
  else if (health < 0.35) branchColor = "#7d6140";
  else if (health < 0.60) branchColor = "#73502f";
  else branchColor = "#6a472a";

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (isActive) {
    ctx.shadowColor = `rgba(113,214,120,${0.25 + boost * 0.35})`;
    ctx.shadowBlur = 10 * scale + boost * 10 * scale;
  }

  ctx.strokeStyle = branchColor;
  ctx.lineWidth = lerp(2.2 * scale, thickness, health);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(168,121,82,0.30)";
  ctx.lineWidth = Math.max(0.8 * scale, thickness * 0.16);
  ctx.beginPath();
  ctx.moveTo(startX, startY - 1 * scale);
  ctx.bezierCurveTo(ctrl1X, ctrl1Y - 1 * scale, ctrl2X, ctrl2Y - 1 * scale, endX, endY);
  ctx.stroke();

  ctx.restore();
}

function drawTwigsAndLeaves(ctx, geometry, isActive, boost, scale) {
  const {
    startX,
    startY,
    ctrl1X,
    ctrl1Y,
    ctrl2X,
    ctrl2Y,
    endX,
    endY,
    pct,
    angle,
    twigLength,
  } = geometry;

  if (pct < 0.08) return;

  const points = [];
  const leafCount = Math.max(1, Math.round(1 + pct * 10));

  for (let i = 0; i < leafCount; i++) {
    const t = clamp(0.22 + i * (0.62 / Math.max(1, leafCount - 1)), 0.22, 0.88);
    points.push(
      pointOnCubic(
        { x: startX, y: startY },
        { x: ctrl1X, y: ctrl1Y },
        { x: ctrl2X, y: ctrl2Y },
        { x: endX, y: endY },
        t
      )
    );
  }

  ctx.save();
  ctx.strokeStyle = pct < 0.2 ? "#7a6247" : "#6f4c2d";
  ctx.lineCap = "round";

  points.forEach((pt, index) => {
    const dir = index % 2 === 0 ? -1 : 1;
    const twigAngle = angle + dir * 0.75;
    const twigX = pt.x + Math.cos(twigAngle) * twigLength * 0.55;
    const twigY = pt.y + Math.sin(twigAngle) * twigLength * 0.55;

    ctx.lineWidth = 1.6 * scale;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(twigX, twigY);
    ctx.stroke();

    const leafDensity = Math.max(1, Math.floor(1 + pct * 2.2));

    for (let k = 0; k < leafDensity; k++) {
      const t = k / Math.max(1, leafDensity - 1);
      const leafX = lerp(pt.x, twigX, 0.45 + t * 0.42);
      const leafY = lerp(pt.y, twigY, 0.45 + t * 0.42);

      drawLeaf(
        ctx,
        leafX,
        leafY,
        6.2 * scale + pct * 4.2 * scale,
        twigAngle + (k % 2 === 0 ? 0.28 : -0.28),
        isActive,
        boost,
        pct
      );
    }
  });

  const tipLeafCount = Math.max(1, Math.round(2 + pct * 8));

  for (let i = 0; i < tipLeafCount; i++) {
    const spreadX = 16 * scale + pct * 14 * scale;
    const spreadY = 12 * scale + pct * 10 * scale;
    const leafAngle = (Math.PI * 2 * i) / tipLeafCount;

    const rx = endX + Math.cos(leafAngle) * spreadX * 0.52;
    const ry = endY + Math.sin(leafAngle) * spreadY * 0.68;

    drawLeaf(
      ctx,
      rx,
      ry,
      6.6 * scale + pct * 4.4 * scale,
      leafAngle + angle * 0.22,
      isActive,
      boost,
      pct
    );
  }

  ctx.restore();
}

function drawSeedsAndBuds(ctx, geometry, scale) {
  const { endX, endY, pct, side } = geometry;

  if (pct < 0.55) return;

  const budCount = Math.max(2, Math.round(3 + pct * 2));

  for (let i = 0; i < budCount; i++) {
    const dir = side < 0 ? -1 : side > 0 ? 1 : (i % 2 === 0 ? -1 : 1);
    const angle = (dir < 0 ? -2.2 : -0.95) + i * 0.24 * dir;
    const dist = 7 * scale + i * 5 * scale;

    const x = endX + Math.cos(angle) * dist;
    const y = endY + Math.sin(angle) * dist;

    ctx.save();

    ctx.strokeStyle = "rgba(92,63,34,0.55)";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillStyle = i % 2 === 0 ? "#b48748" : "#9f6c38";
    ctx.beginPath();
    ctx.ellipse(x, y, 2.6 * scale, 4.0 * scale, angle, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawCanopyGlow(ctx, centerX, baseY, width) {
  const grad = ctx.createRadialGradient(centerX, baseY - 165, 24, centerX, baseY - 165, 130);
  grad.addColorStop(0, "rgba(124,195,110,0.10)");
  grad.addColorStop(0.6, "rgba(124,195,110,0.05)");
  grad.addColorStop(1, "rgba(124,195,110,0)");

  ctx.beginPath();
  ctx.arc(centerX, baseY - 165, 130, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawBackgroundLeafHints(ctx, centerX, baseY, width) {
  const scale = width / 480;

  const clusters = [
    { x: centerX - 86 * scale, y: baseY - 165 * scale, r: 22 * scale },
    { x: centerX - 40 * scale, y: baseY - 190 * scale, r: 26 * scale },
    { x: centerX + 40 * scale, y: baseY - 190 * scale, r: 26 * scale },
    { x: centerX + 86 * scale, y: baseY - 165 * scale, r: 22 * scale },
  ];

  ctx.save();
  clusters.forEach(cluster => {
    const grad = ctx.createRadialGradient(cluster.x, cluster.y, 0, cluster.x, cluster.y, cluster.r);
    grad.addColorStop(0, "rgba(116,184,97,0.13)");
    grad.addColorStop(1, "rgba(116,184,97,0)");
    ctx.beginPath();
    ctx.arc(cluster.x, cluster.y, cluster.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  });
  ctx.restore();
}

function drawActiveGlow(ctx, geometry, boost, scale) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(geometry.endX, geometry.endY, 10 * scale + boost * 8 * scale, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(138,226,117,${0.12 + boost * 0.18})`;
  ctx.fill();
  ctx.restore();
}

export function getBranchTipPosition(branchId, scoreArray = [], width = 480, height = 352) {
  const index = getBranchIndex(branchId);
  const centerX = width / 2;
  const baseY = height - 4;
  const score = scoreArray[index] ?? 0;

  const geometry = getBranchGeometry(index, score, centerX, baseY, width);

  return {
    x: geometry.endX,
    y: geometry.endY,
  };
}

export function drawTree(
  ctx,
  centerX,
  baseY,
  width,
  liveArr = [],
  tick = 0,
  activeCat = -1,
  boost = 0
) {
  const scale = width / 480;

  drawCanopyGlow(ctx, centerX, baseY, width);
  drawBackgroundLeafHints(ctx, centerX, baseY, width);
  drawGround(ctx, centerX, baseY, width);
  drawRoots(ctx, centerX, baseY, width);
  drawTrunk(ctx, centerX, baseY, width);
  drawBarkVeins(ctx, centerX, baseY, width);

  for (let i = 0; i < DEFAULT_BRANCH_COUNT; i++) {
    const score = liveArr[i] ?? 0;
    const geometry = getBranchGeometry(i, score, centerX, baseY, width);
    const isActive = i === activeCat;

    drawBranchStroke(ctx, geometry, isActive, boost, scale);
    drawTwigsAndLeaves(ctx, geometry, isActive, boost, scale);
    drawSeedsAndBuds(ctx, geometry, scale);

    if (isActive) {
      drawActiveGlow(ctx, geometry, boost, scale);
    }
  }

  ctx.save();
  for (let i = 0; i < 5; i++) {
    const t = tick * 0.0014 + i * 1.1;
    const x = centerX + Math.sin(t * 0.95) * (40 + i * 12) + (i - 2) * 8;
    const y = baseY - 170 + Math.cos(t * 1.25) * 10 + i * 7;

    drawLeaf(ctx, x, y, (4 + (i % 3)) * scale, Math.sin(t) * 0.4, false, 0, 0.7);
  }
  ctx.restore();
}

export function drawWateringCan(ctx, x, y, tilt = 0, isPouring = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  const bodyGrad = ctx.createLinearGradient(-22, -14, 22, 18);
  bodyGrad.addColorStop(0, "#d7ded2");
  bodyGrad.addColorStop(0.55, "#b8c1b3");
  bodyGrad.addColorStop(1, "#8f9888");

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-20, -8);
  ctx.quadraticCurveTo(-22, -18, -10, -18);
  ctx.lineTo(14, -18);
  ctx.quadraticCurveTo(26, -18, 26, -6);
  ctx.lineTo(26, 12);
  ctx.quadraticCurveTo(26, 20, 16, 20);
  ctx.lineTo(-10, 20);
  ctx.quadraticCurveTo(-22, 20, -22, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#edf2e8";
  ctx.beginPath();
  ctx.ellipse(2, -18, 13, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#89927f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-23, 1, 12, Math.PI / 2, (Math.PI * 3) / 2, true);
  ctx.stroke();

  ctx.strokeStyle = "#9aa493";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(20, -4);
  ctx.quadraticCurveTo(36, -10, 42, -4);
  ctx.lineTo(50, 2);
  ctx.stroke();

  ctx.fillStyle = "#808a7a";
  ctx.beginPath();
  ctx.arc(52, 3, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-12, -10);
  ctx.quadraticCurveTo(0, -14, 16, -10);
  ctx.stroke();

  if (isPouring) {
    ctx.strokeStyle = "rgba(145,205,255,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(52, 3);
    ctx.quadraticCurveTo(60, 16, 62, 28);
    ctx.stroke();

    ctx.strokeStyle = "rgba(190,230,255,0.7)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(54, 4);
    ctx.quadraticCurveTo(62, 17, 66, 31);
    ctx.stroke();
  }

  ctx.restore();
}