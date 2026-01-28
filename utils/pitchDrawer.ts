export const drawPitch = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isExport: boolean = false
) => {
  // Colors
  const GRASS_DARK = '#365e34'; // darker green
  const GRASS_LIGHT = '#3e6b3b'; // lighter green
  const LINE_COLOR = 'rgba(255, 255, 255, 0.9)';

  // Dimensions (Based on standard 105m x 68m proportions)
  const xMargin = width * 0.05;
  const yMargin = height * 0.05;
  const pitchWidth = width - xMargin * 2;
  const pitchHeight = height - yMargin * 2;
  const lineWidth = isExport ? 3 : 2;

  // 1. Draw Grass Pattern (Stripes)
  ctx.fillStyle = GRASS_DARK;
  ctx.fillRect(0, 0, width, height);

  const numStripes = 13; // Typical number of mower lines
  const stripeWidth = pitchWidth / numStripes;

  ctx.fillStyle = GRASS_LIGHT;
  for (let i = 0; i < numStripes; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(xMargin + i * stripeWidth, yMargin, stripeWidth, pitchHeight);
    }
  }

  // 2. Lines Setup
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  // Outer Boundary
  ctx.strokeRect(xMargin, yMargin, pitchWidth, pitchHeight);

  // Center Line
  ctx.moveTo(width / 2, yMargin);
  ctx.lineTo(width / 2, height - yMargin);
  ctx.stroke();

  // Center Circle
  ctx.beginPath();
  const centerRadius = pitchHeight * 0.14; // Approx 9.15m scaled
  ctx.arc(width / 2, height / 2, centerRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Center Spot
  ctx.fillStyle = LINE_COLOR;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, isExport ? 4 : 3, 0, Math.PI * 2);
  ctx.fill();

  // Helper for areas
  const drawArea = (isLeft: boolean) => {
    const xBase = isLeft ? xMargin : width - xMargin;
    const dir = isLeft ? 1 : -1;

    // Penalty Area (16.5m)
    const penAreaHeight = pitchHeight * 0.6;
    const penAreaWidth = pitchWidth * 0.16;
    const penAreaY = (height - penAreaHeight) / 2;
    
    ctx.strokeRect(
      isLeft ? xBase : xBase - penAreaWidth,
      penAreaY,
      penAreaWidth,
      penAreaHeight
    );

    // Goal Area (5.5m)
    const goalAreaHeight = pitchHeight * 0.27;
    const goalAreaWidth = pitchWidth * 0.055;
    const goalAreaY = (height - goalAreaHeight) / 2;

    ctx.strokeRect(
      isLeft ? xBase : xBase - goalAreaWidth,
      goalAreaY,
      goalAreaWidth,
      goalAreaHeight
    );

    // Penalty Spot (11m)
    const spotDist = pitchWidth * 0.11;
    ctx.beginPath();
    ctx.arc(xBase + (spotDist * dir), height / 2, isExport ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();

    // Penalty Arc
    ctx.beginPath();
    ctx.arc(
      xBase + (spotDist * dir),
      height / 2,
      centerRadius,
      isLeft ? -0.65 : Math.PI - 0.65,
      isLeft ? 0.65 : Math.PI + 0.65
    );
    ctx.stroke();
    
    // Corner Arcs
    const cornerRadius = pitchWidth * 0.015;
    
    // Top Corner
    ctx.beginPath();
    ctx.arc(xBase, yMargin, cornerRadius, isLeft ? 0 : Math.PI, isLeft ? Math.PI/2 : Math.PI/2, false); 
    // Simplified arc drawing for corners to ensure they stay inside
    // Actual implementation can be more precise, but this works for visual
    ctx.stroke();

    // Bottom Corner
    ctx.beginPath();
    ctx.arc(xBase, height - yMargin, cornerRadius, isLeft ? -Math.PI/2 : Math.PI, isLeft ? 0 : -Math.PI/2, false);
    ctx.stroke();
  };

  drawArea(true);
  drawArea(false);
};