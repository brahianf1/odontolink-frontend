import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Event as EventIcon,
  MedicalServices as MedicalServicesIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import patientService from '../../services/api/patientService';
import StatsCard from '../../components/patient/StatsCard';
import { AppointmentCard, EmptyState, mapBusinessError } from '../../features/patient';
import type { AppointmentResponseDTO } from '../../types/appointment.types';
import type { AttentionResponseDTO } from '../../types/attention.types';

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [treatmentsTotal, setTreatmentsTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [appointmentsData, attentionsData, treatmentsPage] = await Promise.all([
          patientService.getMyUpcomingAppointments(),
          patientService.getMyAttentions(),
          patientService.searchAvailableTreatments({ page: 0, size: 1 }),
        ]);
        setAppointments(appointmentsData);
        setAttentions(attentionsData);
        setTreatmentsTotal(treatmentsPage.totalElements);
      } catch (err) {
        const { message } = mapBusinessError(err, 'No pudimos cargar tu dashboard.');
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeAttentions = attentions.filter((att) => att.status === 'IN_PROGRESS');
  const completedAttentions = attentions.filter((att) => att.status === 'COMPLETED');
  const nextAppointments = [...appointments]
    .sort(
      (a, b) =>
        new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
    )
    .slice(0, 3);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 4 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 3 },
            mb: 4,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={260} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido a tu panel de control. Aquí puedes ver un resumen de tu actividad.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 3, md: 4 },
        }}
      >
        <StatsCard
          title="Próximos turnos"
          value={appointments.length}
          icon={<EventIcon />}
          color="primary"
          subtitle="Turnos programados"
        />
        <StatsCard
          title="Atenciones en curso"
          value={activeAttentions.length}
          icon={<AssignmentIcon />}
          color="info"
          subtitle="Tratamientos activos"
        />
        <StatsCard
          title="Tratamientos disponibles"
          value={treatmentsTotal}
          icon={<MedicalServicesIcon />}
          color="success"
          subtitle="Para reservar"
        />
        <StatsCard
          title="Atenciones completadas"
          value={completedAttentions.length}
          icon={<StarIcon />}
          color="warning"
          subtitle="Historial"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, md: 3 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={700}>
            Próximos turnos
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/patient/appointments')}
          >
            Ver todos
          </Button>
        </Stack>

        {nextAppointments.length === 0 ? (
          <EmptyState
            variant="plain"
            title="No tienes turnos próximos"
            description="Reserva con un practicante para verlos aquí."
            actionLabel="Reservar turno"
            onAction={() => navigate('/patient/treatments')}
          />
        ) : (
          <Stack spacing={1.5}>
            {nextAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </Stack>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={700}>
            Atenciones en curso
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/patient/attentions')}
          >
            Ver todas
          </Button>
        </Stack>

        {activeAttentions.length === 0 ? (
          <EmptyState
            variant="plain"
            title="No tienes atenciones en curso"
            description="Cuando inicies un tratamiento aparecerá aquí."
          />
        ) : (
          <Stack spacing={1.5}>
            {activeAttentions.slice(0, 3).map((attention) => (
              <Paper
                key={attention.id}
                variant="outlined"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {attention.treatmentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Practicante: {attention.practitionerName}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => navigate('/patient/attentions')}
                >
                  Ver detalle
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
