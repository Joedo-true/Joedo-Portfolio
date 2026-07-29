import { create } from 'zustand';

export type Section = 'hero' | 'section2';
export type Theme = 'dark' | 'light';
export type HeaderIcon = 'tesseract' | 'globe';

interface SiteState {
  /** 0–100, идёт синхронно с загрузкой ассетов (Фаза 1) */
  loadingProgress: number;
  isLoaded: boolean;
  activeSection: Section;
  /** Производное от activeSection — менять только через setSection */
  theme: Theme;
  /** Производное от activeSection — менять только через setSection */
  headerIcon: HeaderIcon;

  setLoadingProgress: (value: number) => void;
  setLoaded: (value: boolean) => void;
  /**
   * Единственная точка смены раздела. Тема и иконка хедера выводятся здесь же
   * и одним обновлением стора — ТЗ (4.2, 8.5) требует, чтобы они
   * переключались синхронно, а не двумя независимыми сетами.
   */
  setSection: (section: Section) => void;
}

const derive = (section: Section): { theme: Theme; headerIcon: HeaderIcon } =>
  section === 'section2'
    ? { theme: 'light', headerIcon: 'globe' }
    : { theme: 'dark', headerIcon: 'tesseract' };

export const useSiteStore = create<SiteState>((set) => ({
  loadingProgress: 0,
  isLoaded: false,
  activeSection: 'hero',
  ...derive('hero'),

  setLoadingProgress: (value) =>
    set({ loadingProgress: Math.min(100, Math.max(0, value)) }),
  setLoaded: (value) => set({ isLoaded: value }),
  setSection: (section) =>
    set((state) =>
      state.activeSection === section ? state : { activeSection: section, ...derive(section) },
    ),
}));
