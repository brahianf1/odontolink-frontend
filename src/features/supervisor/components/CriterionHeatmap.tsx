import { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import type { TopByCriterionResponseDTO } from '../../../types/feedback.types';
import type { PractitionersRankingEntryDTO } from '../../../types/feedback.types';

interface CriterionHeatmapProps {
  criterionCharts: TopByCriterionResponseDTO[];
  rankingEntries?: PractitionersRankingEntryDTO[];
  selectedPractitionerId?: number | null;
  onPractitionerClick?: (practitionerId: number) => void;
}

interface HeatmapRow {
  practitionerId: number;
  practitionerName: string;
  scores: Record<string, number>;
  combinedRank?: number;
}

export default function CriterionHeatmap({
  criterionCharts,
  rankingEntries,
  selectedPractitionerId,
  onPractitionerClick,
}: CriterionHeatmapProps) {
  const theme = useTheme();

  const criteria = useMemo(
    () => criterionCharts.map((c) => c.criterion),
    [criterionCharts],
  );

  const rows = useMemo<HeatmapRow[]>(() => {
    const practitionerMap = new Map<number, HeatmapRow>();

    for (const chart of criterionCharts) {
      for (const entry of chart.entries) {
        if (!practitionerMap.has(entry.practitionerId)) {
          const rankEntry = rankingEntries?.find((r) => r.practitionerId === entry.practitionerId);
          practitionerMap.set(entry.practitionerId, {
            practitionerId: entry.practitionerId,
            practitionerName: entry.practitionerName,
            scores: {},
            combinedRank: rankEntry?.rankPosition,
          });
        }
        practitionerMap.get(entry.practitionerId)!.scores[chart.criterion.code] = entry.average;
      }
    }

    return Array.from(practitionerMap.values()).sort((a, b) => {
      if (a.combinedRank && b.combinedRank) return a.combinedRank - b.combinedRank;
      if (a.combinedRank) return -1;
      if (b.combinedRank) return 1;
      const avgA = Object.values(a.scores).reduce((s, v) => s + v, 0) / Object.values(a.scores).length;
      const avgB = Object.values(b.scores).reduce((s, v) => s + v, 0) / Object.values(b.scores).length;
      return avgB - avgA;
    });
  }, [criterionCharts, rankingEntries]);

  const getCellColor = (score: number) => {
    const intensity = (score / 5) * 0.55;
    return alpha(theme.palette.primary.main, Math.max(0.08, intensity));
  };

  if (rows.length === 0) return null;

  return (
    <Paper
      sx={{
        backgroundColor: theme.palette.surfaces.containerLow,
        border: `1px solid ${theme.palette.outlineVariant}`,
        gridColumn: { lg: '1 / -1' },
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: { xs: 2, md: 2.5 }, pb: 0 }}>
        <Typography variant="titleMedium" fontWeight={700} gutterBottom>
          Detalle por criterio
        </Typography>
        <Typography variant="labelSmall" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Promedio por practicante en cada criterio evaluado
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: 12,
                  backgroundColor: theme.palette.surfaces.container,
                  borderBottom: `1px solid ${theme.palette.outlineVariant}`,
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  minWidth: 160,
                }}
              >
                Practicante
              </TableCell>
              {criteria.map((c) => (
                <TableCell
                  key={c.code}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    backgroundColor: theme.palette.surfaces.container,
                    borderBottom: `1px solid ${theme.palette.outlineVariant}`,
                    minWidth: 120,
                  }}
                >
                  {c.displayName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selectedPractitionerId === row.practitionerId;
              return (
                <TableRow
                  key={row.practitionerId}
                  hover
                  onClick={() => onPractitionerClick?.(row.practitionerId)}
                  sx={{
                    cursor: onPractitionerClick ? 'pointer' : 'default',
                    backgroundColor: isSelected
                      ? alpha(theme.palette.primary.main, 0.08)
                      : 'transparent',
                    '&:last-child td': { borderBottom: 0 },
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 13,
                      borderBottom: `1px solid ${theme.palette.outlineVariant}`,
                      position: 'sticky',
                      left: 0,
                      backgroundColor: isSelected
                        ? alpha(theme.palette.primary.main, 0.08)
                        : theme.palette.surfaces.containerLow,
                      zIndex: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {row.combinedRank && (
                        <Typography
                          variant="labelSmall"
                          fontWeight={700}
                          sx={{
                            color: row.combinedRank <= 3
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                            minWidth: 24,
                          }}
                        >
                          #{row.combinedRank}
                        </Typography>
                      )}
                      {row.practitionerName}
                    </Box>
                  </TableCell>
                  {criteria.map((c) => {
                    const score = row.scores[c.code];
                    return (
                      <TableCell
                        key={c.code}
                        align="center"
                        sx={{
                          borderBottom: `1px solid ${theme.palette.outlineVariant}`,
                          backgroundColor: score != null ? getCellColor(score) : 'transparent',
                          fontWeight: 600,
                          fontSize: 13,
                          transition: 'background-color 200ms ease',
                        }}
                      >
                        {score != null ? score.toFixed(2) : '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
