import type { TypographyOptions } from '@mui/material/styles/createTypography';
import type { FontPair } from '../fonts';

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

/** Material 3 type scale (size / line / tracking / weight). */
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

const withFamily = (s: Scale, family: string): Scale & { fontFamily: string } => ({
  fontFamily: family,
  ...s,
});

/**
 * Build the MUI Typography options for the given font pair. Display variants
 * (displayLarge..headlineLarge) use the pair's `display` family; the rest
 * use `sans`. `fontFamilyMono` is exposed for components that need it.
 */
export const createTypography = (fontPair: FontPair): TypographyOptions => {
  const { display, sans, mono } = fontPair;
  return {
    fontFamily: sans,
    htmlFontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,

    // Display tier — editorial / expressive
    h1: withFamily(m3TypeScale.displayMedium, display),
    h2: withFamily(m3TypeScale.displaySmall, display),
    h3: withFamily(m3TypeScale.headlineLarge, display),
    // Headline tier — informational
    h4: withFamily(m3TypeScale.headlineMedium, sans),
    h5: withFamily(m3TypeScale.headlineSmall, sans),
    h6: withFamily(m3TypeScale.titleLarge, sans),
    // Title tier
    subtitle1: withFamily(m3TypeScale.titleMedium, sans),
    subtitle2: withFamily(m3TypeScale.titleSmall, sans),
    // Body
    body1: withFamily(m3TypeScale.bodyLarge, sans),
    body2: withFamily(m3TypeScale.bodyMedium, sans),
    caption: withFamily(m3TypeScale.bodySmall, sans),
    overline: {
      ...withFamily(m3TypeScale.labelSmall, sans),
      textTransform: 'uppercase' as const,
    },
    button: {
      ...withFamily(m3TypeScale.labelLarge, sans),
      textTransform: 'none' as const,
    },

    // Custom M3 variants
    displayLarge: withFamily(m3TypeScale.displayLarge, display),
    displayMedium: withFamily(m3TypeScale.displayMedium, display),
    displaySmall: withFamily(m3TypeScale.displaySmall, display),
    headlineLarge: withFamily(m3TypeScale.headlineLarge, display),
    headlineMedium: withFamily(m3TypeScale.headlineMedium, sans),
    headlineSmall: withFamily(m3TypeScale.headlineSmall, sans),
    titleLarge: withFamily(m3TypeScale.titleLarge, sans),
    titleMedium: withFamily(m3TypeScale.titleMedium, sans),
    titleSmall: withFamily(m3TypeScale.titleSmall, sans),
    bodyLarge: withFamily(m3TypeScale.bodyLarge, sans),
    bodyMedium: withFamily(m3TypeScale.bodyMedium, sans),
    bodySmall: withFamily(m3TypeScale.bodySmall, sans),
    labelLarge: withFamily(m3TypeScale.labelLarge, sans),
    labelMedium: withFamily(m3TypeScale.labelMedium, sans),
    labelSmall: withFamily(m3TypeScale.labelSmall, sans),

    // Custom — monospace family available via theme.typography.fontFamilyMono
    fontFamilyMono: mono,
  } as TypographyOptions;
};
