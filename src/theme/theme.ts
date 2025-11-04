import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// Color palette for Odontolink - Professional dental clinic theme
const primaryColor = {
  main: '#0D7C66', // Teal green - represents health, cleanliness
  light: '#3D9A87',
  dark: '#065D4E',
  contrastText: '#FFFFFF',
};

const secondaryColor = {
  main: '#41B3A2', // Light teal - fresh, modern
  light: '#6BC4B5',
  dark: '#2E8577',
  contrastText: '#FFFFFF',
};

const errorColor = {
  main: '#D32F2F',
  light: '#E57373',
  dark: '#C62828',
};

const warningColor = {
  main: '#ED6C02',
  light: '#FF9800',
  dark: '#E65100',
};

const infoColor = {
  main: '#0288D1',
  light: '#03A9F4',
  dark: '#01579B',
};

const successColor = {
  main: '#2E7D32',
  light: '#4CAF50',
  dark: '#1B5E20',
};

// Light theme configuration
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: primaryColor,
    secondary: secondaryColor,
    error: errorColor,
    warning: warningColor,
    info: infoColor,
    success: successColor,
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '10px 24px',
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(13, 124, 102, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(13, 124, 102, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
};

// Dark theme configuration
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#3D9A87',
      light: '#5FB3A1',
      dark: '#2E7D6C',
      contrastText: '#FFFFFF',
    },
    secondary: secondaryColor,
    error: errorColor,
    warning: warningColor,
    info: infoColor,
    success: successColor,
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
    },
  },
  typography: lightThemeOptions.typography,
  shape: lightThemeOptions.shape,
  components: lightThemeOptions.components,
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
