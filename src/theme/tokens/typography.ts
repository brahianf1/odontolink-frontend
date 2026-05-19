import type { TypographyOptions } from '@mui/material/styles/createTypography';

const FONT_FAMILY =
  '"Roboto Flex Variable", "Roboto Flex", "Roboto", "Inter", system-ui, sans-serif';

type Scale = {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: number;
};

const scale = (
  fontSizePx: number,
  lineHeightPx: number,
  letterSpacingPx: number,
  fontWeight: number,
): Scale => ({
  fontSize: `${fontSizePx / 16}rem`,
  lineHeight: `${lineHeightPx / fontSizePx}`,
  letterSpacing: letterSpacingPx === 0 ? '0' : `${letterSpacingPx / fontSizePx}em`,
  fontWeight,
});

export const m3TypeScale = {
  displayLarge: scale(57, 64, -0.25, 500),
  displayMedium: scale(45, 52, 0, 500),
  displaySmall: scale(36, 44, 0, 500),
  headlineLarge: scale(32, 40, 0, 500),
  headlineMedium: scale(28, 36, 0, 500),
  headlineSmall: scale(24, 32, 0, 500),
  titleLarge: scale(22, 28, 0, 500),
  titleMedium: scale(16, 24, 0.15, 500),
  titleSmall: scale(14, 20, 0.1, 500),
  bodyLarge: scale(16, 24, 0.5, 400),
  bodyMedium: scale(14, 20, 0.25, 400),
  bodySmall: scale(12, 16, 0.4, 400),
  labelLarge: scale(14, 20, 0.1, 500),
  labelMedium: scale(12, 16, 0.5, 500),
  labelSmall: scale(11, 16, 0.5, 500),
} as const;

export type M3TypeScale = typeof m3TypeScale;

const withFamily = (s: Scale): Scale & { fontFamily: string } => ({
  fontFamily: FONT_FAMILY,
  ...s,
});

export const createTypography = (): TypographyOptions => ({
  fontFamily: FONT_FAMILY,
  htmlFontSize: 16,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,

  // MUI base variants mapped to M3 scale
  h1: withFamily(m3TypeScale.displayMedium),
  h2: withFamily(m3TypeScale.displaySmall),
  h3: withFamily(m3TypeScale.headlineLarge),
  h4: withFamily(m3TypeScale.headlineMedium),
  h5: withFamily(m3TypeScale.headlineSmall),
  h6: withFamily(m3TypeScale.titleLarge),
  subtitle1: withFamily(m3TypeScale.titleMedium),
  subtitle2: withFamily(m3TypeScale.titleSmall),
  body1: withFamily(m3TypeScale.bodyLarge),
  body2: withFamily(m3TypeScale.bodyMedium),
  caption: withFamily(m3TypeScale.bodySmall),
  overline: {
    ...withFamily(m3TypeScale.labelSmall),
    textTransform: 'uppercase' as const,
  },
  button: {
    ...withFamily(m3TypeScale.labelLarge),
    textTransform: 'none' as const,
  },

  // Custom M3 variants (typed via augmentation)
  displayLarge: withFamily(m3TypeScale.displayLarge),
  displayMedium: withFamily(m3TypeScale.displayMedium),
  displaySmall: withFamily(m3TypeScale.displaySmall),
  headlineLarge: withFamily(m3TypeScale.headlineLarge),
  headlineMedium: withFamily(m3TypeScale.headlineMedium),
  headlineSmall: withFamily(m3TypeScale.headlineSmall),
  titleLarge: withFamily(m3TypeScale.titleLarge),
  titleMedium: withFamily(m3TypeScale.titleMedium),
  titleSmall: withFamily(m3TypeScale.titleSmall),
  bodyLarge: withFamily(m3TypeScale.bodyLarge),
  bodyMedium: withFamily(m3TypeScale.bodyMedium),
  bodySmall: withFamily(m3TypeScale.bodySmall),
  labelLarge: withFamily(m3TypeScale.labelLarge),
  labelMedium: withFamily(m3TypeScale.labelMedium),
  labelSmall: withFamily(m3TypeScale.labelSmall),
});

export const fontFamily = FONT_FAMILY;
