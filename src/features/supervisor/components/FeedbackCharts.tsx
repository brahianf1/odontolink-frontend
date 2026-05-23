import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
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
import { useTheme } from '@mui/material/styles';
import { useFeedbackCharts } from '../hooks/useFeedbackCharts';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff', '#818cf8', '#7c3aed', '#5b21b6'];

function ChartEmptyState({ message }: { message: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default function FeedbackCharts() {
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
      <Alert severity="info" sx={{ mb: 3 }}>
        No hay datos suficientes para generar los gráficos de rendimiento.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
        mb: 3,
      }}
    >
      {criterionCharts.map((chart) => (
        <Card key={chart.criterion.code} variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Top practicantes — {chart.criterion.displayName}
            </Typography>
            {chart.minSamplesThreshold > 1 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Solo practicantes con {chart.minSamplesThreshold}+ feedbacks
              </Typography>
            )}

            {chart.entries.length === 0 ? (
              <ChartEmptyState message="Sin datos suficientes para este criterio" />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, chart.entries.length * 40 + 40)}>
                <BarChart
                  data={chart.entries}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} tickCount={6} />
                  <YAxis
                    type="category"
                    dataKey="practitionerName"
                    width={120}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip
                    formatter={(value, _name, props) => [
                      `${Number(value).toFixed(2)} (${(props.payload as { feedbackCount: number }).feedbackCount} feedbacks)`,
                      'Promedio',
                    ]}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                    {chart.entries.map((_entry, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      ))}

      {combinedRanking && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Ranking combinado de practicantes
            </Typography>
            {combinedRanking.criteriaUsed.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Promedio de: {combinedRanking.criteriaUsed.map((c) => c.displayName).join(', ')}
              </Typography>
            )}
            {combinedRanking.minSamplesThreshold > 1 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Solo practicantes con {combinedRanking.minSamplesThreshold}+ feedbacks
              </Typography>
            )}

            {combinedRanking.entries.length === 0 ? (
              <ChartEmptyState message="Sin datos suficientes para el ranking" />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, combinedRanking.entries.length * 40 + 40)}>
                <BarChart
                  data={combinedRanking.entries}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} tickCount={6} />
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
                        `${Number(value).toFixed(2)} (${payload.feedbackCount} feedbacks)\n${details}`,
                        'Promedio combinado',
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="combinedAverage" radius={[0, 4, 4, 0]}>
                    {combinedRanking.entries.map((_entry, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
