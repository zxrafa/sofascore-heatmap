import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, BrushMode, PitchSide } from '../types';
import { createGradientTexture, DEFAULT_GRADIENT } from '../utils/heatmapEngine';
import { drawPitch } from '../utils/pitchDrawer';

interface PitchCanvasProps {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  brushSize: number;
  brushIntensity: number;
  brushMode: BrushMode;
  opacity: number;
  smoothing: number;
  attackDirection: PitchSide;
  onHistorySave: () => void;
}

const PitchCanvas: React.FC<PitchCanvasProps> = ({
  points,
  setPoints,
  brushSize,
  brushIntensity,
  brushMode,
  opacity,
  smoothing,
  attackDirection,
  onHistorySave
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [gradientMap, setGradientMap] = useState<Uint8ClampedArray | null>(null);

  // Initialize helper canvas and gradient
  useEffect(() => {
    tempCanvasRef.current = document.createElement('canvas');
    const map = createGradientTexture(DEFAULT_GRADIENT);
    setGradientMap(map);
  }, []);

  // Responsive Canvas Sizing
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !tempCanvasRef.current) return;
      
      const { clientWidth } = containerRef.current;
      // Fixed aspect ratio ~1.5 (105x68)
      const height = clientWidth / 1.5;

      canvasRef.current.width = clientWidth;
      canvasRef.current.height = height;
      tempCanvasRef.current.width = clientWidth;
      tempCanvasRef.current.height = height;
      
      render();
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef.current]);

  // Main Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    if (!canvas || !tempCanvas || !gradientMap) return;

    const ctx = canvas.getContext('2d');
    const tempCtx = tempCanvas.getContext('2d');
    if (!ctx || !tempCtx) return;

    // 1. Draw Pitch
    drawPitch(ctx, canvas.width, canvas.height);

    // 2. Draw Heatmap to Temp Canvas (Gray scale)
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    if (points.length === 0) {
      // Draw arrow if no points (or even if points exist, drawn on top later)
      drawAttackArrow(ctx, canvas.width, canvas.height);
      return; 
    }

    points.forEach(point => {
      tempCtx.beginPath();
      const alpha = Math.min(Math.max(point.intensity, 0), 1);
      
      // Use standard canvas radial gradient for "metaball" look
      const gradient = tempCtx.createRadialGradient(
        point.x * canvas.width, 
        point.y * canvas.height, 
        0, 
        point.x * canvas.width, 
        point.y * canvas.height, 
        point.radius * canvas.width * smoothing // Apply smoothing factor
      );

      gradient.addColorStop(0, `rgba(0,0,0,${alpha})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      tempCtx.fillStyle = gradient;
      // Use lighten to accumulate density realistically
      tempCtx.globalCompositeOperation = 'lighten'; 
      tempCtx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        point.radius * canvas.width * smoothing,
        0,
        Math.PI * 2
      );
      tempCtx.fill();
    });

    // 3. Colorize Heatmap
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    const len = pixels.length;

    for (let i = 3; i < len; i += 4) {
      const alpha = pixels[i]; // Get alpha (density)
      if (alpha > 0) {
        // Map alpha (0-255) to gradient color
        const offset = alpha * 4;
        pixels[i - 3] = gradientMap[offset];     // R
        pixels[i - 2] = gradientMap[offset + 1]; // G
        pixels[i - 1] = gradientMap[offset + 2]; // B
        // Apply global opacity control
        pixels[i] = Math.floor(alpha * opacity); 
      }
    }

    // 4. Put Colorized Heatmap onto Main Canvas
    // Use a second temp canvas or putImageData directly? 
    // putImageData overwrites. We need to draw ON TOP of the pitch.
    // So we putImageData back to tempCanvas, then drawImage tempCanvas to ctx.
    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tempCanvas, 0, 0);

    // 5. Draw Attack Arrow Overlay
    drawAttackArrow(ctx, canvas.width, canvas.height);

  }, [points, opacity, smoothing, gradientMap, attackDirection]);

  // Draw arrow helper
  const drawAttackArrow = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    
    const arrowY = h * 0.95;
    const arrowLen = w * 0.2;
    const arrowXStart = (w - arrowLen) / 2;
    const arrowXEnd = arrowXStart + arrowLen;

    ctx.beginPath();
    if (attackDirection === PitchSide.LEFT_TO_RIGHT) {
      ctx.moveTo(arrowXStart, arrowY);
      ctx.lineTo(arrowXEnd, arrowY);
      ctx.lineTo(arrowXEnd - 10, arrowY - 10);
      ctx.moveTo(arrowXEnd, arrowY);
      ctx.lineTo(arrowXEnd - 10, arrowY + 10);
    } else {
      ctx.moveTo(arrowXEnd, arrowY);
      ctx.lineTo(arrowXStart, arrowY);
      ctx.lineTo(arrowXStart + 10, arrowY - 10);
      ctx.moveTo(arrowXStart, arrowY);
      ctx.lineTo(arrowXStart + 10, arrowY + 10);
    }
    ctx.stroke();
    
    // Text
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('ATTACK', w / 2, arrowY - 10);
    
    ctx.restore();
  };

  useEffect(() => {
    requestAnimationFrame(render);
  }, [render]);

  // Interaction Handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    onHistorySave(); // Save state before starting a new stroke
    addPoint(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    addPoint(e);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const addPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    if (brushMode === BrushMode.DRAW) {
      setPoints(prev => [...prev, {
        x: coords.x,
        y: coords.y,
        intensity: brushIntensity,
        radius: brushSize
      }]);
    } else {
      // Eraser: Remove points within radius
      // Optimized: Filter out points that are close to the cursor
      const eraseRadius = brushSize * 1.5; // Eraser slightly larger feel
      setPoints(prev => prev.filter(p => {
        const dx = p.x - coords.x;
        const dy = p.y - coords.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        return dist > eraseRadius;
      }));
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full shadow-2xl rounded-lg overflow-hidden border border-slate-700 bg-slate-900"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="block cursor-crosshair touch-none select-none"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default PitchCanvas;