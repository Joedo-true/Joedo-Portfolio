import { create } from 'zustand';
import type { PlanetData } from '../planet/buildPlanet';

/**
 * Состояние сайта — четыре фазы и прогресс сборки.
 *
 *   loading → entry → idle ⇄ zoomed
 *
 * `entry` — та самая «резкая остановка»: полосы тормозят в точки, планета
 * выезжает на свой размер. Живёт ровно `config.entry.durationMs`.
 */

export type Phase = 'loading' | 'entry' | 'idle' | 'zoomed';

interface AppState {
  phase: Phase;
  progress: number;
  planet: PlanetData | null;
  setPhase: (phase: Phase) => void;
  setProgress: (progress: number) => void;
  setPlanet: (planet: PlanetData) => void;
}

export const useAppStore = create<AppState>((set) => ({
  phase: 'loading',
  progress: 0,
  planet: null,
  setPhase: (phase) => set({ phase }),
  setProgress: (progress) => set({ progress }),
  setPlanet: (planet) => set({ planet }),
}));
