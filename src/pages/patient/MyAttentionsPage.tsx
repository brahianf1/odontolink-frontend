import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import patientService from '../../services/api/patientService';
import type { AttentionResponseDTO } from '../../types/attention.types';

export default function MyAttentionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadAttentions();
  }, []);

  const loadAttentions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getMyAttentions();
      setAttentions(data);
    } catch (err) {
      console.error('Error loading attentions:', err);
      setError('Error al cargar las atenciones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'En Curso';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const activeAttentions = attentions.filter((att) => att.status === 'IN_PROGRESS');
  const completedAttentions = attentions.filter((att) => att.status === 'COMPLETED');
  const displayedAttentions = tabValue === 0 ? activeAttentions : completedAttentions;

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
          Mis Atenciones
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Revisa el estado de tus tratamientos y atenciones odontológicas.
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
          <Tab label={`En Curso (${activeAttentions.length})`} />
          <Tab label={`Completadas (${completedAttentions.length})`} />
        </Tabs>
      </Paper>

      {/* Attentions List */}
      {displayedAttentions.length === 0 ? (
        <Alert severity="info">
          {tabValue === 0
            ? 'No tienes atenciones en curso.'
            : 'No tienes atenciones completadas.'}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
          {displayedAttentions.map((attention) => (
            <Accordion 
              key={attention.id}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: 0,
                },
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: { xs: 2, sm: 2.5, md: 3 },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 1 }}>
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
                        fontWeight="bold"
                        sx={{
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {attention.treatmentName}
                      </Typography>
                      <Chip
                        label={getStatusLabel(attention.status)}
                        color={getStatusColor(attention.status)}
                        size="small"
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        }}
                      />
                    </Box>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 1.5, sm: 2 },
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          {attention.practitionerName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          Inicio: {format(new Date(attention.startDate), "d 'de' MMM, yyyy", { locale: es })}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2, sm: 2.5, md: 3 }, pb: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                  {/* Attention Details */}
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.9rem', sm: '0.95rem' } }}
                    >
                      Información de la Atención
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      <strong>Tratamiento:</strong> {attention.treatmentName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      <strong>Practicante:</strong> {attention.practitionerName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      <strong>Fecha de Inicio:</strong>{' '}
                      {format(new Date(attention.startDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      <strong>Estado:</strong> {getStatusLabel(attention.status)}
                    </Typography>
                  </Paper>

                  {/* Appointments */}
                  {attention.appointments && attention.appointments.length > 0 && (
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{ fontSize: { xs: '0.9rem', sm: '0.95rem' } }}
                      >
                        Turnos Asociados ({attention.appointments.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5 } }}>
                        {attention.appointments.map((appointment) => (
                          <Paper 
                            key={appointment.id} 
                            variant="outlined" 
                            sx={{ 
                              p: { xs: 1.5, sm: 2 },
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
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold"
                                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                >
                                  {format(
                                    new Date(appointment.appointmentTime),
                                    "EEEE d 'de' MMMM 'a las' HH:mm",
                                    { locale: es }
                                  )}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                >
                                  Duración: {appointment.durationInMinutes} minutos
                                </Typography>
                              </Box>
                              <Chip
                                label={
                                  appointment.status === 'COMPLETED'
                                    ? 'Completado'
                                    : appointment.status === 'SCHEDULED'
                                    ? 'Programado'
                                    : appointment.status === 'CANCELLED'
                                    ? 'Cancelado'
                                    : appointment.status === 'NO_SHOW'
                                    ? 'No Asistió'
                                    : appointment.status
                                }
                                color={
                                  appointment.status === 'COMPLETED'
                                    ? 'success'
                                    : appointment.status === 'SCHEDULED'
                                    ? 'info'
                                    : appointment.status === 'CANCELLED'
                                    ? 'error'
                                    : 'warning'
                                }
                                size="small"
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  alignSelf: { xs: 'flex-start', sm: 'center' },
                                }}
                              />
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Actions */}
                  {attention.status === 'COMPLETED' && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        justifyContent: { xs: 'stretch', sm: 'flex-end' },
                        flexDirection: { xs: 'column', sm: 'row' },
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/patient/feedback', { state: { attentionId: attention.id } })}
                        fullWidth={false}
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        }}
                      >
                        Calificar Atención
                      </Button>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
