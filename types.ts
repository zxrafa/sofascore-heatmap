export interface Point {
  x: number;
  y: number;
  intensity: number;
  radius: number;
}

export enum BrushMode {
  DRAW = 'DRAW',
  ERASE = 'ERASE',
}

export enum PitchSide {
  LEFT_TO_RIGHT = 'LTR',
  RIGHT_TO_LEFT = 'RTL',
}

export interface AppState {
  points: Point[];
  brushSize: number;
  brushIntensity: number;
  brushMode: BrushMode;
  opacity: number;
  smoothing: number;
  attackDirection: PitchSide;
}

export type PresetType = 'winger_left' | 'winger_right' | 'box_to_box' | 'striker' | 'defender' | 'playmaker';