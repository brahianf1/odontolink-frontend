import { useCallback, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Rating,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useFeedbackDashboard } from '../../features/supervisor/hooks/useFeedbackDashboard';
import { useMyPractitioners } from '../../features/supervisor/hooks/useMyPractitioners';
import FeedbackFiltersBar from '../../features/supervisor/components/FeedbackFiltersBar';
import FeedbackTable from '../../features/supervisor/components/FeedbackTable';
import FeedbackCharts from '../../features/supervisor/components/FeedbackCharts';
import type { FeedbackDashboardQuery } from '../../types/supervisor.types';

const DEFAULT_QUERY: FeedbackDashboardQuery = {
  page: 0,
  size: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  direction: 'PATIENT_TO_PRACTITIONER',
};

export default function FeedbackDashboardPage() {
  const theme = useTheme();
  const { data, loading, error, query, setQuery, refresh } = useFeedbackDashboard({
    direction: 'PATIENT_TO_PRACTITIONER',
  });
  const { practitioners, loading: practitionersLoading } = useMyPractitioners();

  const selectedPractitioner = useMemo(() => {
    if (!query.practitionerId) return null;
    return practitioners.find((p) => p.id === query.practitionerId) ?? null;
  }, [query.practitionerId, practitioners]);

  const handleQueryChange = useCallback(
    (next: FeedbackDashboardQuery) => {
      setQuery(() => ({ ...next, direction: 'PATIENT_TO_PRACTITIONER' }));
    },
    [setQuery]
  );

  const handleReset = useCallback(() => {
    setQuery(() => ({ ...DEFAULT_QUERY }));
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

  const handlePractitionerClick = useCallback(
    (practitionerId: number) => {
      setQuery((prev) => ({
        ...prev,
        practitionerId,
        direction: 'PATIENT_TO_PRACTITIONER' as const,
        page: 0,
      }));
    },
    [setQuery]
  );

  const avgPtoP = data?.averageRatingPatientToPractitioner ?? 0;
  const totalPtoP = data?.totalPatientToPractitioner ?? 0;

  return (
    <Box>
      {/* ── Header ── */}
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
          <Typography variant="bodyMedium" color="text.secondary">
            Evaluaciones que los pacientes dejaron sobre tus practicantes a cargo.
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

      {/* ── KPI summary (P→Pr only, reactive to filters) ── */}
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          backgroundColor: theme.palette.primary.container,
          color: theme.palette.primary.onContainer,
          border: `1px solid ${theme.palette.outlineVariant}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2.5, sm: 4 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          {/* Average score */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {loading ? (
              <Typography variant="displaySmall" fontWeight={700} sx={{ lineHeight: 1, opacity: 0.4 }}>
                —
              </Typography>
            ) : totalPtoP === 0 ? (
              <Typography variant="titleLarge" fontWeight={600}>
                Sin evaluaciones aún
              </Typography>
            ) : (
              <>
                <Typography variant="displaySmall" fontWeight={700} sx={{ lineHeight: 1 }}>
                  {avgPtoP.toFixed(1)}
                </Typography>
                <Box>
                  <Rating value={avgPtoP} readOnly precision={0.1} size="medium" />
                  <Typography variant="labelSmall" sx={{ display: 'block' }}>
                    {selectedPractitioner
                      ? `${selectedPractitioner.user.firstName} ${selectedPractitioner.user.lastName}`
                      : 'Promedio general'}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>

          {totalPtoP > 0 && (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: 'inherit', opacity: 0.25, display: { xs: 'none', sm: 'block' } }}
              />
              <Divider sx={{ borderColor: 'inherit', opacity: 0.25, display: { xs: 'block', sm: 'none' }, width: '100%' }} />

              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="titleLarge" fontWeight={700}>
                    {totalPtoP}
                  </Typography>
                  <Typography variant="labelSmall">
                    {totalPtoP === 1 ? 'evaluación' : 'evaluaciones'}
                  </Typography>
                </Box>
                <Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <SchoolIcon sx={{ fontSize: 20 }} />
                    <Typography variant="titleLarge" fontWeight={700}>
                      {practitioners.length}
                    </Typography>
                  </Stack>
                  <Typography variant="labelSmall">
                    practicantes
                  </Typography>
                </Box>
              </Stack>
            </>
          )}

          {selectedPractitioner && (
            <>
              <Box sx={{ flex: 1 }} />
              <Chip
                label={`Filtrando: ${selectedPractitioner.user.firstName} ${selectedPractitioner.user.lastName}`}
                onDelete={handleReset}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                  fontWeight: 600,
                  '& .MuiChip-deleteIcon': { color: 'inherit', opacity: 0.7 },
                }}
              />
            </>
          )}
        </Stack>
      </Paper>

      {/* ── Charts (interactive — click to filter by practitioner) ── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 2 }}>
          <Typography variant="titleMedium" fontWeight={700}>
            Rendimiento comparativo
          </Typography>
          <Typography variant="labelSmall" color="text.secondary">
            Tocá una barra para filtrar por practicante
          </Typography>
        </Stack>
        <FeedbackCharts onPractitionerClick={handlePractitionerClick} />
      </Box>

      {/* ── Filters + Table (grouped) ── */}
      <Paper
        sx={{
          backgroundColor: theme.palette.surfaces.containerLow,
          border: `1px solid ${theme.palette.outlineVariant}`,
          overflow: 'hidden',
        }}
      >
        {/* Filters header */}
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          <Typography variant="titleMedium" fontWeight={700} sx={{ mb: 2 }}>
            Evaluaciones de pacientes
          </Typography>
          <FeedbackFiltersBar
            query={query}
            practitioners={practitioners}
            practitionersLoading={practitionersLoading}
            onChange={handleQueryChange}
            onReset={handleReset}
          />
        </Box>

        <Divider sx={{ borderColor: theme.palette.outlineVariant }} />

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <Box sx={{ p: { xs: 0, md: 0 } }}>
          <FeedbackTable
            page={data?.feedbacks ?? null}
            loading={loading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Box>
      </Paper>
    </Box>
  );
}
