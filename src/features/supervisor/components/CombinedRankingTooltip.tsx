import { useMemo } from 'react';
import { Box, Divider, Rating, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { TooltipProps } from 'recharts';
import type {
  CriterionRef,
  PractitionersRankingEntryDTO,
} from '../../../types/feedback.types';

interface CombinedRankingTooltipInnerProps
  extends TooltipProps<number, string> {
  criteriaUsed: CriterionRef[];
  groupAverage: number;
}

function CombinedRankingTooltipInner({
  active,
  payload,
  criteriaUsed,
  groupAverage,
}: CombinedRankingTooltipInnerProps) {
  const theme = useTheme();

  if (!active || !payload?.length) return null;

  const entry = payload[0].payload as PractitionersRankingEntryDTO;
  const delta = entry.combinedAverage - groupAverage;
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
        minWidth: 280,
        maxWidth: 320,
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
          {entry.combinedAverage.toFixed(2)}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Rating value={entry.combinedAverage} readOnly precision={0.1} size="small" />
        <Typography variant="labelSmall" color="text.secondary">
          ({entry.feedbackCount} {entry.feedbackCount === 1 ? 'evaluacion' : 'evaluaciones'})
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: theme.palette.outlineVariant, mb: 1.5 }} />

      <Stack spacing={1}>
        {criteriaUsed.map((c) => {
          const score = entry.perCriterionAverages[c.code] ?? 0;
          const pct = (score / 5) * 100;
          return (
            <Box key={c.code}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.25 }}>
                <Typography variant="bodySmall" sx={{ flex: 1, minWidth: 0 }}>
                  {c.displayName}
                </Typography>
                <Typography variant="labelMedium" fontWeight={700} sx={{ ml: 1 }}>
                  {score.toFixed(2)}
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 6,
                  width: '100%',
                  backgroundColor: theme.palette.surfaces.containerHigh,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: theme.palette.primary.main,
                    transition: 'width 300ms ease',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ borderColor: theme.palette.outlineVariant, mt: 1.5, mb: 1 }} />

      <Typography variant="labelSmall" sx={{ color: deltaColor }}>
        vs promedio general: {deltaSign}{delta.toFixed(2)} {deltaArrow}
      </Typography>
    </Box>
  );
}

export function useRankingTooltip(
  criteriaUsed: CriterionRef[],
  groupAverage: number,
) {
  return useMemo(
    () =>
      function RankingTooltip(props: TooltipProps<number, string>) {
        return (
          <CombinedRankingTooltipInner
            {...props}
            criteriaUsed={criteriaUsed}
            groupAverage={groupAverage}
          />
        );
      },
    [criteriaUsed, groupAverage],
  );
}
