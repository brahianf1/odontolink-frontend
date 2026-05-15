import { useState } from 'react';
import {
  Alert,
  Box,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import type { OfferedTreatmentResponseDTO } from '../../types/practitioner.types';
import {
  AppointmentBookingDialog,
  EmptyState,
  TreatmentCard,
  TreatmentFiltersBar,
  useAvailableTreatments,
} from '../../features/patient';

const PAGE_SIZE = 12;

export default function TreatmentsPage() {
  const {
    treatments,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    totalElements,
    totalPages,
    loading,
    error,
    reload,
  } = useAvailableTreatments(PAGE_SIZE);

  const [selected, setSelected] = useState<OfferedTreatmentResponseDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBook = (treatment: OfferedTreatmentResponseDTO) => {
    setSelected(treatment);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setSelected(null);
    reload();
  };

  const showSkeletons = loading && treatments.length === 0;
  const hasFiltersApplied =
    filters.keyword.trim() !== '' ||
    filters.specialty.trim() !== '' ||
    filters.availability !== '';

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
        >
          Catálogo de Tratamientos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explora los tratamientos disponibles y reserva tu turno con un practicante.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TreatmentFiltersBar
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          disabled={loading && treatments.length === 0}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={undefined}>
          {error}
        </Alert>
      )}

      {showSkeletons ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={280} />
          ))}
        </Box>
      ) : treatments.length === 0 ? (
        <EmptyState
          icon={<SearchOffIcon sx={{ fontSize: 36 }} />}
          title={
            hasFiltersApplied
              ? 'Sin coincidencias con los filtros aplicados'
              : 'Aún no hay tratamientos disponibles'
          }
          description={
            hasFiltersApplied
              ? 'Prueba ampliar la búsqueda o limpiar los filtros para ver más opciones.'
              : 'Cuando los practicantes publiquen su oferta, aparecerá aquí.'
          }
          actionLabel={hasFiltersApplied ? 'Limpiar filtros' : undefined}
          onAction={hasFiltersApplied ? resetFilters : undefined}
        />
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando {treatments.length} de {totalElements} tratamiento(s)
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {treatments.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} onBook={handleBook} />
            ))}
          </Box>

          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
                color="primary"
                shape="rounded"
                disabled={loading}
              />
            </Stack>
          )}
        </>
      )}

      {selected && (
        <AppointmentBookingDialog
          open={dialogOpen}
          treatment={selected}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
}
