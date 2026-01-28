import React, { useState, useCallback, useRef } from 'react';
import PitchCanvas from './components/PitchCanvas';
import Controls from './components/Controls';
import { AppState, Point, BrushMode, PitchSide, PresetType } from './types';
import { drawPitch } from './utils/pitchDrawer';

const App: React.FC = () => {
  // Application State
  const [state, setState] = useState<AppState>({
    points: [],
    brushSize: 0.05,
    brushIntensity: 0.20,
    brushMode: BrushMode.DRAW,
    opacity: 0.85,
    smoothing: 1.5,
    attackDirection: PitchSide.LEFT_TO_RIGHT,
  });

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<Point[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const updateState = (key: keyof AppState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const setPoints = (pointsAction: React.SetStateAction<Point[]>) => {
    setState(prev => {
        const newPoints = typeof pointsAction === 'function' ? pointsAction(prev.points) : pointsAction;
        return { ...prev, points: newPoints };
    });
  };

  // Undo/Redo Logic
  const saveToHistory = useCallback(() => {
    const currentPoints = [...state.points];
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentPoints);
      return newHistory.slice(-20); // Limit to last 20 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [state.points, historyIndex]);

  const undo = () => {
    if (historyIndex >= 0) {
      const previousPoints = history[historyIndex];
      setPoints(previousPoints);
      setHistoryIndex(prev => prev - 1);
    } else if (historyIndex === -1 && state.points.length > 0) {
       // Special case: Clear initial state
       setPoints([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextPoints = history[historyIndex + 1];
      setPoints(nextPoints);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const clear = () => {
    saveToHistory();
    setPoints([]);
  };

  // Presets Logic
  const applyPreset = (type: PresetType) => {
    saveToHistory();
    const newPoints: Point[] = [];
    const count = 50; // number of dots
    
    const addCluster = (cx: number, cy: number, spreadX: number, spreadY: number) => {
      for(let i=0; i<count; i++) {
        // Box Muller transform for normal distribution
        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        
        // Randomize intensity slightly
        const intensity = 0.15 + Math.random() * 0.1;
        
        newPoints.push({
          x: Math.max(0, Math.min(1, cx + (Math.random() - 0.5) * spreadX)),
          y: Math.max(0, Math.min(1, cy + (Math.random() - 0.5) * spreadY)),
          intensity: intensity,
          radius: 0.04 + Math.random() * 0.02
        });
      }
    };

    if (type === 'winger_left') {
        const isLTR = state.attackDirection === PitchSide.LEFT_TO_RIGHT;
        // Upper part of screen if LTR
        const yBase = 0.15; 
        const xStart = isLTR ? 0.4 : 0.6;
        const xEnd = isLTR ? 0.9 : 0.1;
        
        // Add a streak
        for(let i=0; i<4; i++) {
            const progress = i/3;
            addCluster(xStart + (xEnd - xStart) * progress, yBase + (Math.random() * 0.1), 0.1, 0.15);
        }
    } else if (type === 'box_to_box') {
        addCluster(0.5, 0.5, 0.6, 0.6);
    } else if (type === 'winger_right') {
         // Bottom part
         const yBase = 0.85;
         const isLTR = state.attackDirection === PitchSide.LEFT_TO_RIGHT;
         const xStart = isLTR ? 0.4 : 0.6;
         const xEnd = isLTR ? 0.9 : 0.1;
         for(let i=0; i<4; i++) {
            const progress = i/3;
            addCluster(xStart + (xEnd - xStart) * progress, yBase - (Math.random() * 0.1), 0.1, 0.15);
        }
    } else if (type === 'playmaker') {
        addCluster(0.5, 0.5, 0.3, 0.3);
        const isLTR = state.attackDirection === PitchSide.LEFT_TO_RIGHT;
        addCluster(isLTR ? 0.7 : 0.3, 0.5, 0.2, 0.4);
    }

    setPoints(prev => [...prev, ...newPoints]);
  };

  // Export Logic
  const exportImage = () => {
    // We create a fresh canvas to export at high resolution (1920x1080 approx)
    const exportCanvas = document.createElement('canvas');
    const width = 1920;
    const height = 1280; // 3:2 aspect for social media usually works, or keep 1.5 ratio
    exportCanvas.width = width;
    exportCanvas.height = height;
    
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Pitch
    drawPitch(ctx, width, height, true);

    // 2. Draw Heatmap (Simplified for export - recreating the logic from component)
    // For perfect fidelity, we'd reuse the component's generation logic, 
    // but here we just re-render points larger.
    
    // Temp canvas for heatmap
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
        state.points.forEach(point => {
            tempCtx.beginPath();
            const alpha = Math.min(Math.max(point.intensity, 0), 1);
            const gradient = tempCtx.createRadialGradient(
                point.x * width, point.y * height, 0,
                point.x * width, point.y * height, 
                point.radius * width * state.smoothing // Apply smoothing
            );
            gradient.addColorStop(0, `rgba(0,0,0,${alpha})`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            tempCtx.fillStyle = gradient;
            tempCtx.globalCompositeOperation = 'lighten';
            tempCtx.arc(point.x * width, point.y * height, point.radius * width * state.smoothing, 0, Math.PI * 2);
            tempCtx.fill();
        });

        // Colorize (using the same logic as component essentially)
        // Note: For simplicity in this non-async export, we are just overlaying the black gradient 
        // with a color filter or we need the gradient map.
        // Let's assume the component render is sufficient for screen, but for export we want the colors.
        
        // Re-generate gradient map locally
        const gradCanvas = document.createElement('canvas');
        gradCanvas.width = 1; gradCanvas.height = 256;
        const gCtx = gradCanvas.getContext('2d');
        if(gCtx) {
            const gr = gCtx.createLinearGradient(0,0,0,256);
            // Same gradient as engine
             gr.addColorStop(0.0, 'rgba(0,0,255,0)');
             gr.addColorStop(0.2, 'rgba(0,0,255,0)');
             gr.addColorStop(0.4, 'rgb(0, 255, 0)');
             gr.addColorStop(0.6, 'rgb(255, 255, 0)');
             gr.addColorStop(0.8, 'rgb(255, 128, 0)');
             gr.addColorStop(1.0, 'rgb(255, 0, 0)');
            gCtx.fillStyle = gr;
            gCtx.fillRect(0,0,1,256);
            const gradData = gCtx.getImageData(0,0,1,256).data;
            const mapData = tempCtx.getImageData(0,0,width,height);
            const data = mapData.data;
            for(let i=3; i<data.length; i+=4) {
                const a = data[i];
                if(a > 0) {
                    const offset = a * 4;
                    data[i-3] = gradData[offset];
                    data[i-2] = gradData[offset+1];
                    data[i-1] = gradData[offset+2];
                    data[i] = Math.floor(a * state.opacity);
                }
            }
            tempCtx.putImageData(mapData, 0, 0);
        }
        
        ctx.drawImage(tempCanvas, 0, 0);
    }
    
    // Branding removed per user request

    const link = document.createElement('a');
    link.download = `heatmap-export-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ProMap <span className="font-light text-emerald-500">Analytics</span>
            </h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Professional Heatmap Generator v1.0
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-start gap-4">
           <div className="w-full bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
             <PitchCanvas 
                points={state.points}
                setPoints={setPoints}
                brushSize={state.brushSize}
                brushIntensity={state.brushIntensity}
                brushMode={state.brushMode}
                opacity={state.opacity}
                smoothing={state.smoothing}
                attackDirection={state.attackDirection}
                onHistorySave={saveToHistory}
             />
           </div>
           <p className="text-slate-500 text-sm text-center">
             <span className="text-emerald-500 font-medium">Tip:</span> Click and drag to draw. Use the controls to adjust intensity or switch to eraser.
           </p>
        </div>

        {/* Sidebar */}
        <div className="relative z-10">
          <Controls 
            state={state}
            updateState={updateState}
            undo={undo}
            redo={redo}
            canUndo={historyIndex >= 0 || (historyIndex === -1 && state.points.length > 0)}
            canRedo={historyIndex < history.length - 1}
            clear={clear}
            exportImage={exportImage}
            applyPreset={applyPreset}
          />
        </div>
      </main>
    </div>
  );
};

export default App;