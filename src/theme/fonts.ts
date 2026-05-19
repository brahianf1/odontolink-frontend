/**
 * Curated font pair registry. Each pair defines three CSS font-family
 * stacks: one for editorial display (display headlines), one for the
 * body sans, and one for monospace. The actual font files are loaded
 * eagerly via @fontsource-variable imports in src/main.tsx.
 *
 * Picking is independent of theme variant — the user (or env) can pair
 * any theme with any font pair. Each theme variant declares a
 * `defaultFontPair` that is used when no override is set.
 */

export interface FontPair {
  id: string;
  name: string;
  description: string;
  /** Font family stack used for `displayLarge` ... `headlineLarge`. */
  display: string;
  /** Font family stack used for body, label, and the rest of the type scale. */
  sans: string;
  /** Font family stack used for code / tabular data. */
  mono: string;
}

const SYSTEM_SANS = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const SYSTEM_MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export const fontPairs: Record<string, FontPair> = {
  'inter-source-jetbrains': {
    id: 'inter-source-jetbrains',
    name: 'Inter + Source Serif',
    description: 'Editorial serif headlines on a clean Inter body. Stripe / NYT vibe.',
    display: `"Source Serif 4 Variable", "Source Serif 4", "Source Serif Pro", Georgia, serif`,
    sans: `"Inter Variable", Inter, ${SYSTEM_SANS}`,
    mono: `"JetBrains Mono Variable", "JetBrains Mono", ${SYSTEM_MONO}`,
  },
  'geist-geist': {
    id: 'geist-geist',
    name: 'Geist',
    description: 'Cohesive Vercel-style minimal sans with matching mono.',
    display: `"Geist Variable", Geist, ${SYSTEM_SANS}`,
    sans: `"Geist Variable", Geist, ${SYSTEM_SANS}`,
    mono: `"Geist Mono Variable", "Geist Mono", ${SYSTEM_MONO}`,
  },
  'outfit-inter-jetbrains': {
    id: 'outfit-inter-jetbrains',
    name: 'Outfit + Inter',
    description: 'Minimal geometric display on Inter body. Notion / Cal.com energy.',
    display: `"Outfit Variable", Outfit, ${SYSTEM_SANS}`,
    sans: `"Inter Variable", Inter, ${SYSTEM_SANS}`,
    mono: `"JetBrains Mono Variable", "JetBrains Mono", ${SYSTEM_MONO}`,
  },
  'plus-jakarta-inter-jetbrains': {
    id: 'plus-jakarta-inter-jetbrains',
    name: 'Plus Jakarta + Inter',
    description: 'Distinctive Plus Jakarta Sans display on Inter body. Health-tech.',
    display: `"Plus Jakarta Sans Variable", "Plus Jakarta Sans", ${SYSTEM_SANS}`,
    sans: `"Inter Variable", Inter, ${SYSTEM_SANS}`,
    mono: `"JetBrains Mono Variable", "JetBrains Mono", ${SYSTEM_MONO}`,
  },
  'dm-sans-dm-mono': {
    id: 'dm-sans-dm-mono',
    name: 'DM Sans + DM Mono',
    description: 'Friendly geometric sans with companion mono.',
    display: `"DM Sans Variable", "DM Sans", ${SYSTEM_SANS}`,
    sans: `"DM Sans Variable", "DM Sans", ${SYSTEM_SANS}`,
    mono: `"DM Mono", ${SYSTEM_MONO}`,
  },
  'manrope-inter-jetbrains': {
    id: 'manrope-inter-jetbrains',
    name: 'Manrope + Inter',
    description: 'Soft modern Manrope display on Inter body.',
    display: `"Manrope Variable", Manrope, ${SYSTEM_SANS}`,
    sans: `"Inter Variable", Inter, ${SYSTEM_SANS}`,
    mono: `"JetBrains Mono Variable", "JetBrains Mono", ${SYSTEM_MONO}`,
  },
};

export const fontPairList: FontPair[] = Object.values(fontPairs);

export const DEFAULT_FONT_PAIR_ID = 'inter-source-jetbrains';

export const getFontPair = (id: string | undefined): FontPair => {
  if (id && fontPairs[id]) return fontPairs[id];
  return fontPairs[DEFAULT_FONT_PAIR_ID];
};

export const isValidFontPairId = (id: string): boolean => id in fontPairs;
