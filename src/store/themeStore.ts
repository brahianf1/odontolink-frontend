import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_VARIANT_ID,
  isValidVariantId,
} from '../theme/variants';
import {
  DEFAULT_FONT_PAIR_ID,
  isValidFontPairId,
} from '../theme/fonts';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  themeVariant: string;
  fontPair: string;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  setTheme: (mode: ThemeMode) => void;
  setThemeVariant: (id: string) => void;
  setFontPair: (id: string) => void;
}

const envString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const envMode = envString(import.meta.env.VITE_THEME_MODE) as ThemeMode | undefined;
const initialMode: ThemeMode =
  envMode === 'light' || envMode === 'dark' || envMode === 'system' ? envMode : 'light';

const envVariant = envString(import.meta.env.VITE_THEME_VARIANT);
const initialVariant: string =
  envVariant && isValidVariantId(envVariant) ? envVariant : DEFAULT_VARIANT_ID;

const envFontPair = envString(import.meta.env.VITE_FONT_PAIR);
const initialFontPair: string =
  envFontPair && isValidFontPairId(envFontPair) ? envFontPair : DEFAULT_FONT_PAIR_ID;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: initialMode,
      themeVariant: initialVariant,
      fontPair: initialFontPair,
      toggleTheme: () => {
        set((state) => ({
          mode: state.mode === 'dark' ? 'light' : 'dark',
        }));
      },
      setMode: (mode) => set({ mode }),
      // Kept for backwards-compat with older callers using setTheme().
      setTheme: (mode) => set({ mode }),
      setThemeVariant: (id) => {
        if (isValidVariantId(id)) set({ themeVariant: id });
      },
      setFontPair: (id) => {
        if (isValidFontPairId(id)) set({ fontPair: id });
      },
    }),
    {
      name: 'theme-storage',
      version: 2,
      // v1 stores have shape { mode }; bring them forward by filling defaults.
      migrate: (persistedState, _version) => {
        const persisted = (persistedState ?? {}) as Partial<ThemeState>;
        return {
          mode: persisted.mode ?? initialMode,
          themeVariant:
            persisted.themeVariant && isValidVariantId(persisted.themeVariant)
              ? persisted.themeVariant
              : initialVariant,
          fontPair:
            persisted.fontPair && isValidFontPairId(persisted.fontPair)
              ? persisted.fontPair
              : initialFontPair,
        } as ThemeState;
      },
    },
  ),
);
