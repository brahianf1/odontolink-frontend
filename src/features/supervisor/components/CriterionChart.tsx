import { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import type { TopByCriterionResponseDTO } from '../../../types/feedback.types';
import { useCriterionTooltip } from './CriterionTooltip';

interface CriterionChartProps {
  data: TopByCriterionResponseDTO;
  selectedPractitionerId?: number | null;
  onPractitionerClick?: (practitionerId: number) => void;
  colorIndex?: number;
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

export default function CriterionChart({
  data,
  selectedPractitionerId,
  onPractitionerClick,
  colorIndex = 1,
}: CriterionChartProps) {
  const theme = useTheme();

  const chartColors = theme.palette.charts as unknown as string[];
  const baseColor = chartColors?.[colorIndex % chartColors.length] ?? theme.palette.primary.main;
  const totalEntries = data.entries.length;

  const criterionAverage = useMemo(() => {
    if (data.entries.length === 0) return 0;
    return data.entries.reduce((sum, e) => sum + e.average, 0) / data.entries.length;
  }, [data.entries]);

  const TooltipContent = useCriterionTooltip(data.criterion.displayName, criterionAverage, baseColor);

  const getRankOpacity = (rankPosition: number): number => {
    if (totalEntries <= 1) return 1;
    const MAX = 1.0;
    const MIN = 0.35;
    return MAX - (rankPosition - 1) * ((MAX - MIN) / (totalEntries - 1));
  };

  const getBarFill = (entry: { practitionerId: number; rankPosition: number }) => {
    const color = alpha(baseColor, getRankOpacity(entry.rankPosition));
    if (!selectedPractitionerId) return color;
    if (entry.practitionerId === selectedPractitionerId) return color;
    return alpha(baseColor, 0.12);
  };

  const handleBarClick = (barData: Record<string, unknown>) => {
    if (onPractitionerClick && typeof barData.practitionerId === 'number') {
      onPractitionerClick(barData.practitionerId);
    }
  };

  const renderYAxisTick = (props: {
    x: number;
    y: number;
    payload: { value: string };
  }) => {
    const { x, y, payload } = props;
    const entry = data.entries.find((e) => e.practitionerName === payload.value);
    const rank = entry?.rankPosition ?? 0;
    const isSelected = entry?.practitionerId === selectedPractitionerId;
    const isTop3 = rank <= 3;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-8}
          y={0}
          dy={4}
          textAnchor="end"
          fontSize={12}
          fontWeight={isSelected ? 700 : 400}
          fill={isSelected ? theme.palette.text.primary : theme.palette.text.secondary}
        >
          {payload.value}
        </text>
        <text
          x={-125}
          y={0}
          dy={4}
          textAnchor="end"
          fontSize={11}
          fontWeight={700}
          fill={isTop3 ? baseColor : theme.palette.text.secondary}
        >
          #{rank}
        </text>
      </g>
    );
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 2.5 },
        backgroundColor: theme.palette.surfaces.containerLow,
        border: `1px solid ${theme.palette.outlineVariant}`,
      }}
    >
      <Typography variant="titleMedium" fontWeight={700} gutterBottom>
        {data.criterion.displayName}
      </Typography>
      {data.minSamplesThreshold > 1 && (
        <Typography variant="labelSmall" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Mín. {data.minSamplesThreshold} evaluaciones recibidas
        </Typography>
      )}

      {data.entries.length === 0 ? (
        <ChartEmptyState message="Sin datos suficientes" />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(180, data.entries.length * 44 + 30)}>
          <BarChart
            data={data.entries}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.outlineVariant} />
            <XAxis
              type="number"
              domain={[0, 5]}
              tickCount={6}
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
            />
            <YAxis
              type="category"
              dataKey="practitionerName"
              width={150}
              tick={renderYAxisTick as never}
            />
            <Tooltip
              content={TooltipContent}
              cursor={{ fill: alpha(baseColor, 0.06) }}
            />
            <ReferenceLine
              x={criterionAverage}
              stroke={theme.palette.text.secondary}
              strokeDasharray="4 4"
              label={{
                value: `Media: ${criterionAverage.toFixed(1)}`,
                position: 'top',
                fontSize: 11,
                fill: theme.palette.text.secondary,
              }}
            />
            <Bar
              dataKey="average"
              radius={[0, 2, 2, 0]}
              cursor={onPractitionerClick ? 'pointer' : 'default'}
              onClick={(barData) => handleBarClick(barData as unknown as Record<string, unknown>)}
            >
              <LabelList
                dataKey="average"
                position="right"
                formatter={(v: number) => v.toFixed(2)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: theme.palette.text.primary,
                }}
              />
              {data.entries.map((entry, index) => (
                <Cell
                  key={index}
                  fill={getBarFill(entry)}
                  stroke={selectedPractitionerId === entry.practitionerId ? baseColor : 'none'}
                  strokeWidth={selectedPractitionerId === entry.practitionerId ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
