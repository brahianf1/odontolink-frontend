import { type MouseEvent } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import type { ThemeMode } from '../../../../store/themeStore';

interface ModeSelectorProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode, event: MouseEvent<HTMLButtonElement>) => void;
}

const OPTIONS: Array<{
  id: ThemeMode;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: 'light',
    label: 'Claro',
    description: 'Fondo blanco siempre.',
    icon: LightModeIcon,
  },
  {
    id: 'dark',
    label: 'Oscuro',
    description: 'Fondo oscuro siempre.',
    icon: DarkModeIcon,
  },
  {
    id: 'system',
    label: 'Sistema',
    description: 'Sigue la preferencia del sistema operativo.',
    icon: SettingsBrightnessIcon,
  },
];

export const ModeSelector = ({ value, onChange }: ModeSelectorProps) => {
  const theme = useTheme();
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ width: '100%' }}
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.id;
        return (
          <Box
            key={opt.id}
            component="button"
            type="button"
            onClick={(event: MouseEvent<HTMLButtonElement>) => onChange(opt.id, event)}
            aria-pressed={selected}
            sx={{
              flex: 1,
              cursor: 'pointer',
              textAlign: 'left',
              backgroundColor: selected
                ? theme.palette.primary.container
                : theme.palette.surfaces.containerLow,
              color: selected
                ? theme.palette.primary.onContainer
                : theme.palette.text.primary,
              border: `2px solid ${
                selected ? theme.palette.primary.main : theme.palette.outlineVariant
              }`,
              padding: '14px 16px',
              font: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: `background-color ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}, border-color ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
              '&:hover': {
                borderColor: theme.palette.primary.main,
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
            <Box>
              <Typography variant="titleSmall" sx={{ fontWeight: 600 }}>
                {opt.label}
              </Typography>
              <Typography variant="bodySmall" sx={{ color: 'inherit', opacity: 0.8 }}>
                {opt.description}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

export default ModeSelector;
