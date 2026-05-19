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
import type {
  CustomThemeSummaryDTO,
  SiteAppearanceResponseDTO,
} from '../features/admin/appearance/types/appearance';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  // Persisted, per-browser preferences
  mode: ThemeMode;
  themeVariant: string;
  fontPair: string;

  // Runtime — fetched from the backend, NOT persisted to localStorage
  siteConfig: SiteAppearanceResponseDTO | null;
  customThemes: CustomThemeSummaryDTO[];
  siteConfigLoaded: boolean;

  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  setTheme: (mode: ThemeMode) => void;
  setThemeVariant: (id: string) => void;
  setFontPair: (id: string) => void;
  setSiteConfig: (config: SiteAppearanceResponseDTO | null) => void;
  setCustomThemes: (themes: CustomThemeSummaryDTO[]) => void;
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
      siteConfig: null,
      customThemes: [],
      siteConfigLoaded: false,
      toggleTheme: () => {
        set((state) => ({
          mode: state.mode === 'dark' ? 'light' : 'dark',
        }));
      },
      setMode: (mode) => set({ mode }),
      setTheme: (mode) => set({ mode }),
      setThemeVariant: (id) => {
        // Custom themes (slugs starting with `custom-`) are always valid from
        // the perspective of the store; their existence is validated by the
        // theme resolver against the in-memory customThemes list.
        if (id.startsWith('custom-') || isValidVariantId(id)) {
          set({ themeVariant: id });
        }
      },
      setFontPair: (id) => {
        if (isValidFontPairId(id)) set({ fontPair: id });
      },
      setSiteConfig: (config) => set({ siteConfig: config, siteConfigLoaded: true }),
      setCustomThemes: (themes) => set({ customThemes: themes }),
    }),
    {
      name: 'theme-storage',
      version: 3,
      // Persist only per-user preferences. siteConfig / customThemes are
      // runtime state hydrated from the backend on every app boot.
      partialize: (state) => ({
        mode: state.mode,
        themeVariant: state.themeVariant,
        fontPair: state.fontPair,
      }),
      // v1 → v2: { mode } → { mode, themeVariant, fontPair }.
      // v2 → v3: no schema change; bumped so admins who have stale custom-*
      // ids in LS get them re-checked against the in-memory registry.
      migrate: (persistedState, _version) => {
        const persisted = (persistedState ?? {}) as Partial<ThemeState>;
        const variant = persisted.themeVariant;
        const fontPair = persisted.fontPair;
        return {
          mode: persisted.mode ?? initialMode,
          themeVariant:
            variant && (variant.startsWith('custom-') || isValidVariantId(variant))
              ? variant
              : initialVariant,
          fontPair: fontPair && isValidFontPairId(fontPair) ? fontPair : initialFontPair,
        } as ThemeState;
      },
    },
  ),
);
