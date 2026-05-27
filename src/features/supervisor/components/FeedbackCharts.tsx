import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFeedbackCharts } from '../hooks/useFeedbackCharts';
import CombinedRankingChart from './CombinedRankingChart';
import CriterionChart from './CriterionChart';

interface FeedbackChartsProps {
  onPractitionerClick?: (practitionerId: number) => void;
  selectedPractitionerId?: number | null;
  globalAverage?: number;
}

export default function FeedbackCharts({
  onPractitionerClick,
  selectedPractitionerId,
  globalAverage,
}: FeedbackChartsProps) {
  const { criterionCharts, combinedRanking, loading, error } = useFeedbackCharts();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const activeChart = criterionCharts[activeTab];

  const activeCriterionAverage = useMemo(() => {
    if (!activeChart || activeChart.entries.length === 0) return 0;
    return activeChart.entries.reduce((sum, e) => sum + e.average, 0) / activeChart.entries.length;
  }, [activeChart]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>;
  }

  const hasAnyData = criterionCharts.some((c) => c.entries.length > 0) ||
    (combinedRanking && combinedRanking.entries.length > 0);

  if (!hasAnyData) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: theme.palette.surfaces.containerLow,
          border: `1px solid ${theme.palette.outlineVariant}`,
        }}
      >
        <Typography variant="titleMedium" fontWeight={600} gutterBottom>
          Sin datos suficientes
        </Typography>
        <Typography variant="bodyMedium" color="text.secondary">
          Los gráficos comparativos aparecerán cuando haya suficientes evaluaciones de pacientes.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {combinedRanking && (
        <CombinedRankingChart
          data={combinedRanking}
          selectedPractitionerId={selectedPractitionerId}
          onPractitionerClick={onPractitionerClick}
          globalAverage={globalAverage}
        />
      )}

      {criterionCharts.length > 0 && (
        <Paper
          sx={{
            backgroundColor: theme.palette.surfaces.containerLow,
            border: `1px solid ${theme.palette.outlineVariant}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
              <Typography variant="titleMedium" fontWeight={700}>
                Detalle por criterio
              </Typography>
              {activeCriterionAverage > 0 && (
                <Chip
                  label={`Promedio del criterio: ${activeCriterionAverage.toFixed(2)}`}
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.secondary.container,
                    color: theme.palette.secondary.onContainer,
                    fontWeight: 600,
                    fontSize: 12,
                    borderRadius: 0,
                  }}
                />
              )}
            </Stack>
            <Tabs
              value={activeTab}
              onChange={(_e, v: number) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 0,
                },
              }}
            >
              {criterionCharts.map((chart) => (
                <Tab key={chart.criterion.code} label={chart.criterion.displayName} />
              ))}
            </Tabs>
          </Box>

          {activeChart && (
            <Box sx={{ p: { xs: 2, md: 2.5 }, pt: 1 }}>
              <CriterionChart
                data={activeChart}
                selectedPractitionerId={selectedPractitionerId}
                onPractitionerClick={onPractitionerClick}
                colorIndex={activeTab + 1}
                compact
              />
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
