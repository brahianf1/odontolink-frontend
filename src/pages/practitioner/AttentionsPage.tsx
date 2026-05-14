import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating,
  Paper,
  Stack,
  Badge,
  IconButton,
  alpha,
  Tabs,
  Tab,
} from '@mui/material';
import { Add, CheckCircle, RateReview, Close, Description, Star } from '@mui/icons-material';
import {
  getMyAttentions,
  getProgressNotes,
  addProgressNote,
  finalizeAttention,
} from '../../services/api/practitionerService';
import { getFeedbackForAttention, createFeedback } from '../../services/api/feedbackService';
import type {
  AttentionResponseDTO,
  ProgressNoteResponseDTO,
  ProgressNoteRequestDTO,
} from '../../types/attention.types';
import type { FeedbackResponseDTO, CreateFeedbackRequestDTO } from '../../types/feedback.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';

const STATUS_CONFIG = {
  IN_PROGRESS: { label: 'En Progreso', color: 'primary' as const },
  COMPLETED: { label: 'Completada', color: 'success' as const },
  CANCELLED: { label: 'Cancelada', color: 'error' as const },
};

const isPractitionerRole = (role?: string | null) => {
  if (!role) return false;
  const normalizedRole = String(role).toUpperCase();
  return normalizedRole.includes('PRACT') || normalizedRole.includes('PRAC');
};

interface AttentionWithFeedback extends AttentionResponseDTO {
  feedbackCount?: number;
  hasMyFeedback?: boolean;
}

type EvolutionDialogMode = 'history' | 'add';

