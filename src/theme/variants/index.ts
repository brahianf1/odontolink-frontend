import type { ThemeVariant } from './_types';
import { generatedThemes } from './generated';
import { themeMetadata } from './metadata';
import { originalVariant } from './original';

export type { Mode, ThemeVariant, ThemeVariantColors, FitScore, Tier } from './_types';
export { customThemeDtoToVariant, customThemeListToVariants } from './fromApi';

/** Default theme variant id when there is no env override or stored preference. */
export const DEFAULT_VARIANT_ID = 'theme-14';

/**
 * Assemble each generated variant (color tokens) with its hand-written
 * metadata (name, mood, fitScore, defaultFontPair). Variants that lack
 * metadata are skipped at this layer — the metadata file is the source of
 * truth for what is exposed as a variant.
 */
const importedVariants: ThemeVariant[] = Object.entries(generatedThemes)
  .map(([id, colors]) => {
    const meta = themeMetadata[id];
    if (!meta) return null;
    return {
      id,
      name: meta.name,
      description: meta.description,
      mood: meta.mood,
      fitScore: meta.fitScore,
      tier: meta.tier,
      defaultFontPair: meta.defaultFontPair,
      light: colors.light,
      dark: colors.dark,
    } satisfies ThemeVariant;
  })
  .filter((v): v is ThemeVariant => v !== null);

/** Map of all variants keyed by id. Includes the M3-generated original. */
export const themeVariants: Record<string, ThemeVariant> = {
  [originalVariant.id]: originalVariant,
  ...Object.fromEntries(importedVariants.map((v) => [v.id, v])),
};

export const themeVariantList: ThemeVariant[] = Object.values(themeVariants);

export const officialVariants: ThemeVariant[] = themeVariantList.filter(
  (v) => v.tier === 'official',
);

export const experimentalVariants: ThemeVariant[] = themeVariantList.filter(
  (v) => v.tier === 'experimental',
);

/** Top-fit official variants, sorted high to low. */
export const recommendedVariants: ThemeVariant[] = officialVariants
  .filter((v) => v.fitScore >= 4)
  .sort((a, b) => b.fitScore - a.fitScore);

export const getVariant = (id: string | undefined): ThemeVariant => {
  if (id && themeVariants[id]) return themeVariants[id];
  return themeVariants[DEFAULT_VARIANT_ID] ?? originalVariant;
};

export const isValidVariantId = (id: string): boolean => id in themeVariants;

/**
 * Resolve a variant id against built-ins first, then a runtime list of
 * custom themes (typically fetched from the backend). Falls back to the
 * default variant if nothing matches.
 */
export const resolveVariant = (
  id: string | undefined,
  customs: readonly ThemeVariant[] = [],
): ThemeVariant => {
  if (id) {
    const builtin = themeVariants[id];
    if (builtin) return builtin;
    const custom = customs.find((v) => v.id === id);
    if (custom) return custom;
  }
  return themeVariants[DEFAULT_VARIANT_ID] ?? originalVariant;
};
