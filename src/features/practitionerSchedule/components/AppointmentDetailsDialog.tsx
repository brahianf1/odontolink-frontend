import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import NotesIcon from '@mui/icons-material/Notes';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import CancelIcon from '@mui/icons-material/Cancel';
import { addMinutes, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentResponseDTO } from '../../../types/attention.types';
import StatusBadge from './StatusBadge';
import { STATUS_CONFIG } from '../types/schedule.types';

interface AppointmentDetailsDialogProps {
  open: boolean;
  appointment: AppointmentResponseDTO | null;
  busy?: boolean;
  onClose: () => void;
  onComplete: (id: number) => void;
  onNoShow: (id: number) => void;
  onCancelRequest: (appointment: AppointmentResponseDTO) => void;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function DetailRow({ icon, label, children }: DetailRowProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          pt: '2px',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Box sx={{ mt: 0.25 }}>{children}</Box>
      </Box>
    </Stack>
  );
}

export default function AppointmentDetailsDialog({
  open,
  appointment,
  busy = false,
  onClose,
  onComplete,
  onNoShow,
  onCancelRequest,
}: AppointmentDetailsDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!appointment) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent />
      </Dialog>
    );
  }

  const startsAt = parseISO(appointment.appointmentTime);
  const endsAt = addMinutes(startsAt, appointment.durationInMinutes);
  const accentColor = STATUS_CONFIG[appointment.status].hex;
  const isActionable = appointment.status === 'SCHEDULED';

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderTop: `4px solid ${accentColor}` } }}
    >
      <Box sx={{ position: 'relative', px: { xs: 2.5, sm: 3 }, pt: 3, pb: 2 }}>
        <IconButton
          onClick={handleClose}
          disabled={busy}
          aria-label="Cerrar"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ pr: 5 }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: accentColor,
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            {appointment.patientName
              .split(' ')
              .map((s) => s[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {appointment.patientName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Turno #{appointment.id}
            </Typography>
          </Box>
          <StatusBadge status={appointment.status} size="medium" />
        </Stack>
      </Box>

      <Divider />

      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
        <Stack spacing={2.25}>
          <DetailRow icon={<MedicalServicesIcon />} label="Tratamiento">
            <Typography variant="body1" fontWeight={500}>
              {appointment.treatmentName}
            </Typography>
          </DetailRow>

          <DetailRow icon={<EventIcon />} label="Fecha">
            <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
              {format(startsAt, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })}
            </Typography>
          </DetailRow>

          <DetailRow icon={<AccessTimeIcon />} label="Horario">
            <Typography variant="body1" fontWeight={500}>
              {format(startsAt, 'HH:mm', { locale: es })}{' '}
              <Typography component="span" color="text.secondary">
                –
              </Typography>{' '}
              {format(endsAt, 'HH:mm', { locale: es })}
            </Typography>
          </DetailRow>

          <DetailRow icon={<TimerIcon />} label="Duración">
            <Typography variant="body1" fontWeight={500}>
              {appointment.durationInMinutes} minutos
            </Typography>
          </DetailRow>

          <DetailRow icon={<PersonIcon />} label="Practicante">
            <Typography variant="body1" fontWeight={500}>
              {appointment.practitionerName}
            </Typography>
          </DetailRow>

          {appointment.motive && (
            <DetailRow icon={<NotesIcon />} label="Motivo">
              <Typography
                variant="body2"
                sx={{
                  p: 1.25,
                  bgcolor: 'action.hover',
                  borderRadius: 0,
                  fontStyle: 'italic',
                }}
              >
                {appointment.motive}
              </Typography>
            </DetailRow>
          )}

          {appointment.attentionId && (
            <DetailRow icon={<AssignmentIcon />} label="Atención asociada">
              <Typography variant="body2" color="text.secondary">
                #{appointment.attentionId}
              </Typography>
            </DetailRow>
          )}
        </Stack>
      </DialogContent>

      {isActionable && (
        <>
          <Divider />
          <DialogActions
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 2,
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              gap: 1,
              '& > *': { width: { xs: '100%', sm: 'auto' }, m: '0 !important' },
            }}
          >
            <Button
              variant="text"
              color="error"
              disabled={busy}
              startIcon={<CancelIcon />}
              onClick={() => onCancelRequest(appointment)}
              sx={{ mr: { sm: 'auto' } }}
            >
              Cancelar turno
            </Button>
            <Button
              variant="outlined"
              color="warning"
              disabled={busy}
              startIcon={<PersonOffIcon />}
              onClick={() => onNoShow(appointment.id)}
            >
              Inasistencia
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={busy}
              startIcon={
                busy ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />
              }
              onClick={() => onComplete(appointment.id)}
            >
              Completar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
