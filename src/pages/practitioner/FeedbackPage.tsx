import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Rating,
  Divider,
  Chip,
  Paper,
  Stack,
} from '@mui/material';
import { Star, Person, MedicalServices } from '@mui/icons-material';
import { getMyAttentions } from '../../services/api/practitionerService';
import { getFeedbackForAttention } from '../../services/api/feedbackService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type { FeedbackResponseDTO } from '../../types/feedback.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface AttentionWithFeedback extends AttentionResponseDTO {
  feedback: FeedbackResponseDTO[];
}

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attentionsWithFeedback, setAttentionsWithFeedback] = useState<AttentionWithFeedback[]>([]);

  useEffect(() => {
    loadAttentionsAndFeedback();
  }, []);

  const loadAttentionsAndFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todas las atenciones
      const attentions = await getMyAttentions();
      
      // Filtrar solo las atenciones completadas
      const completedAttentions = attentions.filter(
        (attention) => attention.status === 'COMPLETED'
      );
      
      // Cargar feedback para cada atención completada
      const attentionsWithFeedbackData = await Promise.all(
        completedAttentions.map(async (attention) => {
          try {
            const allFeedback = await getFeedbackForAttention(attention.id);
            // FILTRAR: Solo el feedback que el practicante RECIBIÓ (de pacientes)
            const feedbackRecibido = allFeedback.filter(
              (f) => f.submittedByRole === 'PATIENT'
            );
            return { ...attention, feedback: feedbackRecibido };
          } catch (err) {
            console.error(`Error loading feedback for attention ${attention.id}:`, err);
            return { ...attention, feedback: [] };
          }
        })
      );
      
      // Filtrar solo las atenciones que tienen al menos un feedback RECIBIDO
      const attentionsWithActualFeedback = attentionsWithFeedbackData.filter(
        (attention) => attention.feedback.length > 0
      );
      
      setAttentionsWithFeedback(attentionsWithActualFeedback);
    } catch (err) {
      console.error('Error loading attentions and feedback:', err);
      setError('Error al cargar el feedback');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas generales
  const totalFeedbacks = attentionsWithFeedback.reduce(
    (sum, attention) => sum + attention.feedback.length,
    0
  );
  
  const averageRating = totalFeedbacks > 0
    ? attentionsWithFeedback.reduce(
        (sum, attention) => 
          sum + attention.feedback.reduce((s, f) => s + f.rating, 0),
        0
      ) / totalFeedbacks
    : 0;

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
        Feedback Recibido
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Calificaciones y comentarios que tus pacientes te han dado
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tarjeta de resumen */}
      {totalFeedbacks > 0 && (
        <Card sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent sx={{ textAlign: 'center', color: 'white' }}>
            <Star sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h2" fontWeight={700}>
              {averageRating.toFixed(1)}
            </Typography>
            <Rating value={averageRating} readOnly precision={0.1} size="large" sx={{ color: '#fff' }} />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Promedio de {totalFeedbacks} calificación{totalFeedbacks !== 1 ? 'es' : ''} en {attentionsWithFeedback.length} atención{attentionsWithFeedback.length !== 1 ? 'es' : ''}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Lista de atenciones con feedback */}
      {attentionsWithFeedback.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
          <CardContent>
            <Star sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No has recibido feedback de pacientes aún
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las calificaciones de tus pacientes aparecerán aquí una vez que completen el feedback
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {attentionsWithFeedback.map((attention) => (
            <Grid size={{ xs: 12 }} key={attention.id}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {/* Encabezado de la atención */}
                <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <MedicalServices />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {attention.treatmentName}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Person sx={{ fontSize: 16 }} />
                          {attention.patientName}
                        </Typography>
                        <Typography variant="body2">
                          {format(parseISO(attention.startDate), "dd/MM/yyyy")}
                        </Typography>
                      </Stack>
                    </Box>
                    <Chip 
                      label={`${attention.feedback.length} feedback${attention.feedback.length !== 1 ? 's' : ''}`} 
                      sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }}
                    />
                  </Stack>
                </Box>

                {/* Feedbacks de esta atención */}
                <CardContent>
                  <Grid container spacing={2}>
                    {attention.feedback.map((feedback) => (
                      <Grid size={{ xs: 12, md: 6 }} key={feedback.id}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2.5, 
                            borderRadius: 2, 
                            border: '2px solid',
                            borderColor: 'success.light',
                            bgcolor: 'success.50',
                            height: '100%',
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 3,
                              borderColor: 'success.main',
                            }
                          }}
                        >
                          {/* Autor del feedback - Solo se muestran feedbacks de PACIENTES */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                            <Box>
                              <Chip 
                                label="Calificación Recibida" 
                                size="small"
                                sx={{ 
                                  mb: 0.5,
                                  fontSize: '0.7rem',
                                  height: 20,
                                  fontWeight: 600,
                                  bgcolor: 'success.main',
                                  color: 'white',
                                }}
                              />
                              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                {feedback.submittedByName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Paciente
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Rating value={feedback.rating} readOnly size="small" />
                              <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>
                                {feedback.rating}/5
                              </Typography>
                            </Box>
                          </Box>

                          {/* Comentario */}
                          {feedback.comment && (
                            <>
                              <Divider sx={{ my: 1.5 }} />
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                "{feedback.comment}"
                              </Typography>
                            </>
                          )}

                          {/* Fecha */}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                            {format(parseISO(feedback.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
