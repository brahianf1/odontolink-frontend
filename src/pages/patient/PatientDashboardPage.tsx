import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import {
  Event as EventIcon,
  Assignment as AssignmentIcon,
  MedicalServices as MedicalServicesIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import patientService from '../../services/api/patientService';
import StatsCard from '../../components/patient/StatsCard';
import type { AppointmentResponseDTO } from '../../types/appointment.types';
import type { AttentionResponseDTO } from '../../types/attention.types';

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [treatmentsCount, setTreatmentsCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appointmentsData, attentionsData, treatmentsData] = await Promise.all([
        patientService.getMyUpcomingAppointments(),
        patientService.getMyAttentions(),
        patientService.getAvailableTreatments(),
      ]);

      setUpcomingAppointments(appointmentsData);
      setAttentions(attentionsData);
      setTreatmentsCount(treatmentsData.length);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const activeAttentions = attentions.filter((att) => att.status === 'IN_PROGRESS');
  const completedAttentions = attentions.filter((att) => att.status === 'COMPLETED');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'info';
      case 'CONFIRMED':
        return 'success';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'NO_SHOW':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programado';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'NO_SHOW':
        return 'No Asistió';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
          }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Bienvenido a tu panel de control. Aquí puedes ver un resumen de tu actividad.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 3, md: 4 },
        }}
      >
        <StatsCard
          title="Próximos Turnos"
          value={upcomingAppointments.length}
          icon={<EventIcon />}
          color="primary"
          subtitle="Turnos confirmados"
        />
        <StatsCard
          title="Atenciones en Curso"
          value={activeAttentions.length}
          icon={<AssignmentIcon />}
          color="info"
          subtitle="Tratamientos activos"
        />
        <StatsCard
          title="Tratamientos Disponibles"
          value={treatmentsCount}
          icon={<MedicalServicesIcon />}
          color="success"
          subtitle="Para reservar"
        />
        <StatsCard
          title="Atenciones Completadas"
          value={completedAttentions.length}
          icon={<StarIcon />}
          color="warning"
          subtitle="Historial"
        />
      </Box>

      {/* Upcoming Appointments */}
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
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            mb: 2,
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Próximos Turnos
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/patient/appointments')}
            sx={{ 
              alignSelf: { xs: 'flex-start', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            Ver todos
          </Button>
        </Box>

        {upcomingAppointments.length === 0 ? (
          <Alert 
            severity="info"
            sx={{
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: { xs: 'flex-start', sm: 'center' } }}>
              <span>No tienes turnos próximos.</span>
              <Button 
                size="small" 
                variant="text"
                onClick={() => navigate('/patient/treatments')}
                sx={{ p: 0, minWidth: 'auto', fontWeight: 'bold' }}
              >
                Reservar turno
              </Button>
            </Box>
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <Paper
                key={appointment.id}
                variant="outlined"
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1.5, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 55, sm: 60 },
                    height: { xs: 55, sm: 60 },
                    minWidth: { xs: 55, sm: 60 },
                    borderRadius: 2,
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {format(new Date(appointment.appointmentTime), 'MMM', { locale: es }).toUpperCase()}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.25rem' } }}>
                    {format(new Date(appointment.appointmentTime), 'd')}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {appointment.treatmentName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Practicante: {appointment.practitionerName}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    {format(new Date(appointment.appointmentTime), "EEEE d 'de' MMMM 'a las' HH:mm", {
                      locale: es,
                    })}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusLabel(appointment.status)}
                  color={getStatusColor(appointment.status)}
                  size="small"
                  sx={{ 
                    alignSelf: { xs: 'flex-start', sm: 'center' },
                    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  }}
                />
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Active Attentions */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            mb: 2,
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Atenciones en Curso
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/patient/attentions')}
            sx={{ 
              alignSelf: { xs: 'flex-start', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            Ver todas
          </Button>
        </Box>

        {activeAttentions.length === 0 ? (
          <Alert severity="info">No tienes atenciones en curso.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
            {activeAttentions.slice(0, 3).map((attention) => (
              <Paper
                key={attention.id}
                variant="outlined"
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1.5, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'info.main',
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 44, sm: 48 },
                    height: { xs: 44, sm: 48 },
                    minWidth: { xs: 44, sm: 48 },
                    borderRadius: '50%',
                    backgroundColor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'info.main',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {attention.treatmentName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Practicante: {attention.practitionerName}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    Inicio: {format(new Date(attention.startDate), "d 'de' MMMM, yyyy", { locale: es })}
                  </Typography>
                </Box>
                <Chip 
                  label="En Curso" 
                  color="info" 
                  size="small" 
                  sx={{ 
                    alignSelf: { xs: 'flex-start', sm: 'center' },
                    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  }}
                />
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
