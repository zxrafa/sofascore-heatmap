import React from 'react';
import { AppState, BrushMode, PitchSide, PresetType } from '../types';
import { 
  ArrowPathIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  PaintBrushIcon,
  XMarkIcon, // Used for eraser metaphor
  ArrowLongRightIcon,
  ArrowLongLeftIcon
} from '@heroicons/react/24/outline';

interface ControlsProps {
  state: AppState;
  updateState: (key: keyof AppState, value: any) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
  exportImage: () => void;
  applyPreset: (type: PresetType) => void;
}

const Controls: React.FC<ControlsProps> = ({
  state,
  updateState,
  undo,
  redo,
  canUndo,
  canRedo,
  clear,
  exportImage,
  applyPreset
}) => {
  return (
    <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl p-6 w-full lg:w-80 flex flex-col gap-6 shadow-xl h-fit sticky top-6">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <h2 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">Tools</h2>
        <div className="flex gap-2">
          <button 
            onClick={undo} 
            disabled={!canUndo}
            className={`p-2 rounded hover:bg-slate-700 transition ${!canUndo ? 'opacity-30 cursor-not-allowed' : 'text-slate-200'}`}
            title="Undo"
          >
            <ArrowPathIcon className="w-5 h-5 -scale-x-100" />
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo}
            className={`p-2 rounded hover:bg-slate-700 transition ${!canRedo ? 'opacity-30 cursor-not-allowed' : 'text-slate-200'}`}
            title="Redo"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-lg">
        <button
          onClick={() => updateState('brushMode', BrushMode.DRAW)}
          className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${
            state.brushMode === BrushMode.DRAW ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PaintBrushIcon className="w-4 h-4" /> Draw
        </button>
        <button
          onClick={() => updateState('brushMode', BrushMode.ERASE)}
          className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${
            state.brushMode === BrushMode.ERASE ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <XMarkIcon className="w-4 h-4" /> Erase
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {/* Radius */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Size</span>
            <span>{(state.brushSize * 1000).toFixed(0)}</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.15"
            step="0.005"
            value={state.brushSize}
            onChange={(e) => updateState('brushSize', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Intensity */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Intensity</span>
            <span>{Math.round(state.brushIntensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.5" // Max strictly controlled to allow layering
            step="0.01"
            value={state.brushIntensity}
            onChange={(e) => updateState('brushIntensity', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

         {/* Smoothing */}
         <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Smoothing (Spread)</span>
            <span>x{state.smoothing.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.5" 
            step="0.1"
            value={state.smoothing}
            onChange={(e) => updateState('smoothing', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* Presets */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Quick Presets</h3>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => applyPreset('winger_left')} className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300">Left Wing</button>
            <button onClick={() => applyPreset('winger_right')} className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300">Right Wing</button>
            <button onClick={() => applyPreset('box_to_box')} className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300">Box to Box</button>
            <button onClick={() => applyPreset('playmaker')} className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300">Playmaker</button>
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* Attack Direction */}
      <div>
         <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Attack Direction</h3>
         <div className="flex items-center justify-between bg-slate-900 rounded p-2">
            <button 
                onClick={() => updateState('attackDirection', PitchSide.LEFT_TO_RIGHT)}
                className={`p-2 rounded ${state.attackDirection === PitchSide.LEFT_TO_RIGHT ? 'bg-slate-700 text-emerald-400' : 'text-slate-500'}`}
            >
                <ArrowLongRightIcon className="w-6 h-6" />
            </button>
            <span className="text-xs text-slate-500 font-mono">VS</span>
            <button 
                onClick={() => updateState('attackDirection', PitchSide.RIGHT_TO_LEFT)}
                className={`p-2 rounded ${state.attackDirection === PitchSide.RIGHT_TO_LEFT ? 'bg-slate-700 text-emerald-400' : 'text-slate-500'}`}
            >
                <ArrowLongLeftIcon className="w-6 h-6" />
            </button>
         </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col gap-3">
        <button 
          onClick={clear}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition text-sm"
        >
          <TrashIcon className="w-4 h-4" /> Clear Pitch
        </button>
        
        <button 
          onClick={exportImage}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-emerald-900/50 transition transform active:scale-95"
        >
          <ArrowDownTrayIcon className="w-5 h-5" /> Export HD
        </button>
      </div>
    </div>
  );
};

export default Controls;