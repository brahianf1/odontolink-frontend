export type Mode = 'light' | 'dark';
export type FitScore = 1 | 2 | 3 | 4 | 5;
export type Tier = 'official' | 'experimental';

/**
 * Full M3-shaped color token set for a single mode of a variant.
 * Extends the canonical Material 3 role set with chart palette slots
 * used by data-viz components.
 */
export interface ThemeVariantColors {
  // Brand — primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  // Brand — secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  // Brand — tertiary
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  // Semantic — error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  // Background / surface
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  // Outline / utility
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  surfaceTint: string;
  // Data viz
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

/**
 * A theme variant — coherent set of light + dark colors plus metadata.
 * Picked at runtime via VITE_THEME_VARIANT or the themeStore.
 */
export interface ThemeVariant {
  id: string;
  /** Display name, e.g. "Sky Blue" or "OdontoLink Original". */
  name: string;
  /** Long description shown in the future admin picker. */
  description: string;
  /** Short qualitative descriptor: e.g. "warm amber, traditional". */
  mood: string;
  /** Subjective 1–5 score on fit for the institutional healthcare/academic context. */
  fitScore: FitScore;
  /**
   * `official` = recommended for production use,
   * `experimental` = available but off-brand or low-contrast for the project.
   */
  tier: Tier;
  /** FontPair id that pairs best with this variant by default. */
  defaultFontPair: string;
  light: ThemeVariantColors;
  dark: ThemeVariantColors;
}
