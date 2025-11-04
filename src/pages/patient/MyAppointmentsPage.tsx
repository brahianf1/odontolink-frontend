import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../services/api/patientService';
import type { AppointmentResponseDTO } from '../../types/appointment.types';

export default function MyAppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentResponseDTO | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getMyUpcomingAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Error al cargar los turnos');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = (appointment: AppointmentResponseDTO) => {
    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      setError(null);
      // TODO: Implementar endpoint de cancelación cuando esté disponible en el backend
      // await patientService.cancelAppointment(appointmentToCancel.id);
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      loadAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Error al cancelar el turno');
      setCancelDialogOpen(false);
    }
  };

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

  const upcomingAppointments = appointments.filter(
    (app) => app.status === 'SCHEDULED' || app.status === 'CONFIRMED'
  );
  const pastAppointments = appointments.filter(
    (app) => app.status === 'COMPLETED' || app.status === 'CANCELLED' || app.status === 'NO_SHOW'
  );

  const displayedAppointments = tabValue === 0 ? upcomingAppointments : pastAppointments;

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
          Mis Turnos
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Gestiona tus turnos programados y revisa tu historial.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              fontWeight: 500,
            },
          }}
        >
          <Tab label={`Próximos (${upcomingAppointments.length})`} />
          <Tab label={`Historial (${pastAppointments.length})`} />
        </Tabs>
      </Paper>

      {/* Appointments List */}
      {displayedAppointments.length === 0 ? (
        <Alert severity="info">
          {tabValue === 0
            ? 'No tienes turnos próximos.'
            : 'No tienes turnos en el historial.'}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
          {displayedAppointments.map((appointment) => (
            <Paper
              elevation={0}
              key={appointment.id}
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
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main',
                },
              }}
            >
              {/* Date Box */}
              <Box
                sx={{
                  width: { xs: '100%', sm: 80, md: 80 },
                  height: { xs: 70, sm: 80 },
                  borderRadius: 2,
                  backgroundColor: 'primary.light',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  flexShrink: 0,
                }}
              >
                <Typography 
                  variant="caption" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  {format(new Date(appointment.appointmentTime), 'MMM', { locale: es }).toUpperCase()}
                </Typography>
                <Typography 
                  variant="h5" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1.5rem', sm: '1.5rem' } }}
                >
                  {format(new Date(appointment.appointmentTime), 'd')}
                </Typography>
                <Typography 
                  variant="caption"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  {format(new Date(appointment.appointmentTime), 'HH:mm')}
                </Typography>
              </Box>

              {/* Appointment Info */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    gap: 1, 
                    mb: 1,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}
                  >
                    {appointment.treatmentName}
                  </Typography>
                  <Chip
                    label={getStatusLabel(appointment.status)}
                    color={getStatusColor(appointment.status)}
                    size="small"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      height: 'auto',
                      py: 0.5,
                    }}
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  }}
                >
                  Practicante: {appointment.practitionerName}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  }}
                >
                  Duración: {appointment.durationInMinutes} minutos
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    display: 'block',
                  }}
                >
                  {format(
                    new Date(appointment.appointmentTime),
                    "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                    { locale: es }
                  )}
                </Typography>
                {appointment.motive && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 1,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    <strong>Motivo:</strong> {appointment.motive}
                  </Typography>
                )}
              </Box>

              {/* Actions */}
              {tabValue === 0 && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
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
                    onClick={() => handleCancelAppointment(appointment)}
                    size="small"
                    fullWidth
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancelar Turno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas cancelar este turno? Esta acción no se puede deshacer.
          </DialogContentText>
          {appointmentToCancel && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {appointmentToCancel.treatmentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Practicante: {appointmentToCancel.practitionerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(
                  new Date(appointmentToCancel.appointmentTime),
                  "d 'de' MMMM 'a las' HH:mm",
                  { locale: es }
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, mantener turno</Button>
          <Button onClick={confirmCancelAppointment} color="error" variant="contained">
            Sí, cancelar turno
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
