import {
  Hct,
  MaterialDynamicColors,
  SchemeExpressive,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities';

export const SEED_COLOR_HEX = '#0F8A72';

export type M3ColorRole =
  | 'primary'
  | 'onPrimary'
  | 'primaryContainer'
  | 'onPrimaryContainer'
  | 'inversePrimary'
  | 'secondary'
  | 'onSecondary'
  | 'secondaryContainer'
  | 'onSecondaryContainer'
  | 'tertiary'
  | 'onTertiary'
  | 'tertiaryContainer'
  | 'onTertiaryContainer'
  | 'error'
  | 'onError'
  | 'errorContainer'
  | 'onErrorContainer'
  | 'background'
  | 'onBackground'
  | 'surface'
  | 'onSurface'
  | 'surfaceVariant'
  | 'onSurfaceVariant'
  | 'surfaceDim'
  | 'surfaceBright'
  | 'surfaceContainerLowest'
  | 'surfaceContainerLow'
  | 'surfaceContainer'
  | 'surfaceContainerHigh'
  | 'surfaceContainerHighest'
  | 'outline'
  | 'outlineVariant'
  | 'shadow'
  | 'scrim'
  | 'inverseSurface'
  | 'inverseOnSurface'
  | 'surfaceTint';

export type M3ColorScheme = Record<M3ColorRole, string>;

const buildScheme = (sourceHex: string, isDark: boolean): M3ColorScheme => {
  const sourceHct = Hct.fromInt(argbFromHex(sourceHex));
  const scheme = new SchemeExpressive(sourceHct, isDark, 0);
  const m = new MaterialDynamicColors();
  const toHex = (argb: number) => hexFromArgb(argb);
  return {
    primary: toHex(m.primary().getArgb(scheme)),
    onPrimary: toHex(m.onPrimary().getArgb(scheme)),
    primaryContainer: toHex(m.primaryContainer().getArgb(scheme)),
    onPrimaryContainer: toHex(m.onPrimaryContainer().getArgb(scheme)),
    inversePrimary: toHex(m.inversePrimary().getArgb(scheme)),
    secondary: toHex(m.secondary().getArgb(scheme)),
    onSecondary: toHex(m.onSecondary().getArgb(scheme)),
    secondaryContainer: toHex(m.secondaryContainer().getArgb(scheme)),
    onSecondaryContainer: toHex(m.onSecondaryContainer().getArgb(scheme)),
    tertiary: toHex(m.tertiary().getArgb(scheme)),
    onTertiary: toHex(m.onTertiary().getArgb(scheme)),
    tertiaryContainer: toHex(m.tertiaryContainer().getArgb(scheme)),
    onTertiaryContainer: toHex(m.onTertiaryContainer().getArgb(scheme)),
    error: toHex(m.error().getArgb(scheme)),
    onError: toHex(m.onError().getArgb(scheme)),
    errorContainer: toHex(m.errorContainer().getArgb(scheme)),
    onErrorContainer: toHex(m.onErrorContainer().getArgb(scheme)),
    background: toHex(m.background().getArgb(scheme)),
    onBackground: toHex(m.onBackground().getArgb(scheme)),
    surface: toHex(m.surface().getArgb(scheme)),
    onSurface: toHex(m.onSurface().getArgb(scheme)),
    surfaceVariant: toHex(m.surfaceVariant().getArgb(scheme)),
    onSurfaceVariant: toHex(m.onSurfaceVariant().getArgb(scheme)),
    surfaceDim: toHex(m.surfaceDim().getArgb(scheme)),
    surfaceBright: toHex(m.surfaceBright().getArgb(scheme)),
    surfaceContainerLowest: toHex(m.surfaceContainerLowest().getArgb(scheme)),
    surfaceContainerLow: toHex(m.surfaceContainerLow().getArgb(scheme)),
    surfaceContainer: toHex(m.surfaceContainer().getArgb(scheme)),
    surfaceContainerHigh: toHex(m.surfaceContainerHigh().getArgb(scheme)),
    surfaceContainerHighest: toHex(m.surfaceContainerHighest().getArgb(scheme)),
    outline: toHex(m.outline().getArgb(scheme)),
    outlineVariant: toHex(m.outlineVariant().getArgb(scheme)),
    shadow: toHex(m.shadow().getArgb(scheme)),
    scrim: toHex(m.scrim().getArgb(scheme)),
    inverseSurface: toHex(m.inverseSurface().getArgb(scheme)),
    inverseOnSurface: toHex(m.inverseOnSurface().getArgb(scheme)),
    surfaceTint: toHex(m.surfaceTint().getArgb(scheme)),
  };
};

export const lightScheme: M3ColorScheme = buildScheme(SEED_COLOR_HEX, false);
export const darkScheme: M3ColorScheme = buildScheme(SEED_COLOR_HEX, true);

export const buildSchemeFor = (sourceHex: string, isDark: boolean): M3ColorScheme =>
  buildScheme(sourceHex, isDark);
