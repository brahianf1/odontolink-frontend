import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Block } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import {
  AddProgressNoteDialog,
  AttentionStatusChip,
  CancelAttentionDialog,
  FinalizeAttentionDialog,
  ProgressNoteTimeline,
  checkAttentionTermination,
  terminationBlockerMessage,
  useAttentionDetail,
} from '../../features/practitioner';
import {
  CancelAppointmentDialog,
  useAppointments,
} from '../../features/practitionerSchedule';
import type { AppointmentResponseDTO } from '../../types/attention.types';

export default function PatientEvolutionPage() {
  const { attentionId } = useParams();
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
    appointments,
    mutatingId,
    feedback: scheduleFeedback,
    complete,
    markNoShow,
    cancel,
    clearFeedback: clearScheduleFeedback,
  } = useAppointments();

  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [cancelAttnOpen, setCancelAttnOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<AppointmentResponseDTO | null>(null);

  const termination = attention
    ? checkAttentionTermination(attention)
    : null;
  const blockerMessage = termination ? terminationBlockerMessage(termination) : null;
  const canTerminate = termination?.canTerminate ?? false;

  // After successful termination (finalize OR cancel) close the modal —
  // the hook already updated the local attention state.
  useEffect(() => {
    if (feedback.success === 'Atención finalizada.') setFinalizeOpen(false);
    if (feedback.success === 'Caso clínico cancelado.') setCancelAttnOpen(false);
  }, [feedback.success]);

  const nextAppointment = attention
    ? appointments
        .filter(
          (a) =>
            a.status === 'SCHEDULED' &&
            a.patientId === attention.patientId &&
            (a.attentionId == null || a.attentionId === attention.id)
        )
        .sort(
          (a, b) =>
            new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
        )[0] ?? null
    : null;

  const handleFinalizeConfirm = async () => {
    await finalize();
  };

  const handleCancelConfirm = async (id: number, reason: string) => {
    await cancel(id, reason);
    setCancelTarget(null);
    await reload();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!attention) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {feedback.error ?? 'No se encontró la atención solicitada.'}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Datos del paciente
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">
            NOMBRE COMPLETO
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
            {attention.patientName}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Tratamiento actual
            </Typography>
            <AttentionStatusChip status={attention.status} />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">
            TRATAMIENTO
          </Typography>
          <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
            {attention.treatmentName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            INICIO
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {format(parseISO(attention.startDate), 'dd/MM/yyyy')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            PRÓXIMO TURNO
          </Typography>
          {nextAppointment ? (
            <>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {format(parseISO(nextAppointment.appointmentTime), 'dd/MM/yyyy HH:mm')}
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ mt: 1.25, '& > *': { flex: 1 } }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={mutatingId === nextAppointment.id}
                  onClick={() => void complete(nextAppointment.id)}
                >
                  Asistió
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  disabled={mutatingId === nextAppointment.id}
                  onClick={() => void markNoShow(nextAppointment.id)}
                >
                  No asistió
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={mutatingId === nextAppointment.id}
                  onClick={() => setCancelTarget(nextAppointment)}
                >
                  Cancelar
                </Button>
              </Stack>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sin turnos próximos.
            </Typography>
          )}
        </Paper>

        {attention.status === 'IN_PROGRESS' && (
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Tooltip title={blockerMessage ?? ''} disableHoverListener={!blockerMessage}>
              <span>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setFinalizeOpen(true)}
                  disabled={mutating || !canTerminate}
                  fullWidth
                >
                  Finalizar atención
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={blockerMessage ?? ''} disableHoverListener={!blockerMessage}>
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Block />}
                  onClick={() => setCancelAttnOpen(true)}
                  disabled={mutating || !canTerminate}
                  fullWidth
                >
                  Cancelar caso
                </Button>
              </span>
            </Tooltip>
          </Stack>
        )}
      </Box>

      <Box sx={{ flex: 1, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            Evolución clínica
          </Typography>
          {attention.status === 'IN_PROGRESS' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddNoteOpen(true)}
            >
              Agregar evolución
            </Button>
          )}
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Historial ({notes.length})
          </Typography>
          <ProgressNoteTimeline notes={notes} />
        </Paper>
      </Box>

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

      <FinalizeAttentionDialog
        open={finalizeOpen}
        attention={attention}
        submitting={mutating}
        errorMessage={finalizeOpen ? feedback.error : null}
        onClose={() => {
          setFinalizeOpen(false);
          clearFeedback();
        }}
        onConfirm={handleFinalizeConfirm}
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
        open={Boolean(cancelTarget)}
        appointment={cancelTarget}
        submitting={mutatingId === cancelTarget?.id}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
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
