import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { MedicalServices as MedicalServicesIcon, Star as StarIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../services/api/patientService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type { FeedbackResponseDTO } from '../../types/feedback.types';
import FeedbackScoresDisplay from '../../components/common/FeedbackScoresDisplay';

interface FeedbackItem {
  attention: AttentionResponseDTO;
  feedback: FeedbackResponseDTO;
}

export default function PatientFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true);
        setError(null);

        const attentions = await patientService.getMyAttentions();
        const completedAttentions = attentions.filter((attention) => attention.status === 'COMPLETED');

        let receivedFeedback = [] as FeedbackResponseDTO[];

        try {
          receivedFeedback = await patientService.getReceivedFeedback();
        } catch (receivedFeedbackError) {
          console.warn('getReceivedFeedback failed, falling back to attention-based lookup', receivedFeedbackError);

          const feedbackByAttention = await Promise.all(
            completedAttentions.map(async (attention) => {
              try {
                return await patientService.getFeedbackForAttention(attention.id);
              } catch {
                return [] as FeedbackResponseDTO[];
              }
            })
          );

          receivedFeedback = feedbackByAttention.flat();
        }

        const isPractitionerRole = (role?: string | null) => {
          if (!role) return false;
          const r = String(role).toUpperCase();
          return r.includes('PRACT') || r.includes('PRAC');
        };

        const feedbackFromPractitioner = receivedFeedback.filter((feedback) =>
          isPractitionerRole(feedback.submittedByRole)
        );

        const feedbackData: FeedbackItem[] = feedbackFromPractitioner
          .map((feedback) => {
            let attention = completedAttentions.find((item) => item.id === feedback.attentionId);
            if (!attention) {
              attention = {
                id: feedback.attentionId,
                status: 'COMPLETED',
                startDate: feedback.createdAt || new Date().toISOString(),
                patientId: 0,
                patientName: feedback.patientName || '',
                practitionerId: 0,
                practitionerName: feedback.practitionerName || '',
                treatmentId: 0,
                treatmentName: feedback.treatmentName || 'Sin tratamiento',
                appointments: [],
              } as AttentionResponseDTO;
            }

            return { attention, feedback } as FeedbackItem;
          })
          .filter(Boolean);

        setFeedbackItems(feedbackData);
      } catch (err) {
        console.error('Error loading feedback:', err);
        setError('Error al cargar el feedback recibido');
      } finally {
        setLoading(false);
      }
    };

    void loadFeedback();
  }, []);

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
        Revisa las evaluaciones que tu practicante dejó sobre tus atenciones.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {feedbackItems.length === 0 ? (
        <Paper
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <StarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aún no tienes feedback recibido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Las evaluaciones de tus practicantes aparecerán aquí una vez que registren feedback sobre tus atenciones.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {feedbackItems.map(({ attention, feedback }) => (
            <Paper
              key={feedback.id}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '4px solid',
                borderLeftColor: 'primary.main',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[4],
                  borderColor: 'primary.main',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    icon={<MedicalServicesIcon />}
                    label="Practicante"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, mb: 1.5 }}
                  />
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    Feedback recibido en {attention.treatmentName}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Por: <strong>{feedback.submittedByName || feedback.practitionerName}</strong>
                    </Typography>
                    <Chip
                      label={attention.treatmentName}
                      size="small"
                      variant="outlined"
                      sx={{ bgcolor: 'background.paper' }}
                    />
                  </Box>
                </Box>
                <Chip
                  label={format(parseISO(feedback.createdAt), 'dd/MM/yyyy', { locale: es })}
                  size="small"
                  sx={{ bgcolor: 'action.hover', fontWeight: 600 }}
                />
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Calificación por criterio
                </Typography>
                <FeedbackScoresDisplay scores={feedback.scores} variant="expanded" size="medium" />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Paciente: <strong>{attention.patientName}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atención:{' '}
                    <strong>{format(parseISO(attention.startDate), "d 'de' MMMM, yyyy", { locale: es })}</strong>
                  </Typography>
                </Box>
              </Paper>

              <Box sx={{ mt: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Comentario
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography
                    variant="body2"
                    color={feedback.comment ? 'text.primary' : 'text.secondary'}
                    sx={{ fontStyle: feedback.comment ? 'italic' : 'normal', whiteSpace: 'pre-wrap' }}
                  >
                    {feedback.comment || 'Sin comentario.'}
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
