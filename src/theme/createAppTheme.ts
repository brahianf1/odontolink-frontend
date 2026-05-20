import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import './augmentation';
import { resolveVariant } from './variants';
import type { Mode, ThemeVariant } from './variants/_types';
import { getFontPair } from './fonts';
import { buildPaletteFromVariant } from './tokens/palette';
import { createTypography } from './tokens/typography';
import { shape } from './tokens/shape';
import { motion } from './tokens/motion';
import { muiShadows } from './tokens/elevation';

/**
 * Build a fully-configured MUI Theme from the variant id, mode, and font
 * pair id. Variants resolve through `resolveVariant` (checks built-in
 * registry first, then any runtime custom themes passed in); falls back to
 * the default variant if the id is unknown.
 */
export const createAppTheme = (
  variantId: string,
  mode: Mode,
  fontPairId: string,
  customVariants: readonly ThemeVariant[] = [],
): Theme => {
  const variant = resolveVariant(variantId, customVariants);
  const fontPair = getFontPair(fontPairId);
  const colors = mode === 'dark' ? variant.dark : variant.light;
  const palette = buildPaletteFromVariant(colors, mode);
  const typography = createTypography(fontPair);
  const shadows = mode === 'dark' ? muiShadows.dark : muiShadows.light;

  return createTheme({
    palette,
    typography,
    shape,
    motion,
    shadows: shadows as unknown as Theme['shadows'],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
            color: colors.onSurface,
            fontVariationSettings: '"wght" 400, "wdth" 100, "opsz" 14',
          },
          '::selection': {
            backgroundColor: colors.primaryContainer,
            color: colors.onPrimaryContainer,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 0,
            padding: '10px 24px',
            boxShadow: 'none',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { boxShadow: 'none' },
            '&:focus-visible': {
              outline: `2px solid ${colors.primary}`,
              outlineOffset: 2,
            },
          },
          contained: {
            '&:hover': { boxShadow: 'none' },
            '&:active': { boxShadow: 'none' },
          },
          outlined: {
            borderColor: colors.outline,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: `1px solid ${colors.outlineVariant}`,
            backgroundColor: colors.surfaceContainerLow,
            backgroundImage: 'none',
            boxShadow: 'none',
            transition:
              'background-color 200ms cubic-bezier(0.2, 0, 0, 1), border-color 200ms cubic-bezier(0.2, 0, 0, 1)',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.outline,
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundColor: colors.surfaceContainer,
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            fontWeight: 500,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundColor: colors.surfaceContainerHigh,
            backgroundImage: 'none',
          },
        },
      },
      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            border: 'none',
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '&:not(:last-of-type)': {
              borderBottom: `1px solid ${colors.outlineVariant}`,
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 0,
            backgroundColor: colors.inverseSurface,
            color: colors.inverseOnSurface,
            fontSize: '0.75rem',
            padding: '8px 12px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.outlineVariant,
          },
        },
      },
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            displayLarge: 'h1',
            displayMedium: 'h1',
            displaySmall: 'h1',
            headlineLarge: 'h2',
            headlineMedium: 'h3',
            headlineSmall: 'h4',
            titleLarge: 'h5',
            titleMedium: 'h6',
            titleSmall: 'h6',
            bodyLarge: 'p',
            bodyMedium: 'p',
            bodySmall: 'p',
            labelLarge: 'span',
            labelMedium: 'span',
            labelSmall: 'span',
          },
        },
      },
    },
  });
};
