import { useEffect, useMemo, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { createAppTheme } from './createAppTheme';
import type { Mode } from './variants/_types';

export type { ThemeVariant, ThemeVariantColors, FitScore, Tier } from './variants/_types';
export {
  themeVariants,
  themeVariantList,
  officialVariants,
  experimentalVariants,
  recommendedVariants,
  getVariant,
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
 * fontPair). Re-runs only when any of those three change. If `mode` is
 * 'system' it subscribes to `prefers-color-scheme` so the theme stays in
 * sync with OS changes.
 */
export const useAppTheme = () => {
  const mode = useThemeStore((s) => s.mode);
  const themeVariant = useThemeStore((s) => s.themeVariant);
  const fontPair = useThemeStore((s) => s.fontPair);

  const [systemDark, setSystemDark] = useState<boolean>(prefersDark);
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const effectiveMode: Mode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  return useMemo(
    () => createAppTheme(themeVariant, effectiveMode, fontPair),
    [themeVariant, effectiveMode, fontPair],
  );
};
