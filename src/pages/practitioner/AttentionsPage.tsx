import { useEffect, useMemo, useState } from 'react';
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
  Typography,
  alpha,
} from '@mui/material';
import { Assignment, Close, RateReview, Star } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AddProgressNoteDialog,
  AttentionCard,
  CancelAttentionDialog,
  EmptyState,
  FinalizeAttentionDialog,
  ProgressNoteTimeline,
  mapPractitionerError,
  useAttentionDetail,
  useMyAttentions,
  useOfferedTreatments,
} from '../../features/practitioner';
import {
  addProgressNote,
  cancelAttention,
  finalizeAttention,
} from '../../services/api/practitionerService';
import { createFeedback, getFeedbackForAttention } from '../../services/api/feedbackService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type {
  CreateFeedbackRequestDTO,
  FeedbackResponseDTO,
} from '../../types/feedback.types';
import { useAuthStore } from '../../store/authStore';

const isPractitionerRole = (role?: string | null) => {
  if (!role) return false;
  return String(role).toUpperCase().includes('PRACT');
};

interface AttentionWithFeedback extends AttentionResponseDTO {
  feedbackCount?: number;
  hasMyFeedback?: boolean;
}

export default function AttentionsPage() {
  const { user } = useAuthStore();
  const { attentions, loading, reload } = useMyAttentions();
  const { offers } = useOfferedTreatments();

  const offersByTreatmentId = useMemo(() => {
    const map = new Map<number, typeof offers[number]>();
    offers.forEach((o) => map.set(o.treatment.id, o));
    return map;
  }, [offers]);

  const [tabValue, setTabValue] = useState(0);
  const [enrichedAttentions, setEnrichedAttentions] = useState<AttentionWithFeedback[]>([]);
  const [enrichLoading, setEnrichLoading] = useState(false);

  // Practitioner-driven dialogs
  const [evolutionTarget, setEvolutionTarget] = useState<AttentionResponseDTO | null>(null);
  const [addNoteTarget, setAddNoteTarget] = useState<AttentionResponseDTO | null>(null);
  const [finalizeTarget, setFinalizeTarget] = useState<AttentionResponseDTO | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AttentionResponseDTO | null>(null);

  // Academic feedback dialogs (orthogonal concern, kept inline)
  const [feedbackViewTarget, setFeedbackViewTarget] = useState<AttentionResponseDTO | null>(null);
  const [feedbackCreateTarget, setFeedbackCreateTarget] = useState<AttentionResponseDTO | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackResponseDTO[]>([]);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const detail = useAttentionDetail(evolutionTarget?.id ?? null);

  // Standalone mutation state for the actions that don't need detail loaded.
  const [mutating, setMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);

  // Enrich completed attentions with feedback metadata
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

  const handleAddNote = async (content: string): Promise<boolean> => {
    if (!addNoteTarget) return false;
    setMutating(true);
    setMutationError(null);
    try {
      await addProgressNote(addNoteTarget.id, { content });
      setMutationSuccess('Nota de evolución agregada.');
      setAddNoteTarget(null);
      await reload();
      return true;
    } catch (err) {
      const mapped = mapPractitionerError(err, 'No se pudo agregar la nota.');
      setMutationError(mapped.message);
      return false;
    } finally {
      setMutating(false);
    }
  };

  const handleFinalizeConfirm = async () => {
    if (!finalizeTarget) return;
    setMutating(true);
    setMutationError(null);
    try {
      await finalizeAttention(finalizeTarget.id);
      setMutationSuccess('Atención finalizada.');
      setFinalizeTarget(null);
      await reload();
    } catch (err) {
      const mapped = mapPractitionerError(err, 'No se pudo finalizar la atención.');
      setMutationError(mapped.message);
    } finally {
      setMutating(false);
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget) return;
    setMutating(true);
    setMutationError(null);
    try {
      await cancelAttention(cancelTarget.id, { reason });
      setMutationSuccess('Caso clínico cancelado.');
      setCancelTarget(null);
      await reload();
    } catch (err) {
      const mapped = mapPractitionerError(err, 'No se pudo cancelar el caso.');
      setMutationError(mapped.message);
    } finally {
      setMutating(false);
    }
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
    try {
      const payload: CreateFeedbackRequestDTO = {
        attentionId: feedbackCreateTarget.id,
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      };
      await createFeedback(payload);
      setFeedbackSuccess('Feedback enviado.');
      setFeedbackCreateTarget(null);
      await reload();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Atenciones
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestiona los casos clínicos de tus pacientes
      </Typography>

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
      ) : (
        <Grid container spacing={3}>
          {displayed.map((attention) => (
            <Grid size={{ xs: 12, md: 6 }} key={attention.id}>
              <Box sx={{ position: 'relative' }}>
                <AttentionCard
                  attention={attention}
                  treatmentOffer={offersByTreatmentId.get(attention.treatmentId)}
                  onOpenEvolution={setEvolutionTarget}
                  onAddNote={setAddNoteTarget}
                  onFinalize={setFinalizeTarget}
                  onCancel={setCancelTarget}
                />
                {attention.status === 'COMPLETED' && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      px: 2,
                      pb: 2,
                      mt: -1,
                    }}
                  >
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
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {enrichLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Evolution dialog (history view) */}
      <Dialog
        open={evolutionTarget != null}
        onClose={() => setEvolutionTarget(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Historial de evoluciones
            </Typography>
            {evolutionTarget && (
              <Typography variant="caption" color="text.secondary">
                {evolutionTarget.patientName} · {evolutionTarget.treatmentName}
              </Typography>
            )}
          </Box>
          <IconButton onClick={() => setEvolutionTarget(null)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {detail.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ProgressNoteTimeline notes={detail.notes} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvolutionTarget(null)} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <AddProgressNoteDialog
        open={addNoteTarget != null}
        attentionLabel={
          addNoteTarget ? `${addNoteTarget.patientName} · ${addNoteTarget.treatmentName}` : undefined
        }
        submitting={mutating}
        onClose={() => setAddNoteTarget(null)}
        onSubmit={handleAddNote}
      />

      <FinalizeAttentionDialog
        open={finalizeTarget != null}
        attention={finalizeTarget}
        submitting={mutating}
        errorMessage={finalizeTarget ? mutationError : null}
        onClose={() => {
          setFinalizeTarget(null);
          setMutationError(null);
        }}
        onConfirm={handleFinalizeConfirm}
      />

      <CancelAttentionDialog
        open={cancelTarget != null}
        attention={cancelTarget}
        submitting={mutating}
        errorMessage={cancelTarget ? mutationError : null}
        onClose={() => {
          setCancelTarget(null);
          setMutationError(null);
        }}
        onConfirm={handleCancelConfirm}
      />

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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
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
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{feedback.comment}"
                      </Typography>
                    </>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                    {format(parseISO(feedback.createdAt), "dd 'de' MMMM 'de' yyyy · HH:mm", { locale: es })}
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

      <Snackbar
        open={Boolean(mutationSuccess)}
        autoHideDuration={3500}
        onClose={() => setMutationSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setMutationSuccess(null)}>
          {mutationSuccess}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(mutationError) && finalizeTarget == null && cancelTarget == null}
        autoHideDuration={5000}
        onClose={() => setMutationError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setMutationError(null)}>
          {mutationError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
