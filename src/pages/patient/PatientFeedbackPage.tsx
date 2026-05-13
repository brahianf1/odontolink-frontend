import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Button,
  TextField,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Star as StarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import patientService from '../../services/api/patientService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type { FeedbackResponseDTO } from '../../types/feedback.types';

export default function PatientFeedbackPage() {
  const location = useLocation();
  const preselectedAttentionId = location.state?.attentionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [feedbackByAttentionId, setFeedbackByAttentionId] = useState<Record<number, FeedbackResponseDTO | null>>({});
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [viewFeedbackDialogOpen, setViewFeedbackDialogOpen] = useState(false);
  const [selectedAttention, setSelectedAttention] = useState<AttentionResponseDTO | null>(null);
  const [viewingFeedback, setViewingFeedback] = useState<FeedbackResponseDTO | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCompletedAttentions();
  }, []);

  useEffect(() => {
    if (preselectedAttentionId && attentions.length > 0) {
      const attention = attentions.find((att) => att.id === preselectedAttentionId);
      if (attention) {
        handleOpenDialog(attention);
      }
    }
  }, [preselectedAttentionId, attentions]);

  const loadCompletedAttentions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getMyAttentions();
      const completed = data.filter((att) => att.status === 'COMPLETED');
      setAttentions(completed);

      const feedbackStatus = await Promise.all(
        completed.map(async (attention) => {
          try {
            const feedbackList = await patientService.getFeedbackForAttention(attention.id);
            // If the array has items, feedback exists
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
      setError('Error al cargar las atenciones completadas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (attention: AttentionResponseDTO) => {
    const existingFeedback = feedbackByAttentionId[attention.id];
    if (existingFeedback) {
      // Feedback already exists → show read-only view
      setViewingFeedback(existingFeedback);
      setSelectedAttention(attention);
      setViewFeedbackDialogOpen(true);
    } else {
      // No feedback yet → show create form
      handleOpenFeedbackDialog(attention);
    }
  };

  const handleOpenFeedbackDialog = (attention: AttentionResponseDTO) => {
    setSelectedAttention(attention);
    setRating(0);
    setComment('');
    setError(null);
    setSuccess(null);
    setFeedbackDialogOpen(true);
  };

  const handleCloseFeedbackDialog = () => {
    setFeedbackDialogOpen(false);
    setSelectedAttention(null);
    setRating(0);
    setComment('');
  };

  const handleCloseViewFeedbackDialog = () => {
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
      handleCloseFeedbackDialog();
      loadCompletedAttentions();
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Error al enviar la calificación');
    } finally {
      setSubmitting(false);
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
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Calificaciones
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Califica las atenciones recibidas para ayudar a mejorar la calidad del servicio.
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

      {/* Completed Attentions */}
      {attentions.length === 0 ? (
        <Alert severity="info">
          No tienes atenciones completadas para calificar en este momento.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {attentions.map((attention) => (
            <Paper
              key={attention.id}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[4],
                  borderColor: 'primary.main',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {attention.treatmentName}
                    </Typography>
                    <Chip
                      label="Completada"
                      color="success"
                      size="small"
                      variant="filled"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1}}>
                    <Typography variant="body2" color="text.secondary">
                      Practicante: <strong>{attention.practitionerName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha: {format(new Date(attention.startDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </Typography>
                    {attention.appointments && attention.appointments.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Citas: {attention.appointments.length}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<StarIcon />}
                  onClick={() => handleOpenDialog(attention)}
                  sx={{
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  {feedbackByAttentionId[attention.id] ? 'Ver calificación' : 'Calificar'}
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={handleCloseFeedbackDialog} maxWidth="sm" fullWidth>
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
            onClick={handleCloseFeedbackDialog}
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

      {/* View Existing Feedback Dialog */}
      <Dialog open={viewFeedbackDialogOpen} onClose={handleCloseViewFeedbackDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0, pr: 6 }}>
          <Typography variant="h5" fontWeight="bold">
            Tu Calificación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Calificación enviada para esta atención
          </Typography>
          <IconButton
            aria-label="cerrar"
            onClick={handleCloseViewFeedbackDialog}
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
            onClick={handleCloseViewFeedbackDialog}
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
