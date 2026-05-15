import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  TaskAlt as TaskAltIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  EventNote as EventNoteIcon,
  NoteAlt as NoteAltIcon,
  NavigateNext as NavigateNextIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAttentionAudit } from '../../features/supervisor/hooks/useAttentionAudit';
import AttentionStatusChip from '../../features/supervisor/components/AttentionStatusChip';
import AppointmentTimelineItem from '../../features/supervisor/components/AppointmentTimelineItem';
import ProgressNoteItem from '../../features/supervisor/components/ProgressNoteItem';
import ConfirmActionDialog from '../../features/supervisor/components/ConfirmActionDialog';
import { mapSupervisorError } from '../../features/supervisor/utils/supervisorApiErrors';

interface FeedbackState {
  open: boolean;
  severity: 'success' | 'error' | 'info';
  message: string;
}

const INITIAL_FEEDBACK: FeedbackState = { open: false, severity: 'success', message: '' };

const formatDate = (value: string): string => {
  try {
    return format(parseISO(value), "dd 'de' MMM yyyy", { locale: es });
  } catch {
    return value;
  }
};

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  caption?: string;
}

function SectionHeader({ icon, title, caption }: SectionHeaderProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {caption && (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

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

  const sortedAppointments = useMemo(() => {
    if (!attention) return [];
    return [...attention.appointments].sort(
      (a, b) =>
        new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
    );
  }, [attention]);

  const sortedNotes = useMemo(() => {
    return [...progressNotes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [progressNotes]);

  const pendingAppointments = useMemo(
    () => sortedAppointments.filter((a) => a.status === 'SCHEDULED').length,
    [sortedAppointments]
  );

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

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1.5 }}>
        <MuiLink component={RouterLink} to="/supervisor/practitioners" underline="hover">
          Practicantes
        </MuiLink>
        <MuiLink
          component={RouterLink}
          to={`/supervisor/practitioners/${numericPractitionerId}/attentions`}
          underline="hover"
        >
          Atenciones
        </MuiLink>
        <Typography color="text.primary">Atención #{attention.id}</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Atención #{attention.id}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <AttentionStatusChip status={attention.status} />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Inicio: {formatDate(attention.startDate)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1.5}>
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
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          mb: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <SectionHeader
              icon={<PersonIcon />}
              title="Paciente"
              caption="Datos identificatorios del paciente atendido"
            />
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nombre
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {attention.patientName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ID interno
                </Typography>
                <Typography variant="body2">#{attention.patientId}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <SectionHeader
              icon={<MedicalServicesIcon />}
              title="Tratamiento"
              caption="Servicio clínico asignado a esta atención"
            />
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tratamiento
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {attention.treatmentName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Practicante a cargo
                </Typography>
                <Typography variant="body2">{attention.practitionerName}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<EventNoteIcon />}
            title="Historial de turnos"
            caption={`${sortedAppointments.length} turno${sortedAppointments.length === 1 ? '' : 's'} registrados`}
          />
          {pendingAppointments > 0 && attention.status === 'IN_PROGRESS' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Hay {pendingAppointments} turno{pendingAppointments === 1 ? '' : 's'} programado
              {pendingAppointments === 1 ? '' : 's'}. La atención no podrá finalizarse hasta
              cancelarlos o completarlos.
            </Alert>
          )}
          {sortedAppointments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No se han registrado turnos para esta atención.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {sortedAppointments.map((a) => (
                <AppointmentTimelineItem key={a.id} appointment={a} />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <SectionHeader
            icon={<NoteAltIcon />}
            title="Notas de evolución"
            caption="Solo lectura · Visualización para auditoría académica"
          />
          {sortedNotes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aún no se han registrado notas de evolución para esta atención.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {sortedNotes.map((note) => (
                <ProgressNoteItem key={note.id} note={note} />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <ConfirmActionDialog
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
