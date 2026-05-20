import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAttentionAudit } from '../../features/supervisor/hooks/useAttentionAudit';
import {
  AppointmentHistorySection,
  AttentionBreadcrumbs,
  AttentionDetailHeader,
  ConfirmAttentionActionDialog,
  PatientSummaryCard,
  ProgressNotesSection,
  TreatmentSummaryCard,
} from '../../features/attentions';
import { mapSupervisorError } from '../../features/supervisor/utils/supervisorApiErrors';

interface FeedbackState {
  open: boolean;
  severity: 'success' | 'error' | 'info';
  message: string;
}

const INITIAL_FEEDBACK: FeedbackState = { open: false, severity: 'success', message: '' };

export default function AttentionAuditPage() {
  const navigate = useNavigate();
  const { practitionerId, attentionId } = useParams<{
    practitionerId: string;
    attentionId: string;
  }>();

  const numericPractitionerId = practitionerId ? Number(practitionerId) : null;
  const numericAttentionId = attentionId ? Number(attentionId) : null;

  const {
    attention,
    progressNotes,
    loading,
    finalizing,
    error,
    refresh,
    finalize,
  } = useAttentionAudit(numericPractitionerId, numericAttentionId);

  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(INITIAL_FEEDBACK);

  const pendingAppointments = useMemo(() => {
    if (!attention) return 0;
    return attention.appointments.filter((a) => a.status === 'SCHEDULED').length;
  }, [attention]);

  const canFinalize = attention?.status === 'IN_PROGRESS';

  const handleFinalize = async () => {
    try {
      await finalize();
      setConfirmFinalize(false);
      setFeedback({
        open: true,
        severity: 'success',
        message: 'Atención finalizada por autoridad académica.',
      });
    } catch (err) {
      const mapped = mapSupervisorError(err, 'No se pudo finalizar la atención.');
      setConfirmFinalize(false);
      setFeedback({ open: true, severity: 'error', message: mapped.message });
    }
  };

  const handleCloseFeedback = (_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  if (error || !attention) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? 'No se encontró la atención solicitada.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate(`/supervisor/practitioners/${numericPractitionerId}/attentions`)
          }
        >
          Volver
        </Button>
      </Box>
    );
  }

  const pendingMessage =
    pendingAppointments > 0 && attention.status === 'IN_PROGRESS'
      ? `Hay ${pendingAppointments} turno${pendingAppointments === 1 ? '' : 's'} programado${pendingAppointments === 1 ? '' : 's'}. La atención no podrá finalizarse hasta cancelarlos o completarlos.`
      : null;

  return (
    <Box>
      <AttentionBreadcrumbs
        crumbs={[
          { label: 'Practicantes', to: '/supervisor/practitioners' },
          {
            label: 'Atenciones',
            to: `/supervisor/practitioners/${numericPractitionerId}/attentions`,
          },
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
              onClick={() =>
                navigate(`/supervisor/practitioners/${numericPractitionerId}/attentions`)
              }
            >
              Volver
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => void refresh()}
            >
              Refrescar
            </Button>
            {canFinalize && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<TaskAltIcon />}
                onClick={() => setConfirmFinalize(true)}
              >
                Finalizar atención
              </Button>
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
      />

      <ProgressNotesSection
        notes={progressNotes}
        caption="Solo lectura · Visualización para auditoría académica"
      />

      <ConfirmAttentionActionDialog
        open={confirmFinalize}
        title="Finalizar atención por autoridad académica"
        message={
          <>
            ¿Confirmas finalizar la atención <Chip
              label={`#${attention.id}`}
              size="small"
              variant="outlined"
              sx={{ mx: 0.5 }}
            /> del paciente <strong>{attention.patientName}</strong>?
          </>
        }
        warning={
          pendingAppointments > 0
            ? `Hay ${pendingAppointments} turno${pendingAppointments === 1 ? '' : 's'} programado${pendingAppointments === 1 ? '' : 's'}. El backend rechazará el cierre hasta resolverlos.`
            : 'Esta acción no se puede deshacer y queda registrada en el historial clínico.'
        }
        confirmLabel="Finalizar"
        confirmColor="warning"
        loading={finalizing}
        onConfirm={handleFinalize}
        onClose={() => setConfirmFinalize(false)}
      />

      <Snackbar
        open={feedback.open}
        autoHideDuration={5000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
