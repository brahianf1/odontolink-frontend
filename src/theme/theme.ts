import { useEffect, useMemo, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { createAppTheme } from './createAppTheme';
import type { Mode, ThemeVariant } from './variants/_types';
import {
  customThemeDtoToVariant,
  customThemeListToVariants,
} from './variants';
import { modeFromApi } from '../services/api/appearanceApi';
import { isValidFontPairId } from './fonts';
import { isValidVariantId } from './variants';

export type { ThemeVariant, ThemeVariantColors, FitScore, Tier } from './variants/_types';
export {
  themeVariants,
  themeVariantList,
  officialVariants,
  experimentalVariants,
  recommendedVariants,
  getVariant,
  resolveVariant,
  isValidVariantId,
  DEFAULT_VARIANT_ID,
} from './variants';
export type { FontPair } from './fonts';
export {
  fontPairs,
  fontPairList,
  getFontPair,
  isValidFontPairId,
  DEFAULT_FONT_PAIR_ID,
} from './fonts';

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * Hook that builds the active MUI Theme from the themeStore (variant + mode +
 * fontPair) and the site appearance config fetched from the backend.
 *
 * Resolution policy:
 *
 * - The user is admin → the local LS values (themeVariant, fontPair) win.
 *   That's how the admin previews themes without affecting other users.
 * - The user is not admin → ignore LS variant/fontPair entirely and use the
 *   site config from the backend (lock-institutional model). This honours
 *   the "Lock institucional" decision from the appearance planning.
 * - In both cases, `mode` (light/dark/system) is per-user via LS.
 *
 * Custom themes are resolved through a runtime list that merges the active
 * custom theme embedded in `siteConfig.activeCustomTheme` (always present
 * for any user when the institutional theme is custom) with the admin-only
 * full custom themes catalog.
 */
export const useAppTheme = () => {
  const mode = useThemeStore((s) => s.mode);
  const themeVariant = useThemeStore((s) => s.themeVariant);
  const fontPair = useThemeStore((s) => s.fontPair);
  const siteConfig = useThemeStore((s) => s.siteConfig);
  const customThemes = useThemeStore((s) => s.customThemes);
  // Backend stores roles with the Spring Security `ROLE_` prefix (matches
  // the pattern used by ProtectedRoute and Sidebar). Strip before comparing.
  const isAdmin = useAuthStore(
    (s) => s.user?.role?.replace('ROLE_', '') === 'ADMIN',
  );

  const [systemDark, setSystemDark] = useState<boolean>(prefersDark);
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  // Effective mode: 'system' falls back to OS preference.
  const effectiveMode: Mode =
    mode === 'system'
      ? systemDark
        ? 'dark'
        : 'light'
      : mode;

  // Effective variant and font pair — admins can preview locally, everyone
  // else gets what the site config says.
  const siteVariantId = siteConfig?.themeVariantId;
  const siteFontPairId = siteConfig?.fontPairId;

  const effectiveVariantId = isAdmin
    ? themeVariant
    : siteVariantId && (siteVariantId.startsWith('custom-') || isValidVariantId(siteVariantId))
      ? siteVariantId
      : themeVariant;

  const effectiveFontPairId = isAdmin
    ? fontPair
    : siteFontPairId && isValidFontPairId(siteFontPairId)
      ? siteFontPairId
      : fontPair;

  // Build the runtime list of custom variants for createAppTheme to resolve
  // against. Dedupe by id (slug) — activeCustomTheme is often also in the
  // admin's customThemes list.
  const runtimeCustomVariants = useMemo<ThemeVariant[]>(() => {
    const map = new Map<string, ThemeVariant>();
    if (siteConfig?.activeCustomTheme) {
      const v = customThemeDtoToVariant(siteConfig.activeCustomTheme);
      map.set(v.id, v);
    }
    for (const v of customThemeListToVariants(customThemes)) {
      if (!map.has(v.id)) map.set(v.id, v);
    }
    return Array.from(map.values());
  }, [siteConfig?.activeCustomTheme, customThemes]);

  return useMemo(
    () => createAppTheme(effectiveVariantId, effectiveMode, effectiveFontPairId, runtimeCustomVariants),
    [effectiveVariantId, effectiveMode, effectiveFontPairId, runtimeCustomVariants],
  );
};

/**
 * Helper: returns the *default* mode for first-time visitors based on the
 * site config (`SYSTEM` from the server resolves to OS preference). Used at
 * bootstrap if the user has not stored a `mode` preference yet.
 */
export const resolveDefaultMode = (apiMode: string | undefined): Mode => {
  if (!apiMode) return 'light';
  const lower = modeFromApi(apiMode as 'LIGHT' | 'DARK' | 'SYSTEM');
  if (lower === 'system') {
    return prefersDark() ? 'dark' : 'light';
  }
  return lower;
};
