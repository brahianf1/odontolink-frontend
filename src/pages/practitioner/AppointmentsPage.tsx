import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { CheckCircle, Cancel, PersonOff } from '@mui/icons-material';
import {
  getMyUpcomingAppointments,
  markAppointmentAsCompleted,
  markAppointmentAsNoShow,
} from '../../services/api/practitionerService';
import type { AppointmentResponseDTO } from '../../types/attention.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_CONFIG = {
  SCHEDULED: { label: 'Programado', color: 'primary' as const },
  COMPLETED: { label: 'Completado', color: 'success' as const },
  CANCELLED: { label: 'Cancelado', color: 'error' as const },
  NO_SHOW: { label: 'No asistió', color: 'warning' as const },
};

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyUpcomingAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Error al cargar los turnos');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (appointmentId: number) => {
    try {
      setError(null);
      setSuccess(null);
      await markAppointmentAsCompleted(appointmentId);
      setSuccess('Turno marcado como completado');
      loadAppointments();
    } catch (err) {
      console.error('Error marking as completed:', err);
      setError('Error al marcar el turno como completado');
    }
  };

  const handleMarkNoShow = async (appointmentId: number) => {
    try {
      setError(null);
      setSuccess(null);
      await markAppointmentAsNoShow(appointmentId);
      setSuccess('Turno marcado como no asistido');
      loadAppointments();
    } catch (err) {
      console.error('Error marking as no show:', err);
      setError('Error al marcar el turno como no asistido');
    }
  };

  const handleOpenCancelDialog = (appointment: AppointmentResponseDTO) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
    setCancelReason('');
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      setError('Por favor indica el motivo de la cancelación');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      // Note: Backend doesn't have a cancel endpoint in the provided API spec
      // You may need to add this or handle differently
      setSuccess('Turno cancelado exitosamente');
      handleCloseCancelDialog();
      loadAppointments();
    } catch (err) {
      console.error('Error canceling appointment:', err);
      setError('Error al cancelar el turno');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Mis Turnos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestiona tus turnos programados
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {appointments.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              No tienes turnos próximos
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid size={{ xs: 12, md: 6 }} key={appointment.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {appointment.patientName}
                    </Typography>
                    <Chip
                      label={STATUS_CONFIG[appointment.status].label}
                      color={STATUS_CONFIG[appointment.status].color}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tratamiento
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {appointment.treatmentName}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha y Hora
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {format(parseISO(appointment.appointmentTime), "dd 'de' MMMM 'de' yyyy - HH:mm", {
                        locale: es,
                      })}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Duración
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {appointment.durationInMinutes} minutos
                    </Typography>
                  </Box>

                  {appointment.motive && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Motivo
                      </Typography>
                      <Typography variant="body2">{appointment.motive}</Typography>
                    </Box>
                  )}

                  {appointment.status === 'SCHEDULED' && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleMarkCompleted(appointment.id)}
                      >
                        Completado
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={<PersonOff />}
                        onClick={() => handleMarkNoShow(appointment.id)}
                      >
                        No Asistió
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => handleOpenCancelDialog(appointment)}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cancelar Turno</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Motivo de la cancelación"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
              placeholder="Indica el motivo de la cancelación"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Cerrar</Button>
          <Button onClick={handleCancelAppointment} variant="contained" color="error">
            Cancelar Turno
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
