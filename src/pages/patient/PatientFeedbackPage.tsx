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
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import patientService from '../../services/api/patientService';
import type { AttentionResponseDTO } from '../../types/attention.types';

export default function PatientFeedbackPage() {
  const location = useLocation();
  const preselectedAttentionId = location.state?.attentionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedAttention, setSelectedAttention] = useState<AttentionResponseDTO | null>(null);
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
        handleOpenFeedbackDialog(attention);
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
    } catch (err) {
      console.error('Error loading attentions:', err);
      setError('Error al cargar las atenciones completadas');
    } finally {
      setLoading(false);
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
                  onClick={() => handleOpenFeedbackDialog(attention)}
                  sx={{
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  Calificar
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Feedback Dialog */}
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
    </Box>
  );
}
