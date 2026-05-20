import { type MouseEvent } from 'react';
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ThemeVariant } from '../../../../theme/variants/_types';

interface ThemeVariantCardProps {
  variant: ThemeVariant;
  /** Active mode used to preview the right palette (light vs dark). */
  mode: 'light' | 'dark';
  selected: boolean;
  onSelect: (event: MouseEvent<HTMLButtonElement>) => void;
}

const fitStars = (score: number) => {
  return Array.from({ length: 5 }, (_, i) => (i < score ? '★' : '☆')).join('');
};

export const ThemeVariantCard = ({
  variant,
  mode,
  selected,
  onSelect,
}: ThemeVariantCardProps) => {
  const theme = useTheme();
  const colors = mode === 'dark' ? variant.dark : variant.light;
  const tierLabel = variant.tier === 'official' ? 'Oficial' : 'Experimental';
  const tierColor = variant.tier === 'official' ? 'primary.main' : 'text.secondary';

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

      {/* Swatch strip — uses the variant's own colors so the card previews itself. */}
      <Box sx={{ display: 'flex', height: 56 }}>
        <Box sx={{ flex: 2, backgroundColor: colors.primary }} />
        <Box sx={{ flex: 1, backgroundColor: colors.secondary }} />
        <Box sx={{ flex: 1, backgroundColor: colors.tertiary }} />
      </Box>
      <Box
        sx={{
          height: 24,
          display: 'flex',
          backgroundColor: colors.background,
          borderTop: `1px solid ${colors.outlineVariant}`,
          borderBottom: `1px solid ${theme.palette.outlineVariant}`,
        }}
      >
        <Box sx={{ flex: 1, backgroundColor: colors.surfaceContainerLow }} />
        <Box sx={{ flex: 1, backgroundColor: colors.surfaceContainer }} />
        <Box sx={{ flex: 1, backgroundColor: colors.surfaceContainerHigh }} />
      </Box>

      <Stack spacing={0.5} sx={{ p: 2, flex: 1, minHeight: 96 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="titleSmall" sx={{ fontWeight: 600 }} noWrap>
            {variant.name}
          </Typography>
          <Chip
            label={tierLabel}
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 600,
              backgroundColor:
                variant.tier === 'official'
                  ? theme.palette.primary.container
                  : theme.palette.surfaces.containerHigh,
              color:
                variant.tier === 'official'
                  ? theme.palette.primary.onContainer
                  : theme.palette.text.secondary,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Stack>
        <Typography variant="bodySmall" color="text.secondary" noWrap>
          {variant.mood}
        </Typography>
        <Typography
          variant="labelSmall"
          sx={{ color: tierColor, mt: 'auto', letterSpacing: '0.1em' }}
        >
          {fitStars(variant.fitScore)}
        </Typography>
      </Stack>
    </Box>
  );
};

export default ThemeVariantCard;
