import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Rating,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  FormatQuote as QuoteIcon,
  MedicalServices as TreatmentIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../services/api/patientService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type { FeedbackResponseDTO } from '../../types/feedback.types';
import { isPractitionerRole } from '../../utils/roles';
import { averageScore } from '../../utils/feedbackScores';
import FeedbackScoresDisplay from '../../components/common/FeedbackScoresDisplay';

interface FeedbackItem {
  attention: AttentionResponseDTO;
  feedback: FeedbackResponseDTO;
  avg: number;
}

export default function PatientFeedbackPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      const attentions = await patientService.getMyAttentions();
      const completedAttentions = attentions.filter((a) => a.status === 'COMPLETED');

      let receivedFeedback: FeedbackResponseDTO[] = [];

      try {
        receivedFeedback = await patientService.getReceivedFeedback();
      } catch {
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

      const feedbackFromPractitioner = receivedFeedback.filter((fb) =>
        isPractitionerRole(fb.submittedByRole)
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
          return { attention, feedback, avg: averageScore(feedback.scores) };
        })
        .sort((a, b) => new Date(b.feedback.createdAt).getTime() - new Date(a.feedback.createdAt).getTime());

      setFeedbackItems(feedbackData);
    } catch (err) {
      console.error('Error loading feedback:', err);
      setError('Error al cargar el feedback recibido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFeedback();
  }, []);

  const overallAvg = useMemo(() => {
    if (feedbackItems.length === 0) return 0;
    return feedbackItems.reduce((s, f) => s + f.avg, 0) / feedbackItems.length;
  }, [feedbackItems]);

  const uniquePractitioners = useMemo(
    () => new Set(feedbackItems.map((f) => f.feedback.practitionerName)).size,
    [feedbackItems]
  );

  const toggleExpanded = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (value: string) => {
    try {
      return format(parseISO(value), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return value;
    }
  };

  const formatDateShort = (value: string) => {
    try {
      return format(parseISO(value), "dd 'de' MMM yyyy", { locale: es });
    } catch {
      return value;
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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Evaluaciones recibidas
          </Typography>
          <Typography variant="bodyMedium" color="text.secondary">
            Así te evaluaron los practicantes que te atendieron.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void loadFeedback()}
          disabled={loading}
        >
          Refrescar
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {feedbackItems.length === 0 ? (
        /* ── Empty state ── */
        <Paper
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            backgroundColor: theme.palette.surfaces.containerLow,
            border: `1px solid ${theme.palette.outlineVariant}`,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              mx: 'auto',
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.surfaces.container,
              border: `1px solid ${theme.palette.outlineVariant}`,
            }}
          >
            <StarIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
          </Box>
          <Typography variant="titleLarge" fontWeight={600} gutterBottom>
            Aún no tienes evaluaciones
          </Typography>
          <Typography variant="bodyMedium" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto' }}>
            Cuando tus practicantes registren feedback sobre tus atenciones completadas,
            podrás verlo aquí.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* ── Summary banner ── */}
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              mb: 3,
              backgroundColor: theme.palette.primary.container,
              color: theme.palette.primary.onContainer,
              border: `1px solid ${theme.palette.outlineVariant}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2.5, sm: 4 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              {/* Score */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="displaySmall" fontWeight={700} sx={{ lineHeight: 1 }}>
                  {overallAvg.toFixed(1)}
                </Typography>
                <Box>
                  <Rating
                    value={overallAvg}
                    readOnly
                    precision={0.1}
                    size="medium"
                  />
                  <Typography variant="labelSmall" sx={{ display: 'block' }}>
                    Promedio general
                  </Typography>
                </Box>
              </Stack>

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: 'inherit',
                  opacity: 0.25,
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Divider
                sx={{
                  borderColor: 'inherit',
                  opacity: 0.25,
                  display: { xs: 'block', sm: 'none' },
                  width: '100%',
                }}
              />

              {/* Stats */}
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="titleLarge" fontWeight={700}>
                    {feedbackItems.length}
                  </Typography>
                  <Typography variant="labelSmall">
                    {feedbackItems.length === 1 ? 'evaluación' : 'evaluaciones'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="titleLarge" fontWeight={700}>
                    {uniquePractitioners}
                  </Typography>
                  <Typography variant="labelSmall">
                    {uniquePractitioners === 1 ? 'practicante' : 'practicantes'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>

          {/* ── Feedback cards ── */}
          <Stack spacing={2}>
            {feedbackItems.map(({ attention, feedback, avg }) => {
              const isExpanded = expandedId === feedback.id;

              return (
                <Paper
                  key={feedback.id}
                  sx={{
                    overflow: 'hidden',
                    backgroundColor: theme.palette.surfaces.containerLow,
                    border: `1px solid ${theme.palette.outlineVariant}`,
                    transition: `border-color ${theme.motion?.duration?.short3 ?? 200}ms`,
                    '&:hover': { borderColor: theme.palette.primary.main },
                  }}
                >
                  {/* Card header — always visible */}
                  <Box
                    sx={{
                      p: { xs: 2, md: 2.5 },
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => toggleExpanded(feedback.id)}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 1.5, sm: 2 }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      {/* Practitioner identity */}
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.palette.primary.container,
                            color: theme.palette.primary.onContainer,
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 22 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="titleSmall" fontWeight={700} noWrap>
                            {feedback.submittedByName || feedback.practitionerName}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip
                              icon={<TreatmentIcon />}
                              label={attention.treatmentName}
                              size="small"
                              sx={{
                                height: 24,
                                backgroundColor: theme.palette.tertiary.container,
                                color: theme.palette.tertiary.onContainer,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '& .MuiChip-icon': { color: 'inherit', fontSize: 14 },
                              }}
                            />
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <CalendarIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                              <Typography variant="labelSmall" color="text.secondary">
                                {formatDateShort(feedback.createdAt)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      </Stack>

                      {/* Score + expand */}
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="titleMedium" fontWeight={700}>
                            {avg.toFixed(1)}
                          </Typography>
                          <Rating value={avg} readOnly precision={0.1} size="small" />
                        </Box>
                        <IconButton
                          size="small"
                          sx={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: `transform ${theme.motion?.duration?.short3 ?? 200}ms`,
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Comment preview — collapsed state */}
                    {!isExpanded && feedback.comment && (
                      <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mt: 1.5, pl: { xs: 0, sm: 7 } }}>
                        <QuoteIcon sx={{ fontSize: 14, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                        <Typography
                          variant="bodySmall"
                          color="text.secondary"
                          sx={{
                            fontStyle: 'italic',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {feedback.comment}
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  {/* Expanded content */}
                  <Collapse in={isExpanded}>
                    <Divider sx={{ borderColor: theme.palette.outlineVariant }} />
                    <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                      {/* Scores detail */}
                      <Paper
                        sx={{
                          p: 2.5,
                          mb: 2.5,
                          backgroundColor: theme.palette.surfaces.container,
                          border: `1px solid ${theme.palette.outlineVariant}`,
                        }}
                      >
                        <Typography variant="titleSmall" fontWeight={700} sx={{ mb: 2 }}>
                          Detalle por criterio
                        </Typography>
                        <FeedbackScoresDisplay scores={feedback.scores} variant="expanded" size="medium" />
                      </Paper>

                      {/* Comment */}
                      <Paper
                        sx={{
                          p: 2.5,
                          mb: 2,
                          backgroundColor: feedback.comment
                            ? theme.palette.surfaces.container
                            : 'transparent',
                          border: `1px solid ${theme.palette.outlineVariant}`,
                        }}
                      >
                        <Typography variant="titleSmall" fontWeight={700} sx={{ mb: 1.5 }}>
                          Comentario del practicante
                        </Typography>
                        {feedback.comment ? (
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <QuoteIcon sx={{ fontSize: 20, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                            <Typography
                              variant="bodyMedium"
                              sx={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }}
                            >
                              {feedback.comment}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="bodyMedium" color="text.secondary">
                            El practicante no dejó un comentario.
                          </Typography>
                        )}
                      </Paper>

                      {/* Metadata */}
                      <Stack
                        direction="row"
                        spacing={2}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ color: 'text.secondary' }}
                      >
                        <Typography variant="labelSmall">
                          Atención iniciada: {formatDate(attention.startDate)}
                        </Typography>
                        <Typography variant="labelSmall">
                          Evaluado: {formatDate(feedback.createdAt)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Stack>
        </>
      )}
    </Box>
  );
}
