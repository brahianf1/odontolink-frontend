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
            <Paper key={attention.id} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {attention.treatmentName}
                    </Typography>
                    <Chip label="Completada" color="success" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Practicante: {attention.practitionerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de inicio: {format(new Date(attention.startDate), "d 'de' MMMM, yyyy", { locale: es })}
                  </Typography>
                  {attention.appointments && attention.appointments.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Total de citas: {attention.appointments.length}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<StarIcon />}
                  onClick={() => handleOpenFeedbackDialog(attention)}
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
        <DialogTitle>Calificar Atención</DialogTitle>
        <DialogContent>
          {selectedAttention && (
            <Box sx={{ mb: 3, mt: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {selectedAttention.treatmentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Practicante: {selectedAttention.practitionerName}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Calificación *
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue || 0)}
                size="large"
                precision={1}
              />
              {rating > 0 && (
                <Typography variant="body2" color="text.secondary">
                  ({rating} {rating === 1 ? 'estrella' : 'estrellas'})
                </Typography>
              )}
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comentarios (opcional)"
            placeholder="Comparte tu experiencia con este practicante..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            inputProps={{ maxLength: 1000 }}
            helperText={`${comment.length}/1000 caracteres`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeedbackDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            disabled={rating === 0 || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? 'Enviando...' : 'Enviar Calificación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
