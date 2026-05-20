import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import {
  AccessTime as TimeIcon,
  EventBusy as CancelIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentResponseDTO } from '../../../types/appointment.types';
import AppointmentStatusChip from './AppointmentStatusChip';

interface AppointmentTimelineItemProps {
  appointment: AppointmentResponseDTO;
  /**
   * Optional action slot rendered below the appointment metadata. The
   * practitioner page fills this with Asistió / No asistió / Cancelar
   * buttons when the status is SCHEDULED; the supervisor audit page
   * leaves it undefined (read-only).
   */
  actions?: ReactNode;
}

const formatDateTime = (value: string): string => {
  try {
    return format(parseISO(value), "EEE dd 'de' MMM yyyy · HH:mm", { locale: es });
  } catch {
    return value;
  }
};

export default function AppointmentTimelineItem({
  appointment,
  actions,
}: AppointmentTimelineItemProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight={600}>
              {formatDateTime(appointment.appointmentTime)}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Duración: {appointment.durationInMinutes} min
          </Typography>
          {appointment.motive && (
            <Typography variant="body2" sx={{ mt: 0.75 }}>
              <strong>Motivo:</strong> {appointment.motive}
            </Typography>
          )}
          {appointment.status === 'CANCELLED' && appointment.cancellationReason && (
            <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mt: 0.75 }}>
              <CancelIcon sx={{ fontSize: 16, color: 'error.main', mt: 0.25 }} />
              <Typography variant="caption" color="error.main">
                {appointment.cancellationReason}
              </Typography>
            </Stack>
          )}
        </Box>
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          spacing={1}
          alignItems={{ xs: 'center', sm: 'flex-end' }}
        >
          <AppointmentStatusChip status={appointment.status} />
        </Stack>
      </Stack>
      {actions && (
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {actions}
        </Box>
      )}
    </Paper>
  );
}
