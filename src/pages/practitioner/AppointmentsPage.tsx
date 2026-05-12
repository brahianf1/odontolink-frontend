import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { AppointmentResponseDTO } from '../../types/attention.types';
import {
  AppointmentDetailsDialog,
  CalendarView,
  CancelAppointmentDialog,
  DailyAgendaView,
  ViewSwitcher,
  useAppointments,
} from '../../features/practitionerSchedule';
import type { ScheduleViewMode } from '../../features/practitionerSchedule';

export default function AppointmentsPage() {
  const {
    appointments,
    loading,
    mutatingId,
    feedback,
    reload,
    complete,
    markNoShow,
    cancel,
    clearFeedback,
  } = useAppointments();

  const [view, setView] = useState<ScheduleViewMode>('daily');
  const [detailsTarget, setDetailsTarget] =
    useState<AppointmentResponseDTO | null>(null);
  const [cancelTarget, setCancelTarget] =
    useState<AppointmentResponseDTO | null>(null);

  /**
   * Calendar tiles only show a compact title, so a click opens the rich
   * details modal where the practitioner can read the full appointment and
   * trigger actions. The daily-agenda card already exposes those actions
   * inline, so it doesn't go through this flow.
   */
  const handleEventOpen = (appointment: AppointmentResponseDTO) =>
    setDetailsTarget(appointment);

  /**
   * Cancellation is a two-step flow: the details modal hands off to the
   * motive-capture modal. We close details first so only one modal is
   * stacked at a time.
   */
  const handleCancelRequest = (appointment: AppointmentResponseDTO) => {
    setDetailsTarget(null);
    setCancelTarget(appointment);
  };

  const handleCancelConfirm = async (id: number, motive: string) => {
    await cancel(id, motive);
    setCancelTarget(null);
  };

  const handleCompleteFromDetails = async (id: number) => {
    await complete(id);
    setDetailsTarget(null);
  };

  const handleNoShowFromDetails = async (id: number) => {
    await markNoShow(id);
    setDetailsTarget(null);
  };

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
          <Typography variant="h4" fontWeight={700}>
            Gestión de Agenda
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organiza tu carga clínica y atiende a tus pacientes del día.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <ViewSwitcher value={view} onChange={setView} />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void reload()}
            disabled={loading}
            size="small"
          >
            Actualizar
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '40vh',
          }}
        >
          <CircularProgress size={48} />
        </Box>
      ) : appointments.length === 0 ? (
        <Alert severity="info">
          No tienes turnos próximos. Cuando un paciente reserve un horario contigo
          aparecerá aquí.
        </Alert>
      ) : view === 'daily' ? (
        <DailyAgendaView
          appointments={appointments}
          mutatingId={mutatingId}
          onComplete={complete}
          onNoShow={markNoShow}
          onCancelRequest={handleCancelRequest}
        />
      ) : (
        <CalendarView
          appointments={appointments}
          onEventClick={handleEventOpen}
        />
      )}

      <AppointmentDetailsDialog
        open={Boolean(detailsTarget)}
        appointment={detailsTarget}
        busy={mutatingId === detailsTarget?.id}
        onClose={() => setDetailsTarget(null)}
        onComplete={handleCompleteFromDetails}
        onNoShow={handleNoShowFromDetails}
        onCancelRequest={handleCancelRequest}
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
