import { useMemo } from 'react';
import { Box, Divider, Rating, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { TooltipProps } from 'recharts';
import type { TopByCriterionEntryDTO } from '../../../types/feedback.types';

interface CriterionTooltipInnerProps extends TooltipProps<number, string> {
  criterionName: string;
  referenceAverage: number;
  accentColor: string;
}

function CriterionTooltipInner({
  active,
  payload,
  criterionName,
  referenceAverage,
  accentColor,
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
            sx={{ color: entry.rankPosition <= 3 ? accentColor : theme.palette.text.secondary }}
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

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Rating value={entry.average} readOnly precision={0.1} size="small" />
        <Typography variant="labelSmall" color="text.secondary">
          ({entry.feedbackCount} {entry.feedbackCount === 1 ? 'evaluación' : 'evaluaciones'})
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: theme.palette.outlineVariant, mb: 1 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
        <Typography variant="bodySmall" color="text.secondary">
          {criterionName}
        </Typography>
        <Typography variant="labelMedium" fontWeight={700}>
          {entry.average.toFixed(2)}
        </Typography>
      </Stack>
      <Box
        sx={{
          height: 6,
          width: '100%',
          backgroundColor: theme.palette.surfaces.containerHigh,
          overflow: 'hidden',
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${(entry.average / 5) * 100}%`,
            backgroundColor: accentColor,
            transition: 'width 300ms ease',
          }}
        />
      </Box>

      <Typography variant="labelSmall" sx={{ color: deltaColor }}>
        vs media del criterio: {deltaSign}{delta.toFixed(2)} {deltaArrow}
      </Typography>
    </Box>
  );
}

export function useCriterionTooltip(
  criterionName: string,
  referenceAverage: number,
  accentColor: string,
) {
  return useMemo(
    () =>
      function CriterionTooltipWrapper(props: TooltipProps<number, string>) {
        return (
          <CriterionTooltipInner
            {...props}
            criterionName={criterionName}
            referenceAverage={referenceAverage}
            accentColor={accentColor}
          />
        );
      },
    [criterionName, referenceAverage, accentColor],
  );
}
