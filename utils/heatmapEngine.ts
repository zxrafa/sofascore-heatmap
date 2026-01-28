// Creates a 1px wide canvas to serve as a gradient lookup table
export const createGradientTexture = (grad: Record<number, string>) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  
  // Parse the gradient object
  Object.keys(grad).forEach((stop) => {
    gradient.addColorStop(Number(stop), grad[Number(stop)]);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, 256);

  return ctx.getImageData(0, 0, 1, 256).data;
};

// Default Heatmap Gradient (SofaScore style: Transparent -> Green -> Yellow -> Red)
export const DEFAULT_GRADIENT = {
  0.0: 'rgba(0,0,255,0)',
  0.2: 'rgba(0,0,255,0)', // Start transparent
  0.4: 'rgb(0, 255, 0)',   // Green
  0.6: 'rgb(255, 255, 0)', // Yellow
  0.8: 'rgb(255, 128, 0)', // Orange
  1.0: 'rgb(255, 0, 0)',   // Red
};