export default function AttentionsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [attentions, setAttentions] = useState<AttentionWithFeedback[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedAttention, setSelectedAttention] = useState<AttentionResponseDTO | null>(null);
  const [progressNotes, setProgressNotes] = useState<ProgressNoteResponseDTO[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackResponseDTO[]>([]);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [createFeedbackDialogOpen, setCreateFeedbackDialogOpen] = useState(false);
  const [evolutionDialogMode, setEvolutionDialogMode] = useState<EvolutionDialogMode>('history');
  const [noteContent, setNoteContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    if (!user?.userId) return;

    loadAttentions(user.userId);
  }, [user?.userId]);

  const loadAttentions = async (practitionerId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyAttentions();
      
      // Cargar conteo de feedback y verificar si el practicante ya dio feedback
      const attentionsWithFeedbackCount = await Promise.all(
        data.map(async (attention) => {
          if (attention.status === 'COMPLETED') {
            try {
              const allFeedback = await getFeedbackForAttention(attention.id);
              
              // Verificar si YO (el practicante logueado) ya di feedback
              // El practicante da feedback AL paciente, así que busco feedback
              // donde YO soy el autor (submittedById) Y mi rol es PRACTITIONER
              const hasMyFeedback = allFeedback.some(
                (f) => isPractitionerRole(f.submittedByRole) && Number(f.submittedById) === practitionerId
              );
              
              return { 
                ...attention, 
                feedbackCount: allFeedback.length,
                hasMyFeedback 
              };
            } catch {
              return { ...attention, feedbackCount: 0, hasMyFeedback: false };
            }
          }
          return attention;
        })
      );
      
      setAttentions(attentionsWithFeedbackCount);
    } catch (err) {
      console.error('Error loading attentions:', err);
      setError('Error al cargar las atenciones');
    } finally {
      setLoading(false);
    }
  };

  const loadProgressNotes = async (attentionId: number) => {
    try {
      const notes = await getProgressNotes(attentionId);
      setProgressNotes(notes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Error al cargar las notas de evolución');
    }
  };

  const openEvolutionDialog = async (attention: AttentionResponseDTO, mode: EvolutionDialogMode) => {
    setSelectedAttention(attention);
    setNotesDialogOpen(true);
    setEvolutionDialogMode(mode);
    setNoteContent('');

    await loadProgressNotes(attention.id);
  };

  const handleOpenNotes = (attention: AttentionResponseDTO) => {
    void openEvolutionDialog(attention, 'history');
  };

  const handleOpenAddNote = (attention: AttentionResponseDTO) => {
    void openEvolutionDialog(attention, 'add');
  };

  const handleCloseNotes = () => {
    setNotesDialogOpen(false);
    setSelectedAttention(null);
    setProgressNotes([]);
    setNoteContent('');
    setEvolutionDialogMode('history');
  };

  const handleOpenFeedback = async (attention: AttentionResponseDTO) => {
    setSelectedAttention(attention);
    setFeedbackDialogOpen(true);

    try {
      const feedback = await getFeedbackForAttention(attention.id);
      setFeedbackList(feedback);
    } catch (err) {
      console.error('Error loading feedback:', err);
      setError('Error al cargar el feedback');
    }
  };

  const handleCloseFeedback = () => {
    setFeedbackDialogOpen(false);
    setSelectedAttention(null);
    setFeedbackList([]);
  };

  const handleOpenCreateFeedback = (attention: AttentionResponseDTO) => {
    setSelectedAttention(attention);
    setCreateFeedbackDialogOpen(true);
    setFeedbackRating(null);
    setFeedbackComment('');
  };

  const handleCloseCreateFeedback = () => {
    setCreateFeedbackDialogOpen(false);
    setSelectedAttention(null);
    setFeedbackRating(null);
    setFeedbackComment('');
  };

  const handleSubmitFeedback = async () => {
    if (!selectedAttention || !feedbackRating) {
      setError('Debes seleccionar una calificación');
      return;
    }

    if (feedbackComment.length > 1000) {
      setError('El comentario no puede exceder 1000 caracteres');
      return;
    }

    try {
      setError(null);
      const feedbackData: CreateFeedbackRequestDTO = {
        attentionId: selectedAttention.id,
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      };

      await createFeedback(feedbackData);
      setSuccess('Feedback enviado exitosamente');
      handleCloseCreateFeedback();
      if (user?.userId) {
        loadAttentions(user.userId); // Recargar para actualizar el estado
      }
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      if (err.response?.status === 400) {
        setError('Ya has calificado esta atención o la atención no está completada');
      } else {
        setError('Error al enviar el feedback');
      }
    }
  };

  const handleAddNote = async () => {
    if (!selectedAttention || !noteContent.trim() || noteContent.trim().length < 10) {
      setError('La nota debe tener al menos 10 caracteres');
      return;
    }

    try {
      setError(null);
      const noteData: ProgressNoteRequestDTO = { content: noteContent.trim() };
      await addProgressNote(selectedAttention.id, noteData);
      setSuccess('Nota de evolución agregada');
      setNoteContent('');
      const notes = await getProgressNotes(selectedAttention.id);
      setProgressNotes(notes);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Error al agregar la nota de evolución');
    }
  };

  const handleFinalizeAttention = async (attentionId: number) => {
    if (!window.confirm('¿Estás seguro de finalizar esta atención?')) return;

    try {
      setError(null);
      await finalizeAttention(attentionId);
      setSuccess('Atención finalizada exitosamente');
      if (user?.userId) {
        loadAttentions(user.userId);
      }
      handleCloseNotes();
    } catch (err) {
      console.error('Error finalizing attention:', err);
      setError('Error al finalizar la atención');
    }
  };

  const inProgressAttentions = attentions.filter((attention) => attention.status === 'IN_PROGRESS');
  const completedAttentions = attentions.filter((attention) => attention.status === 'COMPLETED');
  const displayedAttentions = tabValue === 0 ? inProgressAttentions : completedAttentions;

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
        Gestiona las atenciones de tus pacientes
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
          <Tab label={`En Curso (${inProgressAttentions.length})`} />
          <Tab label={`Completadas (${completedAttentions.length})`} />
        </Tabs>
      </Paper>

      {displayedAttentions.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              {tabValue === 0 ? 'No tienes atenciones en curso.' : 'No tienes atenciones completadas.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {displayedAttentions.map((attention) => (
            <Grid size={{ xs: 12, md: 6 }} key={attention.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {attention.patientName}
                    </Typography>
                    <Chip
                      label={STATUS_CONFIG[attention.status].label}
                      color={STATUS_CONFIG[attention.status].color}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tratamiento
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {attention.treatmentName}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha de Inicio
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {format(parseISO(attention.startDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Turnos
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {attention.appointments.length} turnos registrados
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                    <Button variant="outlined" size="small" onClick={() => handleOpenNotes(attention)}>
                      Ver evolución
                    </Button>
                    {attention.status === 'IN_PROGRESS' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => handleOpenAddNote(attention)}
                      >
                        Agregar evolución
                      </Button>
                    )}
                    {attention.status === 'COMPLETED' && attention.feedbackCount !== undefined && (
                      <Badge badgeContent={attention.feedbackCount} color="primary">
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<RateReview />}
                          onClick={() => handleOpenFeedback(attention)}
                          color={attention.feedbackCount > 0 ? 'primary' : 'inherit'}
                        >
                          Ver Feedback
                        </Button>
                      </Badge>
                    )}
                    {attention.status === 'COMPLETED' && !attention.hasMyFeedback && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<RateReview />}
                        onClick={() => handleOpenCreateFeedback(attention)}
                      >
                        Dar Feedback
                      </Button>
                    )}
                    {attention.status === 'IN_PROGRESS' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleFinalizeAttention(attention.id)}
                      >
                        Finalizar
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Notes Dialog */}
      <Dialog 
        open={notesDialogOpen} 
        onClose={handleCloseNotes} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[10],
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            px: 3,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
            <Description sx={{ color: 'primary.main', fontSize: 28, mt: 0.3 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {evolutionDialogMode === 'history' ? 'Historial de evoluciones' : 'Agregar evolución'} - {selectedAttention?.patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedAttention?.treatmentName}
              </Typography>
            </Box>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseNotes}
            aria-label="cerrar"
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 3 }}>
          <Box sx={{ pt: 2 }}>
            {evolutionDialogMode === 'history' && (
              <>
                {progressNotes.length === 0 ? (
                  <Alert severity="info">No hay notas de evolución registradas</Alert>
                ) : (
                  <List>
                    {progressNotes.map((note, index) => (
                      <Box key={note.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={note.note}
                            secondary={
                              <>
                                {format(parseISO(note.createdAt), "dd/MM/yyyy HH:mm", { locale: es })} - {note.authorName}
                              </>
                            }
                          />
                        </ListItem>
                        {index < progressNotes.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                )}
              </>
            )}

            {evolutionDialogMode === 'add' && selectedAttention?.status === 'IN_PROGRESS' && (
              <Box sx={{ mt: 3 }}>
                <TextField
                  label="Nueva evolución"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe la evolución del paciente (mínimo 10 caracteres)"
                  helperText={`${noteContent.length}/5000 caracteres`}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddNote}
                  sx={{ mt: 2 }}
                  disabled={noteContent.trim().length < 10}
                >
                  Agregar evolución
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button 
            onClick={handleCloseNotes}
            variant="contained"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: (theme) => theme.shadows[3],
              '&:hover': {
                boxShadow: (theme) => theme.shadows[6],
              },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog 
        open={feedbackDialogOpen} 
        onClose={handleCloseFeedback} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[10],
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            px: 3,
            backgroundColor: (theme) => alpha(theme.palette.info.main, 0.02),
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
            <Star sx={{ color: 'info.main', fontSize: 28, mt: 0.3 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Feedback de la Atención
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Paciente: {selectedAttention?.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedAttention?.treatmentName}
              </Typography>
            </Box>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseFeedback}
            aria-label="cerrar"
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 3 }}>
          <Box sx={{ pt: 2 }}>
            {feedbackList.length === 0 ? (
              <Alert severity="info">No hay feedback registrado para esta atención</Alert>
            ) : (
              <Stack spacing={2}>
                {feedbackList.map((feedback) => (
                  <Paper 
                    key={feedback.id}
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2, 
                      border: '2px solid',
                      borderColor: feedback.submittedByRole === 'PATIENT' ? 'success.light' : 'info.light',
                      bgcolor: feedback.submittedByRole === 'PATIENT' ? 'success.50' : 'info.50',
                    }}
                  >
                    {/* Autor del feedback */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                      <Box>
                        <Chip 
                          label={feedback.submittedByRole === 'PATIENT' ? 'Calificación del Paciente' : 'Tu Calificación'} 
                          size="small"
                          sx={{ 
                            mb: 1,
                            fontSize: '0.7rem',
                            height: 22,
                            fontWeight: 600,
                            bgcolor: feedback.submittedByRole === 'PATIENT' ? 'success.main' : 'info.main',
                            color: 'white',
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {feedback.submittedByRole === 'PATIENT' 
                            ? `${feedback.submittedByName} calificó al practicante`
                            : `Calificaste al paciente ${feedback.patientName}`
                          }
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
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button 
            onClick={handleCloseFeedback}
            variant="contained"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: (theme) => theme.shadows[3],
              '&:hover': {
                boxShadow: (theme) => theme.shadows[6],
              },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Feedback Dialog */}
      <Dialog 
        open={createFeedbackDialogOpen} 
        onClose={handleCloseCreateFeedback} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[10],
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            px: 3,
            backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.02),
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
            <Star sx={{ color: 'warning.main', fontSize: 28, mt: 0.3 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Calificar Paciente
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedAttention?.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedAttention?.treatmentName}
              </Typography>
            </Box>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseCreateFeedback}
            aria-label="cerrar"
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 3 }}>
          <Box sx={{ pt: 2 }}>
            {/* Rating Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                textAlign: 'center',
                bgcolor: 'primary.light',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" color="primary.dark" gutterBottom>
                ¿Cómo fue tu experiencia con este paciente?
              </Typography>
              <Rating
                value={feedbackRating}
                onChange={(_, newValue) => setFeedbackRating(newValue)}
                size="large"
                sx={{ 
                  mt: 2,
                  '& .MuiRating-iconEmpty': {
                    color: 'primary.main',
                  },
                  '& .MuiRating-iconFilled': {
                    color: 'warning.main',
                  },
                }}
              />
              {feedbackRating && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }} color="primary.dark">
                  {feedbackRating === 1 && '😞 Muy insatisfecho'}
                  {feedbackRating === 2 && '😕 Insatisfecho'}
                  {feedbackRating === 3 && '😐 Neutral'}
                  {feedbackRating === 4 && '😊 Satisfecho'}
                  {feedbackRating === 5 && '🌟 Muy satisfecho'}
                </Typography>
              )}
            </Paper>

            {/* Comment Section */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Comentario (opcional)
              </Typography>
              <TextField
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="Comparte tu experiencia trabajando con este paciente. Menciona aspectos como: puntualidad, colaboración durante el tratamiento, seguimiento de indicaciones..."
                helperText={`${feedbackComment.length}/1000 caracteres`}
                error={feedbackComment.length > 1000}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              Tu calificación será visible para el docente supervisor y ayudará en el proceso de evaluación académica.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2.5,
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            gap: 1.5,
          }}
        >
          <Button 
            onClick={handleCloseCreateFeedback}
            variant="outlined"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.05),
              },
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitFeedback}
            variant="contained"
            disabled={!feedbackRating}
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: (theme) => theme.shadows[3],
              '&:hover': {
                boxShadow: (theme) => theme.shadows[6],
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Enviar Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
