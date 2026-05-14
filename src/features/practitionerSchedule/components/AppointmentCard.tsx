import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { addMinutes, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentResponseDTO } from '../../../types/attention.types';
import StatusBadge from './StatusBadge';
import { STATUS_CONFIG } from '../types/schedule.types';

interface AppointmentCardProps {
  appointment: AppointmentResponseDTO;
  busy?: boolean;
  onComplete: (id: number) => void;
  onNoShow: (id: number) => void;
  onCancelRequest: (appointment: AppointmentResponseDTO) => void;
}

export default function AppointmentCard({
  appointment,
  busy = false,
  onComplete,
  onNoShow,
  onCancelRequest,
}: AppointmentCardProps) {
  const startsAt = parseISO(appointment.appointmentTime);
  const endsAt = addMinutes(startsAt, appointment.durationInMinutes);
  const isActionable = appointment.status === 'SCHEDULED';
  const accentColor = STATUS_CONFIG[appointment.status].hex;

  return (
    <Card
      sx={{
        position: 'relative',
        borderLeft: `4px solid ${accentColor}`,
        opacity: busy ? 0.6 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      {busy && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.4)',
            zIndex: 1,
          }}
        >
          <CircularProgress size={28} />
        </Box>
      )}

      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {appointment.patientName}
            </Typography>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ color: 'text.secondary', mt: 0.5 }}
            >
              <MedicalServicesIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">{appointment.treatmentName}</Typography>
            </Stack>
          </Box>
          <StatusBadge status={appointment.status} />
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0.5, sm: 3 }}
          sx={{ mb: appointment.motive ? 1.5 : 0 }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 18, color: accentColor }} />
            <Typography variant="body2" fontWeight={600}>
              {format(startsAt, 'HH:mm', { locale: es })}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ mx: 0.5 }}
              >
                –
              </Typography>
              {format(endsAt, 'HH:mm', { locale: es })}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ ml: 0.75 }}
              >
                · {format(startsAt, "EEE dd 'de' MMM", { locale: es })}
              </Typography>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <TimerIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {appointment.durationInMinutes} min
            </Typography>
          </Stack>
        </Stack>

        {appointment.motive && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              p: 1.25,
              bgcolor: 'action.hover',
              borderRadius: 0,
              fontStyle: 'italic',
            }}
          >
            “{appointment.motive}”
          </Typography>
        )}

        {isActionable && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ '& > *': { flex: { sm: 1 } } }}
            >
              <Button
                variant="contained"
                color="success"
                size="small"
                disabled={busy}
                startIcon={<CheckCircleIcon />}
                onClick={() => onComplete(appointment.id)}
              >
                Completar
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                disabled={busy}
                startIcon={<PersonOffIcon />}
                onClick={() => onNoShow(appointment.id)}
              >
                Inasistencia
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                disabled={busy}
                startIcon={<CancelIcon />}
                onClick={() => onCancelRequest(appointment)}
              >
                Cancelar
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
