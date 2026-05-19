import { type MouseEvent } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { FontPair } from '../../../../theme/fonts';

interface FontPairCardProps {
  pair: FontPair;
  selected: boolean;
  onSelect: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const FontPairCard = ({ pair, selected, onSelect }: FontPairCardProps) => {
  const theme = useTheme();
  return (
    <Box
      component="button"
      type="button"
      onClick={(event: MouseEvent<HTMLButtonElement>) => onSelect(event)}
      aria-pressed={selected}
      sx={{
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: theme.palette.surfaces.containerLow,
        border: `2px solid ${
          selected ? theme.palette.primary.main : theme.palette.outlineVariant
        }`,
        color: theme.palette.text.primary,
        padding: 0,
        font: 'inherit',
        transition: `border-color ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}, background-color ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
        '&:hover': {
          borderColor: selected
            ? theme.palette.primary.main
            : theme.palette.outline,
          backgroundColor: theme.palette.surfaces.container,
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      {selected && (
        <CheckCircleIcon
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'primary.main',
            fontSize: 20,
            backgroundColor: theme.palette.surfaces.containerLow,
            borderRadius: '50%',
            zIndex: 1,
          }}
        />
      )}

      <Stack spacing={1.5} sx={{ p: 2.5, flex: 1 }}>
        <Stack direction="row" alignItems="baseline" spacing={2}>
          <Typography
            sx={{
              fontFamily: pair.display,
              fontSize: 44,
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Aa
          </Typography>
          <Stack>
            <Typography variant="titleMedium" sx={{ fontFamily: pair.sans, fontWeight: 600 }}>
              {pair.name}
            </Typography>
            <Typography variant="bodySmall" color="text.secondary">
              {pair.description}
            </Typography>
          </Stack>
        </Stack>
        <Typography
          variant="bodyMedium"
          sx={{ fontFamily: pair.sans, color: 'text.primary' }}
        >
          Pacientes, practicantes y docentes en un solo lugar.
        </Typography>
        <Typography
          sx={{
            fontFamily: pair.mono,
            fontSize: 12,
            color: 'text.secondary',
          }}
        >
          odontolink.unt.edu.ar / appearance
        </Typography>
      </Stack>
    </Box>
  );
};

export default FontPairCard;
