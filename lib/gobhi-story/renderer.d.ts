import type { DemoDay, WaterEntry } from './journey';
type ScreenRect = { x: number; y: number; width: number; height: number };
export interface StoryFrame {
  ready: boolean;
  scene: number;
  progress: number;
  screen: string;
  demo: DemoDay;
  waterDisplay: number;
  waterPreview: number;
  waterEntry: WaterEntry;
  phoneTransitioning: boolean;
  historyProgress: number;
  mealProgress: number;
  workoutProgress: number;
  rewardPhase: 'idle' | 'spinning' | 'won';
  wheelAngle: number;
  coinRotation: number;
  navRects: (ScreenRect & { tab: string })[];
  actionRect: ScreenRect | null;
  waterRowRect: ScreenRect | null;
  waterAmountRects: (ScreenRect & { amount: number })[];
}
export interface StoryRenderer {
  readonly state: { ready: boolean };
  setProgress(progress: number, still?: boolean): void;
  navigate(progress: number): void;
  act(name: string, value?: string | number): string;
  resetDemo(): void;
  dispose(): void;
}
export function createStoryRenderer(canvas: HTMLCanvasElement, root: HTMLElement): StoryRenderer | null;
