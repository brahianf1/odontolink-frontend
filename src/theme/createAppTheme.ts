import { createTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import './augmentation';
import { darkScheme, lightScheme, type M3ColorScheme } from './tokens/palette';
import { createTypography } from './tokens/typography';
import { shape } from './tokens/shape';
import { motion } from './tokens/motion';
import { muiShadows } from './tokens/elevation';

type Mode = 'light' | 'dark';

const buildPalette = (m3: M3ColorScheme, mode: Mode) => ({
  mode,
  primary: {
    main: m3.primary,
    light: m3.primaryContainer,
    dark: m3.onPrimaryContainer,
    contrastText: m3.onPrimary,
    container: m3.primaryContainer,
    onContainer: m3.onPrimaryContainer,
  },
  secondary: {
    main: m3.secondary,
    light: m3.secondaryContainer,
    dark: m3.onSecondaryContainer,
    contrastText: m3.onSecondary,
    container: m3.secondaryContainer,
    onContainer: m3.onSecondaryContainer,
  },
  tertiary: {
    main: m3.tertiary,
    light: m3.tertiaryContainer,
    dark: m3.onTertiaryContainer,
    contrastText: m3.onTertiary,
    container: m3.tertiaryContainer,
    onContainer: m3.onTertiaryContainer,
  },
  error: {
    main: m3.error,
    light: m3.errorContainer,
    dark: m3.onErrorContainer,
    contrastText: m3.onError,
    container: m3.errorContainer,
    onContainer: m3.onErrorContainer,
  },
  warning: {
    main: mode === 'light' ? '#B25C00' : '#FFB779',
    light: mode === 'light' ? '#FFDCC0' : '#5A3A14',
    dark: mode === 'light' ? '#3A2400' : '#FFDCC0',
    contrastText: mode === 'light' ? '#FFFFFF' : '#1A1100',
  },
  info: {
    main: m3.tertiary,
    light: m3.tertiaryContainer,
    dark: m3.onTertiaryContainer,
    contrastText: m3.onTertiary,
  },
  success: {
    main: mode === 'light' ? '#1F7A4D' : '#7BD9A8',
    light: mode === 'light' ? '#B7F2CE' : '#10532E',
    dark: mode === 'light' ? '#003521' : '#B7F2CE',
    contrastText: mode === 'light' ? '#FFFFFF' : '#003521',
  },
  background: {
    default: m3.background,
    paper: m3.surfaceContainerLow,
  },
  text: {
    primary: m3.onSurface,
    secondary: m3.onSurfaceVariant,
    disabled: alpha(m3.onSurface, 0.38),
  },
  divider: m3.outlineVariant,
  surfaces: {
    dim: m3.surfaceDim,
    bright: m3.surfaceBright,
    containerLowest: m3.surfaceContainerLowest,
    containerLow: m3.surfaceContainerLow,
    container: m3.surfaceContainer,
    containerHigh: m3.surfaceContainerHigh,
    containerHighest: m3.surfaceContainerHighest,
    tint: m3.surfaceTint,
    variant: m3.surfaceVariant,
    onVariant: m3.onSurfaceVariant,
  },
  outlineVariant: m3.outlineVariant,
  m3,
});

export const createAppTheme = (mode: Mode): Theme => {
  const m3 = mode === 'dark' ? darkScheme : lightScheme;
  const palette = buildPalette(m3, mode);
  const typography = createTypography();
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
            backgroundColor: m3.background,
            color: m3.onSurface,
            fontVariationSettings: '"wght" 400, "wdth" 100, "opsz" 14',
          },
          '::selection': {
            backgroundColor: m3.primaryContainer,
            color: m3.onPrimaryContainer,
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
              outline: `2px solid ${m3.primary}`,
              outlineOffset: 2,
            },
          },
          contained: {
            '&:hover': { boxShadow: 'none' },
            '&:active': { boxShadow: 'none' },
          },
          outlined: {
            borderColor: m3.outline,
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
            border: `1px solid ${m3.outlineVariant}`,
            backgroundColor: m3.surfaceContainerLow,
            backgroundImage: 'none',
            boxShadow: 'none',
            transition: 'background-color 200ms cubic-bezier(0.2, 0, 0, 1), border-color 200ms cubic-bezier(0.2, 0, 0, 1)',
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
              borderColor: m3.outline,
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundColor: m3.surfaceContainer,
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
            backgroundColor: m3.surfaceContainerHigh,
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
              borderBottom: `1px solid ${m3.outlineVariant}`,
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
            backgroundColor: m3.inverseSurface,
            color: m3.inverseOnSurface,
            fontSize: '0.75rem',
            padding: '8px 12px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: m3.outlineVariant,
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
