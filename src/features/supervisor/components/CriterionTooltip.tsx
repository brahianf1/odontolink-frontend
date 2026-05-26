import { useMemo } from 'react';
import { Box, Divider, Rating, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { TooltipProps } from 'recharts';
import type { TopByCriterionEntryDTO } from '../../../types/feedback.types';

interface CriterionTooltipInnerProps extends TooltipProps<number, string> {
  referenceAverage: number;
}

function CriterionTooltipInner({
  active,
  payload,
  referenceAverage,
}: CriterionTooltipInnerProps) {
  const theme = useTheme();

  if (!active || !payload?.length) return null;

  const entry = payload[0].payload as TopByCriterionEntryDTO;
  const delta = entry.average - referenceAverage;
  const deltaSign = delta > 0 ? '+' : '';
  const deltaColor =
    delta > 0
      ? theme.palette.success.main
      : delta < 0
        ? theme.palette.error.main
        : theme.palette.text.secondary;
  const deltaArrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '';

  return (
    <Box
      sx={{
        minWidth: 240,
        maxWidth: 300,
        p: 2,
        backgroundColor: theme.palette.surfaces.containerHighest,
        border: `1px solid ${theme.palette.outlineVariant}`,
        borderRadius: 0,
        boxShadow: theme.shadows[4],
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Typography
            variant="labelMedium"
            fontWeight={700}
            sx={{ color: entry.rankPosition <= 3 ? theme.palette.primary.main : theme.palette.text.secondary }}
          >
            #{entry.rankPosition}
          </Typography>
          <Typography variant="bodyMedium" fontWeight={600} noWrap>
            {entry.practitionerName}
          </Typography>
        </Stack>
        <Typography variant="titleMedium" fontWeight={700} sx={{ ml: 1, flexShrink: 0 }}>
          {entry.average.toFixed(2)}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Rating value={entry.average} readOnly precision={0.1} size="small" />
        <Typography variant="labelSmall" color="text.secondary">
          ({entry.feedbackCount} {entry.feedbackCount === 1 ? 'evaluación' : 'evaluaciones'})
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: theme.palette.outlineVariant, mb: 1 }} />

      <Typography variant="labelSmall" color="text.secondary">
        Media del criterio: {referenceAverage.toFixed(2)}{' '}
        <Typography component="span" variant="labelSmall" sx={{ color: deltaColor }}>
          ({deltaSign}{delta.toFixed(2)} {deltaArrow})
        </Typography>
      </Typography>
    </Box>
  );
}

export function useCriterionTooltip(
  referenceAverage: number,
) {
  return useMemo(
    () =>
      function CriterionTooltipWrapper(props: TooltipProps<number, string>) {
        return (
          <CriterionTooltipInner
            {...props}
            referenceAverage={referenceAverage}
          />
        );
      },
    [referenceAverage],
  );
}
