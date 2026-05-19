import {
  Hct,
  MaterialDynamicColors,
  SchemeExpressive,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities';
import type { Mode, ThemeVariant, ThemeVariantColors } from './_types';

const SEED = '#0F8A72';

const computeOriginalColors = (mode: Mode): ThemeVariantColors => {
  const sourceHct = Hct.fromInt(argbFromHex(SEED));
  const scheme = new SchemeExpressive(sourceHct, mode === 'dark', 0);
  const m = new MaterialDynamicColors();
  const hex = (argb: number) => hexFromArgb(argb);
  return {
    primary: hex(m.primary().getArgb(scheme)),
    onPrimary: hex(m.onPrimary().getArgb(scheme)),
    primaryContainer: hex(m.primaryContainer().getArgb(scheme)),
    onPrimaryContainer: hex(m.onPrimaryContainer().getArgb(scheme)),
    inversePrimary: hex(m.inversePrimary().getArgb(scheme)),
    secondary: hex(m.secondary().getArgb(scheme)),
    onSecondary: hex(m.onSecondary().getArgb(scheme)),
    secondaryContainer: hex(m.secondaryContainer().getArgb(scheme)),
    onSecondaryContainer: hex(m.onSecondaryContainer().getArgb(scheme)),
    tertiary: hex(m.tertiary().getArgb(scheme)),
    onTertiary: hex(m.onTertiary().getArgb(scheme)),
    tertiaryContainer: hex(m.tertiaryContainer().getArgb(scheme)),
    onTertiaryContainer: hex(m.onTertiaryContainer().getArgb(scheme)),
    error: hex(m.error().getArgb(scheme)),
    onError: hex(m.onError().getArgb(scheme)),
    errorContainer: hex(m.errorContainer().getArgb(scheme)),
    onErrorContainer: hex(m.onErrorContainer().getArgb(scheme)),
    background: hex(m.background().getArgb(scheme)),
    onBackground: hex(m.onBackground().getArgb(scheme)),
    surface: hex(m.surface().getArgb(scheme)),
    onSurface: hex(m.onSurface().getArgb(scheme)),
    surfaceVariant: hex(m.surfaceVariant().getArgb(scheme)),
    onSurfaceVariant: hex(m.onSurfaceVariant().getArgb(scheme)),
    surfaceDim: hex(m.surfaceDim().getArgb(scheme)),
    surfaceBright: hex(m.surfaceBright().getArgb(scheme)),
    surfaceContainerLowest: hex(m.surfaceContainerLowest().getArgb(scheme)),
    surfaceContainerLow: hex(m.surfaceContainerLow().getArgb(scheme)),
    surfaceContainer: hex(m.surfaceContainer().getArgb(scheme)),
    surfaceContainerHigh: hex(m.surfaceContainerHigh().getArgb(scheme)),
    surfaceContainerHighest: hex(m.surfaceContainerHighest().getArgb(scheme)),
    outline: hex(m.outline().getArgb(scheme)),
    outlineVariant: hex(m.outlineVariant().getArgb(scheme)),
    shadow: hex(m.shadow().getArgb(scheme)),
    scrim: hex(m.scrim().getArgb(scheme)),
    inverseSurface: hex(m.inverseSurface().getArgb(scheme)),
    inverseOnSurface: hex(m.inverseOnSurface().getArgb(scheme)),
    surfaceTint: hex(m.surfaceTint().getArgb(scheme)),
    // Charts derived from the algorithmic scheme.
    chart1: hex(m.primary().getArgb(scheme)),
    chart2: hex(m.secondary().getArgb(scheme)),
    chart3: hex(m.tertiary().getArgb(scheme)),
    chart4: hex(m.primaryContainer().getArgb(scheme)),
    chart5: hex(m.tertiaryContainer().getArgb(scheme)),
  };
};

/**
 * The OdontoLink Original variant: generated once at module load from the
 * M3 SchemeExpressive of the seed teal. It remains the algorithmic-M3
 * variant, while everything else in the registry uses static token sets
 * imported from the shadcn-style themes/ folder.
 */
export const originalVariant: ThemeVariant = {
  id: 'odontolink-original',
  name: 'OdontoLink Original',
  description: 'M3 Expressive teal — the original institutional palette generated from seed #0F8A72.',
  mood: 'Healthcare teal, algorithmic M3',
  fitScore: 5,
  tier: 'official',
  defaultFontPair: 'inter-source-jetbrains',
  light: computeOriginalColors('light'),
  dark: computeOriginalColors('dark'),
};
