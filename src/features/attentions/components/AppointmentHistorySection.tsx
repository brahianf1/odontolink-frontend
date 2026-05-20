import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';
import { EventNote as EventNoteIcon } from '@mui/icons-material';
import type { AppointmentResponseDTO } from '../../../types/appointment.types';
import SectionHeader from './SectionHeader';
import AppointmentTimelineItem from './AppointmentTimelineItem';

interface AppointmentHistorySectionProps {
  appointments: AppointmentResponseDTO[];
  /**
   * If provided, replaces the default AppointmentTimelineItem render. Use
   * this to inject role-specific actions (e.g. the practitioner needs
   * Asistió / No asistió / Cancelar on SCHEDULED appointments).
   */
  renderItem?: (appointment: AppointmentResponseDTO) => ReactNode;
  /**
   * If the attention is in-progress and there are pending SCHEDULED
   * appointments, we surface an info banner explaining termination is
   * blocked. The consumer decides whether to pass it (practitioner shows
   * it; the supervisor audit page also shows it but its phrasing differs).
   */
  pendingMessage?: string | null;
}

export default function AppointmentHistorySection({
  appointments,
  renderItem,
  pendingMessage,
}: AppointmentHistorySectionProps) {
  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) =>
          new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
      ),
    [appointments]
  );

  const renderDefault = (appt: AppointmentResponseDTO) => (
    <AppointmentTimelineItem key={appt.id} appointment={appt} />
  );

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <SectionHeader
          icon={<EventNoteIcon />}
          title="Historial de turnos"
          caption={`${sorted.length} turno${sorted.length === 1 ? '' : 's'} registrados`}
        />
        {pendingMessage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {pendingMessage}
          </Alert>
        )}
        {sorted.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No se han registrado turnos para esta atención.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {sorted.map((appt) =>
              renderItem ? (
                <div key={appt.id}>{renderItem(appt)}</div>
              ) : (
                renderDefault(appt)
              )
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
