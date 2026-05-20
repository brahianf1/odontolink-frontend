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

  // Cached server state. Persisted to localStorage so that returning users
  // hydrate the correct theme synchronously on app boot (no flash of the
  // wrong theme). Refreshed in the background on every mount via
  // useSiteAppearance + useCustomThemes.
  siteConfig: SiteAppearanceResponseDTO | null;
  customThemes: CustomThemeSummaryDTO[];

  // NOT persisted — true only after the current session's bootstrap fetch
  // resolved successfully (regardless of whether the cache had data).
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
      version: 4,
      // Persist per-user preferences + the cached server snapshot. Returning
      // users get the correct theme on first paint (the cache is hydrated
      // synchronously before React renders). `siteConfigLoaded` is left out
      // on purpose — every session must do its own bootstrap fetch.
      partialize: (state) => ({
        mode: state.mode,
        themeVariant: state.themeVariant,
        fontPair: state.fontPair,
        siteConfig: state.siteConfig,
        customThemes: state.customThemes,
      }),
      // v1 → v2: { mode } → { mode, themeVariant, fontPair }
      // v2 → v3: same shape; revalidated custom-* slugs against the registry
      // v3 → v4: additive — siteConfig / customThemes cache slots
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
          siteConfig: persisted.siteConfig ?? null,
          customThemes: persisted.customThemes ?? [],
        } as ThemeState;
      },
    },
  ),
);
