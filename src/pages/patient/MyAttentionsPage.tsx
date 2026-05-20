import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../services/api/patientService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import StatusChip from '../../components/common/StatusChip';
import {
  EmptyState,
  getAppointmentStatusLabel,
  getAppointmentStatusTone,
  getAttentionStatusLabel,
  getAttentionStatusTone,
  mapBusinessError,
  useMyAttentions,
  usePatientFeedback,
} from '../../features/patient';

export default function MyAttentionsPage() {
  const { attentions, feedbackByAttentionId, loading, error, reload } = useMyAttentions();
  const { notifySuccess, notifyError } = usePatientFeedback();
  const [tabValue, setTabValue] = useState(0);
  const [expandedId, setExpandedId] = useState<string | false>(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<AttentionResponseDTO | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeAttentions = attentions.filter((a) => a.status === 'IN_PROGRESS');
  const completedAttentions = attentions.filter((a) => a.status === 'COMPLETED');
  const displayed = tabValue === 0 ? activeAttentions : completedAttentions;

  const openFeedbackFor = (attention: AttentionResponseDTO) => {
    const existing = feedbackByAttentionId[attention.id];
    setSelected(attention);
    if (existing) {
      setViewOpen(true);
    } else {
      setRating(0);
      setComment('');
      setCreateOpen(true);
    }
  };

  const submitFeedback = async () => {
    if (!selected || rating === 0) return;
    setSubmitting(true);
    try {
      await patientService.createFeedback({
        attentionId: selected.id,
        rating,
        comment: comment.trim() || undefined,
      });
      notifySuccess('Calificación enviada correctamente.');
      setCreateOpen(false);
      setSelected(null);
      reload();
    } catch (err) {
      const { message } = mapBusinessError(err, 'No pudimos enviar tu calificación.');
      notifyError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
        >
          Mis Atenciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Revisa el estado de tus tratamientos y atenciones odontológicas.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
          <Tab label={`En curso (${activeAttentions.length})`} />
          <Tab label={`Completadas (${completedAttentions.length})`} />
        </Tabs>
      </Paper>

      {loading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={96} />
          ))}
        </Stack>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={<HealthAndSafetyIcon sx={{ fontSize: 36 }} />}
          title={
            tabValue === 0
              ? 'No tienes atenciones en curso'
              : 'Aún no tienes atenciones completadas'
          }
          description={
            tabValue === 0
              ? 'Cuando el practicante inicie tu tratamiento aparecerá aquí.'
              : 'El historial de tus tratamientos finalizados aparecerá aquí.'
          }
        />
      ) : (
        <Stack spacing={1.5}>
          {displayed.map((attention) => (
            <Accordion
              key={attention.id}
              elevation={0}
              expanded={expandedId === String(attention.id)}
              onChange={(_, isExpanded) => setExpandedId(isExpanded ? String(attention.id) : false)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: 0 },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: { xs: 2, sm: 2.5, md: 3 }, py: { xs: 1, sm: 1.5 } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 1 }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {attention.treatmentName}
                      </Typography>
                      <StatusChip
                        label={getAttentionStatusLabel(attention.status)}
                        tone={getAttentionStatusTone(attention.status)}
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {attention.practitionerName}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Inicio: {format(new Date(attention.startDate), "d 'de' MMM, yyyy", { locale: es })}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  {attention.status === 'COMPLETED' && expandedId !== String(attention.id) && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<StarIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        openFeedbackFor(attention);
                      }}
                      sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                    >
                      {feedbackByAttentionId[attention.id] ? 'Ver calificación' : 'Calificar'}
                    </Button>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2, sm: 2.5, md: 3 }, pb: { xs: 2, sm: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Información de la atención
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tratamiento:</strong> {attention.treatmentName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Practicante:</strong> {attention.practitionerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fecha de inicio:</strong>{' '}
                      {format(new Date(attention.startDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Estado:</strong> {getAttentionStatusLabel(attention.status)}
                    </Typography>
                  </Paper>

                  {attention.appointments && attention.appointments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Turnos asociados ({attention.appointments.length})
                      </Typography>
                      <Stack spacing={1}>
                        {attention.appointments.map((appointment) => (
                          <Paper
                            key={appointment.id}
                            variant="outlined"
                            sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}
                          >
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              spacing={1}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {format(
                                    new Date(appointment.appointmentTime),
                                    "EEEE d 'de' MMMM 'a las' HH:mm",
                                    { locale: es }
                                  )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Duración: {appointment.durationInMinutes} minutos
                                </Typography>
                                {appointment.cancellationReason && (
                                  <Typography
                                    variant="caption"
                                    color="error.main"
                                    sx={{ display: 'block', mt: 0.5 }}
                                  >
                                    Motivo: {appointment.cancellationReason}
                                  </Typography>
                                )}
                              </Box>
                              <StatusChip
                                label={getAppointmentStatusLabel(appointment.status)}
                                tone={getAppointmentStatusTone(appointment.status)}
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {attention.status === 'COMPLETED' && (
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<StarIcon />}
                        onClick={() => openFeedbackFor(attention)}
                      >
                        {feedbackByAttentionId[attention.id] ? 'Ver calificación' : 'Calificar atención'}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      <Dialog open={createOpen} onClose={() => !submitting && setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Calificar atención
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cuéntanos cómo fue tu experiencia con el practicante.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selected && (
            <Paper
              variant="outlined"
              sx={{ p: 2.5, mb: 3, backgroundColor: 'action.hover', borderRadius: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {selected.treatmentName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Practicante: <strong>{selected.practitionerName}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(selected.startDate), "d 'de' MMMM, yyyy", { locale: es })}
              </Typography>
            </Paper>
          )}

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Satisfacción general
            </Typography>
            <Rating
              value={rating}
              onChange={(_, v) => setRating(v ?? 0)}
              size="large"
              sx={{ '& .MuiRating-icon': { fontSize: '2.3rem' } }}
            />
          </Stack>

          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Comentarios (opcional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Escribe un comentario adicional…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            inputProps={{ maxLength: 1000 }}
            helperText={`${comment.length}/1000 caracteres`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={submitting} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            onClick={submitFeedback}
            variant="contained"
            disabled={rating === 0 || submitting}
            sx={{ flex: 1 }}
          >
            {submitting ? 'Enviando…' : 'Enviar calificación'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0, pr: 6 }}>
          <Typography variant="h5" fontWeight={700}>
            Tu calificación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Calificación enviada para esta atención.
          </Typography>
          <IconButton
            aria-label="cerrar"
            onClick={() => setViewOpen(false)}
            sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selected && feedbackByAttentionId[selected.id] && (
            <>
              <Paper
                variant="outlined"
                sx={{ p: 2.5, mb: 3, backgroundColor: 'action.hover', borderRadius: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {selected.treatmentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.practitionerName} •{' '}
                  {format(new Date(selected.startDate), 'dd/MM/yyyy', { locale: es })}
                </Typography>
              </Paper>

              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" fontWeight={600} color="text.secondary">
                  Satisfacción general
                </Typography>
                <Rating
                  value={feedbackByAttentionId[selected.id]?.rating}
                  readOnly
                  size="large"
                  sx={{ display: 'flex', mt: 1, '& .MuiRating-icon': { fontSize: '2.3rem' } }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" fontWeight={600} color="text.secondary">
                  Comentario
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, mt: 1, borderRadius: 2, backgroundColor: 'action.hover' }}
                >
                  <Typography variant="body1">
                    {feedbackByAttentionId[selected.id]?.comment || 'Sin comentario.'}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="overline" fontWeight={600} color="text.secondary">
                  Fecha de calificación
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {feedbackByAttentionId[selected.id]?.createdAt &&
                    format(
                      new Date(feedbackByAttentionId[selected.id]!.createdAt),
                      "dd/MM/yyyy 'a las' HH:mm",
                      { locale: es }
                    )}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setViewOpen(false)} variant="contained" fullWidth>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
