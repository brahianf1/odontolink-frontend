import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  AddProgressNoteDialog,
  CancelAttentionDialog,
  useAttentionDetail,
} from '../../features/practitioner';
import {
  CancelAppointmentDialog,
  useAppointments,
} from '../../features/practitionerSchedule';
import {
  AppointmentHistorySection,
  AppointmentTimelineItem,
  AttentionBreadcrumbs,
  AttentionDetailHeader,
  ConfirmAttentionActionDialog,
  PatientSummaryCard,
  ProgressNotesSection,
  TreatmentSummaryCard,
  checkAttentionTermination,
  terminationBlockerMessage,
} from '../../features/attentions';
import type { AppointmentResponseDTO } from '../../types/attention.types';

export default function AttentionDetailPage() {
  const navigate = useNavigate();
  const { attentionId } = useParams<{ attentionId: string }>();
  const numericId = Number(attentionId) || null;

  const {
    attention,
    notes,
    loading,
    mutating,
    feedback,
    reload,
    addNote,
    finalize,
    cancel: cancelAttn,
    clearFeedback,
  } = useAttentionDetail(numericId);

  const {
    mutatingId,
    feedback: scheduleFeedback,
    complete,
    markNoShow,
    cancel: cancelAppointment,
    clearFeedback: clearScheduleFeedback,
  } = useAppointments();

  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [cancelAttnOpen, setCancelAttnOpen] = useState(false);
  const [cancelAppointmentTarget, setCancelAppointmentTarget] =
    useState<AppointmentResponseDTO | null>(null);

  // The schedule hook keeps its own appointments copy and updates it in
  // place after a mutation, but this page renders `attention.appointments`
  // which is owned by useAttentionDetail. Reload the attention after every
  // appointment mutation so the timeline reflects the new status and the
  // termination predicate re-evaluates correctly.
  const handleComplete = async (id: number) => {
    await complete(id);
    await reload();
  };

  const handleNoShow = async (id: number) => {
    await markNoShow(id);
    await reload();
  };

  // Close the modal once the mutation succeeds — the hook already refreshed
  // the local attention state.
  useEffect(() => {
    if (feedback.success === 'Atención finalizada.') setFinalizeOpen(false);
    if (feedback.success === 'Caso clínico cancelado.') setCancelAttnOpen(false);
  }, [feedback.success]);

  const termination = attention ? checkAttentionTermination(attention) : null;
  const blockerMessage = termination ? terminationBlockerMessage(termination) : null;
  const canTerminate = termination?.canTerminate ?? false;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!attention) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {feedback.error ?? 'No se encontró la atención solicitada.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/practitioner/attentions')}
        >
          Volver al listado
        </Button>
      </Box>
    );
  }

  const isInProgress = attention.status === 'IN_PROGRESS';

  const pendingMessage =
    isInProgress && termination?.blocker === 'FUTURE_SCHEDULED'
      ? `Hay ${termination.futureScheduledCount} turno${termination.futureScheduledCount === 1 ? '' : 's'} programado${termination.futureScheduledCount === 1 ? '' : 's'}. Para finalizar el caso, cancelalos o marcalos como asistidos/no asistidos primero.`
      : isInProgress && termination?.blocker === 'PAST_UNMARKED'
      ? `Hay ${termination.pastUnmarkedCount} turno${termination.pastUnmarkedCount === 1 ? '' : 's'} pasado${termination.pastUnmarkedCount === 1 ? '' : 's'} sin marcar. Marcalos como asistidos o no asistidos para poder finalizar el caso.`
      : null;

  const renderAppointmentItem = (appt: AppointmentResponseDTO) => {
    const isScheduled = appt.status === 'SCHEDULED';
    const isBusy = mutatingId === appt.id;
    return (
      <AppointmentTimelineItem
        appointment={appt}
        actions={
          isScheduled && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<CheckCircleIcon />}
                disabled={isBusy}
                onClick={() => void handleComplete(appt.id)}
              >
                Asistió
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                disabled={isBusy}
                onClick={() => void handleNoShow(appt.id)}
              >
                No asistió
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                disabled={isBusy}
                onClick={() => setCancelAppointmentTarget(appt)}
              >
                Cancelar turno
              </Button>
            </Stack>
          )
        }
      />
    );
  };

  return (
    <Box>
      <AttentionBreadcrumbs
        crumbs={[
          { label: 'Atenciones', to: '/practitioner/attentions' },
          { label: `Atención #${attention.id}` },
        ]}
      />

      <AttentionDetailHeader
        attention={attention}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/practitioner/attentions')}
            >
              Volver
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => void reload()}
            >
              Refrescar
            </Button>
            {isInProgress && (
              <Tooltip
                title={blockerMessage ?? ''}
                disableHoverListener={!blockerMessage}
              >
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setFinalizeOpen(true)}
                    disabled={mutating || !canTerminate}
                  >
                    Finalizar
                  </Button>
                </span>
              </Tooltip>
            )}
            {isInProgress && (
              <Tooltip
                title={blockerMessage ?? ''}
                disableHoverListener={!blockerMessage}
              >
                <span>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<BlockIcon />}
                    onClick={() => setCancelAttnOpen(true)}
                    disabled={mutating || !canTerminate}
                  >
                    Cancelar caso
                  </Button>
                </span>
              </Tooltip>
            )}
          </>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          mb: 3,
        }}
      >
        <PatientSummaryCard attention={attention} />
        <TreatmentSummaryCard attention={attention} />
      </Box>

      <AppointmentHistorySection
        appointments={attention.appointments}
        pendingMessage={pendingMessage}
        renderItem={renderAppointmentItem}
      />

      <ProgressNotesSection
        notes={notes}
        headerAction={
          isInProgress && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddNoteOpen(true)}
            >
              Agregar evolución
            </Button>
          )
        }
      />

      <AddProgressNoteDialog
        open={addNoteOpen}
        attentionLabel={`${attention.patientName} · ${attention.treatmentName}`}
        submitting={mutating}
        onClose={() => setAddNoteOpen(false)}
        onSubmit={async (content) => {
          const ok = await addNote(content);
          if (ok) setAddNoteOpen(false);
          return ok;
        }}
      />

      <ConfirmAttentionActionDialog
        open={finalizeOpen}
        title="Finalizar atención"
        message={
          <>
            Vas a finalizar la atención de <strong>{attention.patientName}</strong> —{' '}
            <strong>{attention.treatmentName}</strong>. Una vez finalizada, ya no podrás
            agregar más notas de evolución. El historial clínico se conserva.
          </>
        }
        warning={finalizeOpen ? feedback.error ?? undefined : undefined}
        confirmLabel={mutating ? 'Finalizando…' : 'Finalizar'}
        confirmColor="success"
        loading={mutating}
        onConfirm={() => void finalize()}
        onClose={() => {
          setFinalizeOpen(false);
          clearFeedback();
        }}
      />

      <CancelAttentionDialog
        open={cancelAttnOpen}
        attention={attention}
        submitting={mutating}
        errorMessage={cancelAttnOpen ? feedback.error : null}
        onClose={() => {
          setCancelAttnOpen(false);
          clearFeedback();
        }}
        onConfirm={async (reason) => {
          await cancelAttn(reason);
        }}
      />

      <CancelAppointmentDialog
        open={Boolean(cancelAppointmentTarget)}
        appointment={cancelAppointmentTarget}
        submitting={mutatingId === cancelAppointmentTarget?.id}
        onClose={() => setCancelAppointmentTarget(null)}
        onConfirm={async (id, reason) => {
          await cancelAppointment(id, reason);
          setCancelAppointmentTarget(null);
          await reload();
        }}
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
        open={Boolean(feedback.error) && !finalizeOpen && !cancelAttnOpen}
        autoHideDuration={5000}
        onClose={clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" onClose={clearFeedback}>
          {feedback.error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(scheduleFeedback.success)}
        autoHideDuration={3500}
        onClose={clearScheduleFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={clearScheduleFeedback}>
          {scheduleFeedback.success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(scheduleFeedback.error)}
        autoHideDuration={5000}
        onClose={clearScheduleFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" onClose={clearScheduleFeedback}>
          {scheduleFeedback.error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
