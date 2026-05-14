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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../services/api/patientService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type { FeedbackResponseDTO } from '../../types/feedback.types';

export default function MyAttentionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [expandedId, setExpandedId] = useState<string | false>(false);

  // Feedback state
  const [feedbackByAttentionId, setFeedbackByAttentionId] = useState<Record<number, FeedbackResponseDTO | null>>({});
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [viewFeedbackDialogOpen, setViewFeedbackDialogOpen] = useState(false);
  const [selectedAttention, setSelectedAttention] = useState<AttentionResponseDTO | null>(null);
  const [viewingFeedback, setViewingFeedback] = useState<FeedbackResponseDTO | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAttentions();
  }, []);

  const loadAttentions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getMyAttentions();
      setAttentions(data);

      // Load feedback status for completed attentions
      const completed = data.filter((att) => att.status === 'COMPLETED');
      const feedbackStatus = await Promise.all(
        completed.map(async (attention) => {
          try {
            const feedbackList = await patientService.getFeedbackForAttention(attention.id);
            if (feedbackList && feedbackList.length > 0) {
              return [attention.id, feedbackList[0]] as const;
            }
            return [attention.id, null] as const;
          } catch {
            return [attention.id, null] as const;
          }
        })
      );
      setFeedbackByAttentionId(Object.fromEntries(feedbackStatus));
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

  // ── Feedback dialog logic ──

  const handleOpenFeedbackDialog = (attention: AttentionResponseDTO) => {
    const existingFeedback = feedbackByAttentionId[attention.id];
    if (existingFeedback) {
      // Feedback already exists → show read-only view
      setViewingFeedback(existingFeedback);
      setSelectedAttention(attention);
      setViewFeedbackDialogOpen(true);
    } else {
      // No feedback yet → show create form
      setSelectedAttention(attention);
      setRating(0);
      setComment('');
      setError(null);
      setSuccess(null);
      setFeedbackDialogOpen(true);
    }
  };

  const handleCloseCreateDialog = () => {
    setFeedbackDialogOpen(false);
    setSelectedAttention(null);
    setRating(0);
    setComment('');
  };

  const handleCloseViewDialog = () => {
    setViewFeedbackDialogOpen(false);
    setViewingFeedback(null);
    setSelectedAttention(null);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedAttention) return;

    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await patientService.createFeedback({
        attentionId: selectedAttention.id,
        rating,
        comment: comment.trim() || undefined,
      });
      setSuccess('Calificación enviada exitosamente');
      handleCloseCreateDialog();
      loadAttentions();
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Error al enviar la calificación');
    } finally {
      setSubmitting(false);
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
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
              expanded={expandedId === String(attention.id)}
              onChange={(_, isExpanded) => setExpandedId(isExpanded ? String(attention.id) : false)}
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

                  {/* Quick action: show rating button in summary for completed attentions */}
                  {attention.status === 'COMPLETED' && expandedId !== String(attention.id) && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<StarIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFeedbackDialog(attention);
                        }}
                        onFocus={(e) => e.stopPropagation()}
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.85rem' },
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {feedbackByAttentionId[attention.id] ? 'Ver calificación' : 'Calificar'}
                      </Button>
                    </Box>
                  )}

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
                        startIcon={<StarIcon />}
                        onClick={() => handleOpenFeedbackDialog(attention)}
                        fullWidth={false}
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        }}
                      >
                        {feedbackByAttentionId[attention.id] ? 'Ver calificación' : 'Calificar Atención'}
                      </Button>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* ── Create Feedback Dialog ── */}
      <Dialog open={feedbackDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Calificar Atención
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Califique su experiencia con el practicante
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAttention && (
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 3,
                backgroundColor: 'action.hover',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {selectedAttention.treatmentName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Practicante: <strong>{selectedAttention.practitionerName}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(selectedAttention.startDate), "d 'de' MMMM, yyyy", { locale: es })}
              </Typography>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Satisfacción general
              </Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue || 0)}
                size="large"
                precision={1}
                sx={{
                  '& .MuiRating-icon': {
                    fontSize: '2.3rem',
                  },
                }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
              Comentarios adicionales (opcional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Escriba un comentario adicional..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              inputProps={{ maxLength: 1000 }}
              helperText={`${comment.length}/1000 caracteres`}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseCreateDialog}
            disabled={submitting}
            sx={{ flex: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            disabled={rating === 0 || submitting}
            sx={{ flex: 1 }}
          >
            {submitting ? 'Confirmando...' : 'Confirmar Calificación'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Existing Feedback Dialog ── */}
      <Dialog open={viewFeedbackDialogOpen} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0, pr: 6 }}>
          <Typography variant="h5" fontWeight="bold">
            Tu Calificación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Calificación enviada para esta atención
          </Typography>
          <IconButton
            aria-label="cerrar"
            onClick={handleCloseViewDialog}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewingFeedback && selectedAttention && (
            <>
              {/* Attention info card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  mb: 3,
                  backgroundColor: 'action.hover',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedAttention.treatmentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAttention.practitionerName} • {format(new Date(selectedAttention.startDate), 'dd/MM/yyyy', { locale: es })}
                </Typography>
              </Paper>

              {/* Rating display */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" fontWeight={600} color="text.secondary" sx={{ letterSpacing: 1 }}>
                  Satisfacción General
                </Typography>
                <Rating
                  value={viewingFeedback.rating}
                  readOnly
                  size="large"
                  sx={{
                    display: 'flex',
                    mt: 1,
                    '& .MuiRating-icon': {
                      fontSize: '2.3rem',
                    },
                  }}
                />
              </Box>

              {/* Comment display */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" fontWeight={600} color="text.secondary" sx={{ letterSpacing: 1 }}>
                  Comentario
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 1,
                    borderRadius: 2,
                    backgroundColor: 'action.hover',
                  }}
                >
                  <Typography variant="body1">
                    {viewingFeedback.comment || 'Sin comentario.'}
                  </Typography>
                </Paper>
              </Box>

              {/* Date display */}
              <Box>
                <Typography variant="overline" fontWeight={600} color="text.secondary" sx={{ letterSpacing: 1 }}>
                  Fecha de Calificación
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {format(new Date(viewingFeedback.createdAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseViewDialog}
            variant="contained"
            fullWidth
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
