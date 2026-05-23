import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Rating,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import {
  Assignment,
  Close,
  GridView as GridViewIcon,
  RateReview,
  Star,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AttentionCard,
  EmptyState,
  useMyAttentions,
  useOfferedTreatments,
} from '../../features/practitioner';
import AttentionListTable from '../../features/practitioner/components/attentions/AttentionListTable';
import { createFeedback, getFeedbackForAttention } from '../../services/api/feedbackService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type {
  CreateFeedbackRequestDTO,
  FeedbackResponseDTO,
} from '../../types/feedback.types';
import { useAuthStore } from '../../store/authStore';
import { isPractitionerRole } from '../../utils/roles';

type ViewMode = 'cards' | 'list';

interface AttentionWithFeedback extends AttentionResponseDTO {
  feedbackCount?: number;
  hasMyFeedback?: boolean;
}

export default function AttentionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { attentions, loading } = useMyAttentions();
  const { offers } = useOfferedTreatments();

  const offersByTreatmentId = useMemo(() => {
    const map = new Map<number, (typeof offers)[number]>();
    offers.forEach((o) => map.set(o.treatment.id, o));
    return map;
  }, [offers]);

  const [tabValue, setTabValue] = useState(0);
  const [view, setView] = useState<ViewMode>('cards');
  const [enrichedAttentions, setEnrichedAttentions] = useState<AttentionWithFeedback[]>([]);
  const [enrichLoading, setEnrichLoading] = useState(false);

  // Academic feedback dialogs (orthogonal concern, kept inline because they
  // do not need the full detail page context).
  const [feedbackViewTarget, setFeedbackViewTarget] = useState<AttentionResponseDTO | null>(null);
  const [feedbackCreateTarget, setFeedbackCreateTarget] = useState<AttentionResponseDTO | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackResponseDTO[]>([]);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Enrich completed attentions with feedback metadata so the cards/rows can
  // show whether the practitioner already left a rating.
  useEffect(() => {
    let cancelled = false;
    const enrich = async () => {
      if (!user?.userId || attentions.length === 0) {
        setEnrichedAttentions(attentions);
        return;
      }
      setEnrichLoading(true);
      try {
        const enriched = await Promise.all(
          attentions.map(async (att) => {
            if (att.status !== 'COMPLETED') return att;
            try {
              const allFeedback = await getFeedbackForAttention(att.id);
              const hasMyFeedback = allFeedback.some(
                (f) =>
                  isPractitionerRole(f.submittedByRole) &&
                  Number(f.submittedById) === user.userId
              );
              return { ...att, feedbackCount: allFeedback.length, hasMyFeedback };
            } catch {
              return { ...att, feedbackCount: 0, hasMyFeedback: false };
            }
          })
        );
        if (!cancelled) setEnrichedAttentions(enriched);
      } finally {
        if (!cancelled) setEnrichLoading(false);
      }
    };
    void enrich();
    return () => {
      cancelled = true;
    };
  }, [attentions, user?.userId]);

  const { inProgress, completed } = useMemo(() => {
    const ip = enrichedAttentions.filter((a) => a.status === 'IN_PROGRESS');
    const c = enrichedAttentions.filter((a) => a.status === 'COMPLETED');
    return { inProgress: ip, completed: c };
  }, [enrichedAttentions]);

  const displayed = tabValue === 0 ? inProgress : completed;

  const handleOpenDetail = (attention: AttentionResponseDTO) => {
    navigate(`/practitioner/attentions/${attention.id}`);
  };

  const handleOpenFeedbackView = async (attention: AttentionResponseDTO) => {
    setFeedbackViewTarget(attention);
    try {
      const list = await getFeedbackForAttention(attention.id);
      setFeedbackList(list);
    } catch {
      setFeedbackError('Error al cargar el feedback.');
    }
  };

  const handleOpenFeedbackCreate = (attention: AttentionResponseDTO) => {
    setFeedbackCreateTarget(attention);
    setFeedbackRating(null);
    setFeedbackComment('');
    setFeedbackError(null);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackCreateTarget || !feedbackRating) {
      setFeedbackError('Debes seleccionar una calificación.');
      return;
    }
    if (feedbackComment.length > 1000) {
      setFeedbackError('El comentario no puede exceder 1000 caracteres.');
      return;
    }
    const targetId = feedbackCreateTarget.id;
    try {
      const payload: CreateFeedbackRequestDTO = {
        attentionId: targetId,
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      };
      await createFeedback(payload);
      setEnrichedAttentions((current) =>
        current.map((attention) =>
          attention.id === targetId
            ? {
                ...attention,
                hasMyFeedback: true,
                feedbackCount: (attention.feedbackCount ?? 0) + 1,
              }
            : attention
        )
      );
      setFeedbackSuccess('Feedback enviado.');
      setFeedbackCreateTarget(null);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      setFeedbackError(
        status === 400
          ? 'Ya calificaste esta atención o la atención no está completada.'
          : 'Error al enviar el feedback.'
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Atenciones
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestioná los casos clínicos de tus pacientes
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={view}
          exclusive
          size="small"
          onChange={(_, next) => {
            if (next) setView(next as ViewMode);
          }}
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              borderColor: 'divider',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            },
          }}
        >
          <Tooltip title="Vista de tarjetas">
            <ToggleButton value="cards" aria-label="Vista de tarjetas">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Vista de lista">
            <ToggleButton value="list" aria-label="Vista de lista">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Stack>

      <Paper
        elevation={0}
        sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
          <Tab label={`En curso (${inProgress.length})`} />
          <Tab label={`Completadas (${completed.length})`} />
        </Tabs>
      </Paper>

      {displayed.length === 0 ? (
        <EmptyState
          icon={<Assignment />}
          title={
            tabValue === 0
              ? 'No tienes atenciones en curso'
              : 'Aún no completaste ninguna atención'
          }
          description={
            tabValue === 0
              ? 'Cuando un paciente reserve un turno con una de tus ofertas, su atención clínica aparecerá aquí para que puedas registrar la evolución y finalizarla.'
              : 'Las atenciones que finalices se acumularán acá para consulta histórica.'
          }
          tone="neutral"
        />
      ) : view === 'cards' ? (
        <Grid container spacing={3}>
          {displayed.map((attention) => (
            <Grid size={{ xs: 12, md: 6 }} key={attention.id}>
              <AttentionCard
                attention={attention}
                treatmentOffer={offersByTreatmentId.get(attention.treatmentId)}
                onOpenDetail={handleOpenDetail}
                secondaryActions={
                  attention.status === 'COMPLETED' ? (
                    <>
                      {attention.feedbackCount !== undefined && (
                        <Badge badgeContent={attention.feedbackCount} color="primary">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RateReview />}
                            onClick={() => handleOpenFeedbackView(attention)}
                          >
                            Ver feedback
                          </Button>
                        </Badge>
                      )}
                      {!attention.hasMyFeedback && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<RateReview />}
                          onClick={() => handleOpenFeedbackCreate(attention)}
                        >
                          Calificar paciente
                        </Button>
                      )}
                    </>
                  ) : null
                }
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <AttentionListTable
          attentions={displayed}
          onOpenDetail={handleOpenDetail}
        />
      )}

      {enrichLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Academic feedback — view */}
      <Dialog
        open={feedbackViewTarget != null}
        onClose={() => setFeedbackViewTarget(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (t) => alpha(t.palette.info.main, 0.04),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Star sx={{ color: 'info.main' }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Feedback de la atención
              </Typography>
              {feedbackViewTarget && (
                <Typography variant="caption" color="text.secondary">
                  {feedbackViewTarget.patientName} · {feedbackViewTarget.treatmentName}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={() => setFeedbackViewTarget(null)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {feedbackList.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No hay feedback registrado para esta atención.
            </Alert>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {feedbackList.map((feedback) => (
                <Paper
                  key={feedback.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Chip
                        label={
                          feedback.submittedByRole === 'PATIENT'
                            ? 'Calificación del paciente'
                            : 'Tu calificación'
                        }
                        size="small"
                        color={feedback.submittedByRole === 'PATIENT' ? 'success' : 'info'}
                        sx={{ mb: 1, fontWeight: 600 }}
                      />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {feedback.submittedByRole === 'PATIENT'
                          ? `${feedback.submittedByName} te calificó`
                          : `Calificaste a ${feedback.patientName}`}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Rating value={feedback.rating} readOnly size="small" />
                      <Typography variant="caption" display="block" fontWeight={600}>
                        {feedback.rating}/5
                      </Typography>
                    </Box>
                  </Box>
                  {feedback.comment && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        "{feedback.comment}"
                      </Typography>
                    </>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1.5, display: 'block' }}
                  >
                    {format(parseISO(feedback.createdAt), "dd 'de' MMMM 'de' yyyy · HH:mm", {
                      locale: es,
                    })}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackViewTarget(null)} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Academic feedback — create */}
      <Dialog
        open={feedbackCreateTarget != null}
        onClose={() => setFeedbackCreateTarget(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (t) => alpha(t.palette.warning.main, 0.04),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Star sx={{ color: 'warning.main' }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Calificar paciente
              </Typography>
              {feedbackCreateTarget && (
                <Typography variant="caption" color="text.secondary">
                  {feedbackCreateTarget.patientName} · {feedbackCreateTarget.treatmentName}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={() => setFeedbackCreateTarget(null)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {feedbackError && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }} onClose={() => setFeedbackError(null)}>
              {feedbackError}
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              ¿Cómo fue tu experiencia con este paciente?
            </Typography>
            <Rating
              value={feedbackRating}
              onChange={(_, v) => setFeedbackRating(v)}
              size="large"
              sx={{ mt: 1 }}
            />
          </Box>

          <TextField
            label="Comentario (opcional)"
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Puntualidad, colaboración, seguimiento de indicaciones…"
            helperText={`${feedbackComment.length}/1000 caracteres`}
            error={feedbackComment.length > 1000}
            inputProps={{ maxLength: 1000 }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            Tu calificación será visible para el docente supervisor.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackCreateTarget(null)}>Cancelar</Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            disabled={!feedbackRating}
          >
            Enviar calificación
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedbackSuccess)}
        autoHideDuration={3500}
        onClose={() => setFeedbackSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setFeedbackSuccess(null)}>
          {feedbackSuccess}
        </Alert>
      </Snackbar>
    </Box>
  );
}
