import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Alert, CircularProgress, useTheme, Grid } from '@mui/material';
import { CalendarMonth, LocalHospital, MedicalServices, People, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/practitioner/StatsCard';
import { getMyUpcomingAppointments, getMyAttentions } from '../../services/api/practitionerService';
import type { AppointmentResponseDTO, AttentionResponseDTO } from '../../types/attention.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PractitionerDashboardPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [appointmentsData, attentionsData] = await Promise.all([
          getMyUpcomingAppointments(),
          getMyAttentions(),
        ]);
        setAppointments(appointmentsData);
        setAttentions(attentionsData);
      } catch (err: unknown) {
        console.error('Error loading dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    upcomingAppointments: appointments.filter(a => a.status === 'SCHEDULED').length,
    activeAttentions: attentions.filter(a => a.status === 'IN_PROGRESS').length,
    completedAttentions: attentions.filter(a => a.status === 'COMPLETED').length,
    totalPatients: new Set(attentions.map(a => a.patientId)).size,
  };

  const nextAppointment = appointments
    .filter(a => a.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())[0];

  const quickActions = [
    {
      title: 'Gestionar Turnos',
      description: 'Ver y administrar tus turnos próximos',
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      path: '/practitioner/appointments',
      color: 'primary',
    },
    {
      title: 'Atenciones',
      description: 'Registrar evoluciones y finalizar atenciones',
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      path: '/practitioner/attentions',
      color: 'success',
    },
    {
      title: 'Tratamientos',
      description: 'Administrar tu catálogo de tratamientos',
      icon: <MedicalServices sx={{ fontSize: 40 }} />,
      path: '/practitioner/treatments',
      color: 'info',
    },
    {
      title: 'Pacientes',
      description: 'Ver tus pacientes asignados',
      icon: <People sx={{ fontSize: 40 }} />,
      path: '/practitioner/patients',
      color: 'secondary',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Dashboard del Practicante
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Resumen de tu actividad y accesos rápidos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <StatsCard
          title="Turnos Próximos"
          value={stats.upcomingAppointments}
          icon={<CalendarMonth sx={{ fontSize: 32 }} />}
          color="primary"
          subtitle="Turnos programados"
        />
        <StatsCard
          title="Atenciones Activas"
          value={stats.activeAttentions}
          icon={<LocalHospital sx={{ fontSize: 32 }} />}
          color="success"
          subtitle="En progreso"
        />
        <StatsCard
          title="Atenciones Completadas"
          value={stats.completedAttentions}
          icon={<TrendingUp sx={{ fontSize: 32 }} />}
          color="info"
          subtitle="Finalizadas"
        />
        <StatsCard
          title="Pacientes Totales"
          value={stats.totalPatients}
          icon={<People sx={{ fontSize: 32 }} />}
          color="secondary"
          subtitle="Pacientes atendidos"
        />
      </Box>

      {/* Next Appointment */}
      {nextAppointment && (
        <Card sx={{ mb: 4, borderRadius: 3, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Próximo Turno
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Paciente
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {nextAppointment.patientName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tratamiento
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {nextAppointment.treatmentName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha y Hora
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {format(parseISO(nextAppointment.appointmentTime), "dd 'de' MMMM 'de' yyyy - HH:mm", {
                    locale: es,
                  })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Duración
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {nextAppointment.durationInMinutes} minutos
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Accesos Rápidos
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={action.path}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(action.path)}
                sx={{ height: '100%', p: 3 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: 3,
                      backgroundColor: `${action.color}.main`,
                      color: `${action.color}.contrastText`,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
