# ProMap Analytics (Sofascore Heatmap Generator)

An interactive, broadcast-style football tactical heatmap visualizer and generator built with React 19, TypeScript, Vite, and HTML5 Canvas.

## Status
Production Ready / Fully Functional.

## Overview
ProMap Analytics is a modern sports data visualization application that enables analysts, scouts, and enthusiasts to create realistic, broadcast-quality heatmaps inspired by platforms like Sofascore and Opta. 

Built entirely client-side, the tool renders high-resolution pitch geometry and calculates radial density gradients directly onto an HTML5 Canvas, providing instantaneous visual feedback without requiring external backend servers.

## Key Features
- **Dynamic Heatmap Engine**: Real-time multi-point radial density simulation with adjustable smoothing and opacity.
- **Interactive Pitch Canvas**: Dual brush modes (Draw / Erase) with customizable radius and intensity sliders.
- **Tactical Player Presets**: Instant loadout presets for typical football roles including Box-to-Box Midfielder, Winger, Striker, Playmaker, and Center Back.
- **Attacking Perspective Toggle**: Switch pitch attack orientation between Left-to-Right (LTR) and Right-to-Left (RTL).
- **High-Definition Export**: One-click raster export generating PNG snapshots suitable for tactical match reports and social media.

## Tech Stack
- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Tailwind CSS & Modern Dark System Palette
- **Icons**: [@heroicons/react](https://github.com/tailwindlabs/heroicons)
- **Rendering**: HTML5 Canvas 2D Context API

## Architecture
```
sofascore-heatmap/
├── components/
│   ├── PitchCanvas.tsx    # Canvas 2D render loop, event handlers & brush strokes
│   └── Controls.tsx       # Parameter controls, role presets & export actions
├── utils/
│   └── pitchDrawer.ts     # Precise football pitch vector geometry and markings
├── App.tsx                # Central state management & layout
├── types.ts               # Core domain models (Point, AppState, BrushMode, PitchSide)
└── vite.config.ts         # Vite bundler configuration
```

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/zxrafa/sofascore-heatmap.git
   cd sofascore-heatmap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
   The compiled static assets will be output to the `dist/` folder.

## Verification & Quality
The application adheres strictly to TypeScript interfaces and builds cleanly without warnings:
```bash
npm run build
# vite v6.x building for production...
# built in <5s
```

## License
MIT License. Free for educational and personal analysis use.
