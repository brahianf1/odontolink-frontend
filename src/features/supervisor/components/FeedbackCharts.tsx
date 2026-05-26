import {
  Alert,
  Box,
  CircularProgress,
  Paper,
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
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
      }}
    >
      {combinedRanking && (
        <CombinedRankingChart
          data={combinedRanking}
          selectedPractitionerId={selectedPractitionerId}
          onPractitionerClick={onPractitionerClick}
          globalAverage={globalAverage}
        />
      )}

      {criterionCharts.map((chart, index) => (
        <CriterionChart
          key={chart.criterion.code}
          data={chart}
          selectedPractitionerId={selectedPractitionerId}
          onPractitionerClick={onPractitionerClick}
          colorIndex={index + 1}
        />
      ))}
    </Box>
  );
}
