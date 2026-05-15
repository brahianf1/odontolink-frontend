import { useCallback } from 'react';
import { Box, Typography, Stack, Button, Alert, Card, CardContent } from '@mui/material';
import {
  Refresh as RefreshIcon,
  StarRate as StarIcon,
  Forum as ForumIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useFeedbackDashboard } from '../../features/supervisor/hooks/useFeedbackDashboard';
import { useMyPractitioners } from '../../features/supervisor/hooks/useMyPractitioners';
import FeedbackMetricCard from '../../features/supervisor/components/FeedbackMetricCard';
import FeedbackFiltersBar from '../../features/supervisor/components/FeedbackFiltersBar';
import FeedbackTable from '../../features/supervisor/components/FeedbackTable';
import RatingDisplay from '../../features/supervisor/components/RatingDisplay';
import type { FeedbackDashboardQuery } from '../../types/supervisor.types';

const DEFAULT_RESET_QUERY: FeedbackDashboardQuery = {
  page: 0,
  size: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

export default function FeedbackDashboardPage() {
  const { data, loading, error, query, setQuery, refresh } = useFeedbackDashboard();
  const { practitioners, loading: practitionersLoading } = useMyPractitioners();

  const handleQueryChange = useCallback(
    (next: FeedbackDashboardQuery) => {
      setQuery(() => next);
    },
    [setQuery]
  );

  const handleReset = useCallback(() => {
    setQuery(() => ({ ...DEFAULT_RESET_QUERY }));
  }, [setQuery]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setQuery((prev) => ({ ...prev, page: newPage }));
    },
    [setQuery]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setQuery((prev) => ({ ...prev, size: newSize, page: 0 }));
    },
    [setQuery]
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Panel docente de feedback
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supervisión de calificaciones y comentarios sobre las atenciones brindadas.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void refresh()}
          disabled={loading}
        >
          Refrescar
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          mb: 3,
        }}
      >
        <FeedbackMetricCard
          title="Promedio general"
          icon={<StarIcon />}
          loading={loading}
          value={
            data ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{data.averageRating.toFixed(2)}</span>
                <RatingDisplay value={data.averageRating} showValue={false} size="medium" />
              </Stack>
            ) : (
              '—'
            )
          }
          caption="Promedio sobre los feedbacks filtrados"
        />
        <FeedbackMetricCard
          title="Total de feedbacks"
          icon={<ForumIcon />}
          loading={loading}
          value={data ? data.totalFeedbacksCount.toLocaleString('es-AR') : '—'}
          caption="Coincidencias con los filtros aplicados"
        />
        <FeedbackMetricCard
          title="Practicantes a cargo"
          icon={<SchoolIcon />}
          loading={practitionersLoading}
          value={practitioners.length}
          caption="Universo bajo tu supervisión"
        />
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <FeedbackFiltersBar
            query={query}
            practitioners={practitioners}
            practitionersLoading={practitionersLoading}
            onChange={handleQueryChange}
            onReset={handleReset}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <FeedbackTable
        page={data?.feedbacks ?? null}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
}
