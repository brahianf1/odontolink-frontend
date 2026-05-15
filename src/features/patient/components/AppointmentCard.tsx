import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentResponseDTO } from '../../../types/appointment.types';
import {
  getAppointmentStatusColor,
  getAppointmentStatusLabel,
} from '../utils/appointmentStatus';

interface AppointmentCardProps {
  appointment: AppointmentResponseDTO;
  onCancel?: (appointment: AppointmentResponseDTO) => void;
  cancelling?: boolean;
}

export default function AppointmentCard({
  appointment,
  onCancel,
  cancelling = false,
}: AppointmentCardProps) {
  const date = new Date(appointment.appointmentTime);
  const canCancel = onCancel && appointment.status === 'SCHEDULED';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 3 },
        alignItems: { md: 'center' },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: 88 },
          height: { xs: 72, md: 88 },
          borderRadius: 2,
          backgroundColor: 'primary.light',
          color: 'primary.main',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
          {format(date, 'MMM', { locale: es })}
        </Typography>
        <Typography variant="h5" fontWeight={700} lineHeight={1}>
          {format(date, 'd')}
        </Typography>
        <Typography variant="caption">{format(date, 'HH:mm')}</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1,
            mb: 0.5,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {appointment.treatmentName}
          </Typography>
          <Chip
            label={getAppointmentStatusLabel(appointment.status)}
            color={getAppointmentStatusColor(appointment.status)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
          Practicante: {appointment.practitionerName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
          Duración: {appointment.durationInMinutes} minutos
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {format(date, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
        </Typography>
        {appointment.cancellationReason && (
          <Typography
            variant="body2"
            color="error.main"
            sx={{ mt: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            <strong>Motivo de cancelación:</strong> {appointment.cancellationReason}
          </Typography>
        )}
      </Box>

      {canCancel && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexDirection: { xs: 'row', md: 'column' },
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => onCancel?.(appointment)}
            disabled={cancelling}
            size="small"
            fullWidth
          >
            {cancelling ? 'Cancelando…' : 'Cancelar'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
