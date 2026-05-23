import { useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
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
import FeedbackCharts from '../../features/supervisor/components/FeedbackCharts';
import RatingDisplay from '../../features/supervisor/components/RatingDisplay';
import type {
  FeedbackDashboardQuery,
  FeedbackDirection,
} from '../../types/supervisor.types';

const DEFAULT_RESET_QUERY: FeedbackDashboardQuery = {
  page: 0,
  size: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

type DirectionTab = 'ALL' | FeedbackDirection;

const renderAverage = (
  total: number,
  average: number,
  loading: boolean
) => {
  if (loading) return '—';
  if (!total) return 'Sin datos';
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <span>{average.toFixed(2)}</span>
      <RatingDisplay value={average} showValue={false} size="medium" />
    </Stack>
  );
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

  const directionTab: DirectionTab = query.direction ?? 'ALL';

  const handleDirectionChange = useCallback(
    (_event: React.SyntheticEvent, value: DirectionTab) => {
      setQuery((prev) => ({
        ...prev,
        direction: value === 'ALL' ? undefined : value,
        page: 0,
      }));
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
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          mb: 3,
        }}
      >
        <FeedbackMetricCard
          title="Calificación recibida del paciente"
          icon={<StarIcon />}
          loading={loading}
          value={
            data
              ? renderAverage(
                  data.totalPatientToPractitioner,
                  data.averageRatingPatientToPractitioner,
                  loading
                )
              : '—'
          }
          caption={
            data
              ? `${data.totalPatientToPractitioner.toLocaleString('es-AR')} feedbacks de pacientes`
              : 'Métrica clave para evaluación docente'
          }
        />
        <FeedbackMetricCard
          title="Calificación dada al paciente"
          icon={<ForumIcon />}
          loading={loading}
          value={
            data
              ? renderAverage(
                  data.totalPractitionerToPatient,
                  data.averageRatingPractitionerToPatient,
                  loading
                )
              : '—'
          }
          caption={
            data
              ? `${data.totalPractitionerToPatient.toLocaleString('es-AR')} feedbacks del practicante`
              : 'Calificación complementaria'
          }
        />
        <FeedbackMetricCard
          title="Total bidireccional"
          icon={<ForumIcon />}
          loading={loading}
          value={
            data
              ? (
                  data.totalPatientToPractitioner +
                  data.totalPractitionerToPatient
                ).toLocaleString('es-AR')
              : '—'
          }
          caption="Suma de ambas direcciones según filtros"
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

      <FeedbackCharts />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={directionTab}
        onChange={handleDirectionChange}
        sx={{ mb: 2 }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab value="ALL" label="Todos los feedbacks" />
        <Tab value="PATIENT_TO_PRACTITIONER" label="Recibidos del paciente" />
        <Tab value="PRACTITIONER_TO_PATIENT" label="Dados al paciente" />
      </Tabs>

      <FeedbackTable
        page={data?.feedbacks ?? null}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
}
