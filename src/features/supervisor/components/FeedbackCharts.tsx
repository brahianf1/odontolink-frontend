import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme, alpha } from '@mui/material/styles';
import { useFeedbackCharts } from '../hooks/useFeedbackCharts';

interface FeedbackChartsProps {
  onPractitionerClick?: (practitionerId: number) => void;
  selectedPractitionerId?: number | null;
}

function ChartEmptyState({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
        backgroundColor: theme.palette.surfaces.container,
      }}
    >
      <Typography variant="bodyMedium" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default function FeedbackCharts({
  onPractitionerClick,
  selectedPractitionerId,
}: FeedbackChartsProps) {
  const { criterionCharts, combinedRanking, loading, error } = useFeedbackCharts();
  const theme = useTheme();

  const chartColors = theme.palette.charts?.length
    ? theme.palette.charts as unknown as string[]
    : ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#818cf8', '#7c3aed', '#5b21b6', '#4f46e5', '#312e81'];

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

  const handleBarClick = (data: Record<string, unknown>) => {
    if (onPractitionerClick && typeof data.practitionerId === 'number') {
      onPractitionerClick(data.practitionerId);
    }
  };

  const getBarFill = (entry: { practitionerId: number }, index: number) => {
    const baseColor = chartColors[index % chartColors.length];
    if (!selectedPractitionerId) return baseColor;
    if (entry.practitionerId === selectedPractitionerId) return baseColor;
    return alpha(baseColor, 0.2);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
      }}
    >
      {criterionCharts.map((chart) => (
        <Paper
          key={chart.criterion.code}
          sx={{
            p: { xs: 2, md: 2.5 },
            backgroundColor: theme.palette.surfaces.containerLow,
            border: `1px solid ${theme.palette.outlineVariant}`,
          }}
        >
          <Typography variant="titleMedium" fontWeight={700} gutterBottom>
            {chart.criterion.displayName}
          </Typography>
          {chart.minSamplesThreshold > 1 && (
            <Typography variant="labelSmall" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Mínimo {chart.minSamplesThreshold} evaluaciones para aparecer
            </Typography>
          )}

          {chart.entries.length === 0 ? (
            <ChartEmptyState message="Sin datos suficientes" />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, chart.entries.length * 40 + 30)}>
              <BarChart
                data={chart.entries}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.outlineVariant} />
                <XAxis type="number" domain={[0, 5]} tickCount={6} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                <YAxis
                  type="category"
                  dataKey="practitionerName"
                  width={120}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)}`, 'Promedio']}
                  contentStyle={{
                    backgroundColor: theme.palette.surfaces.containerHighest,
                    border: `1px solid ${theme.palette.outlineVariant}`,
                    borderRadius: 0,
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey="average"
                  radius={[0, 2, 2, 0]}
                  cursor={onPractitionerClick ? 'pointer' : 'default'}
                  onClick={(data) => handleBarClick(data as unknown as Record<string, unknown>)}
                >
                  {chart.entries.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={getBarFill(entry, index)}
                      stroke={selectedPractitionerId === entry.practitionerId ? theme.palette.primary.main : 'none'}
                      strokeWidth={selectedPractitionerId === entry.practitionerId ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      ))}

      {combinedRanking && (
        <Paper
          sx={{
            p: { xs: 2, md: 2.5 },
            backgroundColor: theme.palette.surfaces.containerLow,
            border: `1px solid ${theme.palette.outlineVariant}`,
          }}
        >
          <Typography variant="titleMedium" fontWeight={700} gutterBottom>
            Ranking combinado
          </Typography>
          {combinedRanking.criteriaUsed.length > 0 && (
            <Typography variant="labelSmall" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Promedio de: {combinedRanking.criteriaUsed.map((c) => c.displayName).join(', ')}
            </Typography>
          )}
          {combinedRanking.minSamplesThreshold > 1 && (
            <Typography variant="labelSmall" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Mínimo {combinedRanking.minSamplesThreshold} evaluaciones para aparecer
            </Typography>
          )}

          {combinedRanking.entries.length === 0 ? (
            <ChartEmptyState message="Sin datos suficientes" />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, combinedRanking.entries.length * 40 + 30)}>
              <BarChart
                data={combinedRanking.entries}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.outlineVariant} />
                <XAxis type="number" domain={[0, 5]} tickCount={6} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                <YAxis
                  type="category"
                  dataKey="practitionerName"
                  width={120}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <Tooltip
                  formatter={(value, _name, props) => {
                    const payload = props.payload as { feedbackCount: number; perCriterionAverages: Record<string, number> };
                    const details = combinedRanking.criteriaUsed
                      .map((c) => `${c.displayName}: ${(payload.perCriterionAverages[c.code] ?? 0).toFixed(2)}`)
                      .join(' · ');
                    return [
                      `${Number(value).toFixed(2)} (${payload.feedbackCount} eval.)\n${details}`,
                      'Combinado',
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: theme.palette.surfaces.containerHighest,
                    border: `1px solid ${theme.palette.outlineVariant}`,
                    borderRadius: 0,
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey="combinedAverage"
                  radius={[0, 2, 2, 0]}
                  cursor={onPractitionerClick ? 'pointer' : 'default'}
                  onClick={(data) => handleBarClick(data as unknown as Record<string, unknown>)}
                >
                  {combinedRanking.entries.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={getBarFill(entry, index)}
                      stroke={selectedPractitionerId === entry.practitionerId ? theme.palette.primary.main : 'none'}
                      strokeWidth={selectedPractitionerId === entry.practitionerId ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      )}
    </Box>
  );
}
