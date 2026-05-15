import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Add, MedicalServices } from '@mui/icons-material';
import {
  DeleteOfferConfirmDialog,
  EmptyState,
  OfferEditDialog,
  OfferStatusFilter,
  OfferWizardDialog,
  PauseOfferDialog,
  TreatmentCard,
  TreatmentList,
  TreatmentsViewSwitcher,
  deriveBucket,
  useMyAttentions,
  useOfferedTreatments,
  useTreatmentsViewStore,
} from '../../features/practitioner';
import type { TreatmentsFilter } from '../../features/practitioner';
import type { OfferedTreatmentResponseDTO } from '../../types/practitioner.types';

export default function TreatmentsPage() {
  const {
    offers,
    catalog,
    loading,
    mutatingId,
    feedback,
    create,
    update,
    remove,
    pause,
    resume,
    reactivate,
    clearFeedback,
  } = useOfferedTreatments();
  const { attentions } = useMyAttentions();
  const { view, filter, setView, setFilter } = useTreatmentsViewStore();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OfferedTreatmentResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfferedTreatmentResponseDTO | null>(null);
  const [pauseTarget, setPauseTarget] = useState<OfferedTreatmentResponseDTO | null>(null);

  const completedByTreatment = useMemo(() => {
    const byTreatment = new Map<number, Set<number>>();
    attentions
      .filter((a) => a.status === 'COMPLETED')
      .forEach((a) => {
        const set = byTreatment.get(a.treatmentId) ?? new Set<number>();
        set.add(a.patientId);
        byTreatment.set(a.treatmentId, set);
      });
    return new Map<number, number>(
      Array.from(byTreatment.entries()).map(([k, v]) => [k, v.size])
    );
  }, [attentions]);

  const counts = useMemo(() => {
    const init: Record<TreatmentsFilter, number> = {
      ALL: offers.length,
      ACTIVE: 0,
      PAUSED: 0,
      INACTIVE: 0,
      EXPIRED: 0,
    };
    offers.forEach((o) => {
      init[deriveBucket(o)] += 1;
    });
    return init;
  }, [offers]);

  const filteredOffers = useMemo(() => {
    if (filter === 'ALL') return offers;
    return offers.filter((o) => deriveBucket(o) === filter);
  }, [filter, offers]);

  const handleDeleteConfirm = async (id: number) => {
    const result = await remove(id);
    if (result) setDeleteTarget(null);
  };

  const handlePauseConfirm = async (id: number) => {
    const ok = await pause(id);
    if (ok) setPauseTarget(null);
  };

  const handleResume = async (offer: OfferedTreatmentResponseDTO) => {
    await resume(offer.id);
  };

  const handleReactivate = async (offer: OfferedTreatmentResponseDTO) => {
    const outcome = await reactivate(offer.id);
    if (outcome.ok && outcome.expired) {
      // The toast already nudges; if user wants to renew dates immediately,
      // the EXPIRED card now shows "Renovar fechas" as its primary action.
      // We could auto-open the edit dialog here, but that feels pushy.
    }
  };

  const handleRenewDates = (offer: OfferedTreatmentResponseDTO) => {
    setEditTarget(offer);
  };

  const cardActions = {
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
    onPause: setPauseTarget,
    onResume: handleResume,
    onReactivate: handleReactivate,
    onRenewDates: handleRenewDates,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const hasOffers = offers.length > 0;
  const showEmptyAll = !hasOffers;
  const showEmptyFiltered = hasOffers && filteredOffers.length === 0;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Mis Tratamientos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra tu catálogo y revisá el estado de cada oferta
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {hasOffers && <TreatmentsViewSwitcher value={view} onChange={setView} />}
          <Button variant="contained" startIcon={<Add />} onClick={() => setWizardOpen(true)}>
            Nueva oferta
          </Button>
        </Stack>
      </Stack>

      {hasOffers && (
        <Box sx={{ mb: 3 }}>
          <OfferStatusFilter value={filter} counts={counts} onChange={setFilter} />
        </Box>
      )}

      {showEmptyAll && (
        <EmptyState
          icon={<MedicalServices />}
          title="Aún no tienes tratamientos publicados"
          description="Creá tu primera oferta para que los pacientes puedan reservar contigo. Vas a definir el período, el cupo, los horarios y las indicaciones."
          actionLabel="Crear mi primera oferta"
          onAction={() => setWizardOpen(true)}
        />
      )}

      {showEmptyFiltered && (
        <EmptyState
          icon={<MedicalServices />}
          title={emptyFilterTitle(filter)}
          description="No hay ofertas en este filtro. Cambiá el filtro para ver el resto de tu catálogo."
          actionLabel="Ver activas"
          onAction={() => setFilter('ACTIVE')}
          tone="neutral"
        />
      )}

      {!showEmptyAll && !showEmptyFiltered && view === 'cards' && (
        <Grid container spacing={3}>
          {filteredOffers.map((offer) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={offer.id}>
              <TreatmentCard
                treatment={offer}
                completedPatientsCount={completedByTreatment.get(offer.treatment.id)}
                busy={mutatingId === offer.id}
                {...cardActions}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {!showEmptyAll && !showEmptyFiltered && view === 'list' && (
        <TreatmentList
          offers={filteredOffers}
          completedByTreatment={completedByTreatment}
          mutatingId={mutatingId}
          {...cardActions}
        />
      )}

      <OfferWizardDialog
        open={wizardOpen}
        catalog={catalog}
        alreadyOffered={offers}
        submitting={mutatingId === -1}
        onClose={() => setWizardOpen(false)}
        onSubmit={create}
      />

      <OfferEditDialog
        open={editTarget != null}
        offer={editTarget}
        submitting={mutatingId === editTarget?.id}
        onClose={() => setEditTarget(null)}
        onSubmit={update}
      />

      <DeleteOfferConfirmDialog
        open={deleteTarget != null}
        offer={deleteTarget}
        submitting={mutatingId === deleteTarget?.id}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <PauseOfferDialog
        open={pauseTarget != null}
        offer={pauseTarget}
        submitting={mutatingId === pauseTarget?.id}
        onClose={() => setPauseTarget(null)}
        onConfirm={handlePauseConfirm}
      />

      <Snackbar
        open={Boolean(feedback.success)}
        autoHideDuration={3500}
        onClose={clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={clearFeedback}>
          {feedback.success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(feedback.info)}
        autoHideDuration={7000}
        onClose={clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" variant="filled" onClose={clearFeedback}>
          {feedback.info}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(feedback.error)}
        autoHideDuration={5000}
        onClose={clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" onClose={clearFeedback}>
          {feedback.error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const emptyFilterTitle = (filter: TreatmentsFilter): string => {
  switch (filter) {
    case 'INACTIVE':
      return 'No tenés ofertas archivadas';
    case 'EXPIRED':
      return 'No tenés ofertas vencidas';
    case 'PAUSED':
      return 'No tenés ofertas pausadas';
    case 'ACTIVE':
      return 'No tenés ofertas activas en este momento';
    default:
      return 'No hay ofertas que coincidan';
  }
};
