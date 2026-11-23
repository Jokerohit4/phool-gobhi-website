import type { DemoDay } from './journey';
export interface StoryFrame {
  ready: boolean;
  scene: number;
  progress: number;
  screen: string;
  demo: DemoDay;
  waterDisplay: number;
  waterScrollProgress: number;
  historyProgress: number;
  mealProgress: number;
  workoutProgress: number;
  rewardPhase: 'idle' | 'spinning' | 'won';
  wheelAngle: number;
  coinRotation: number;
  navRects: { tab: string; x: number; y: number; width: number; height: number }[];
  actionRect: { x: number; y: number; width: number; height: number } | null;
}
export interface StoryRenderer {
  readonly state: { ready: boolean };
  setProgress(progress: number, still?: boolean): void;
  act(name: string, value?: string | number): string;
  resetDemo(): void;
  dispose(): void;
}
export function createStoryRenderer(canvas: HTMLCanvasElement, root: HTMLElement): StoryRenderer | null;
