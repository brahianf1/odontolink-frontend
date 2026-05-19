import { alpha } from '@mui/material/styles';
import type { ThemeVariantColors, Mode } from '../variants/_types';

/**
 * Map a variant's ThemeVariantColors set into the MUI PaletteOptions shape,
 * including our augmented `tertiary`, `surfaces`, `outlineVariant`, `m3`
 * and `charts` extensions.
 */
export const buildPaletteFromVariant = (colors: ThemeVariantColors, mode: Mode) => ({
  mode,
  primary: {
    main: colors.primary,
    light: colors.primaryContainer,
    dark: colors.onPrimaryContainer,
    contrastText: colors.onPrimary,
    container: colors.primaryContainer,
    onContainer: colors.onPrimaryContainer,
  },
  secondary: {
    main: colors.secondary,
    light: colors.secondaryContainer,
    dark: colors.onSecondaryContainer,
    contrastText: colors.onSecondary,
    container: colors.secondaryContainer,
    onContainer: colors.onSecondaryContainer,
  },
  tertiary: {
    main: colors.tertiary,
    light: colors.tertiaryContainer,
    dark: colors.onTertiaryContainer,
    contrastText: colors.onTertiary,
    container: colors.tertiaryContainer,
    onContainer: colors.onTertiaryContainer,
  },
  error: {
    main: colors.error,
    light: colors.errorContainer,
    dark: colors.onErrorContainer,
    contrastText: colors.onError,
    container: colors.errorContainer,
    onContainer: colors.onErrorContainer,
  },
  warning: {
    main: mode === 'light' ? '#B25C00' : '#FFB779',
    light: mode === 'light' ? '#FFDCC0' : '#5A3A14',
    dark: mode === 'light' ? '#3A2400' : '#FFDCC0',
    contrastText: mode === 'light' ? '#FFFFFF' : '#1A1100',
  },
  info: {
    main: colors.tertiary,
    light: colors.tertiaryContainer,
    dark: colors.onTertiaryContainer,
    contrastText: colors.onTertiary,
  },
  success: {
    main: mode === 'light' ? '#1F7A4D' : '#7BD9A8',
    light: mode === 'light' ? '#B7F2CE' : '#10532E',
    dark: mode === 'light' ? '#003521' : '#B7F2CE',
    contrastText: mode === 'light' ? '#FFFFFF' : '#003521',
  },
  background: {
    default: colors.background,
    paper: colors.surfaceContainerLow,
  },
  text: {
    primary: colors.onSurface,
    secondary: colors.onSurfaceVariant,
    disabled: alpha(colors.onSurface, 0.38),
  },
  divider: colors.outlineVariant,
  outline: colors.outline,
  surfaces: {
    dim: colors.surfaceDim,
    bright: colors.surfaceBright,
    containerLowest: colors.surfaceContainerLowest,
    containerLow: colors.surfaceContainerLow,
    container: colors.surfaceContainer,
    containerHigh: colors.surfaceContainerHigh,
    containerHighest: colors.surfaceContainerHighest,
    tint: colors.surfaceTint,
    variant: colors.surfaceVariant,
    onVariant: colors.onSurfaceVariant,
  },
  outlineVariant: colors.outlineVariant,
  charts: [colors.chart1, colors.chart2, colors.chart3, colors.chart4, colors.chart5] as readonly string[],
  m3: colors,
});
