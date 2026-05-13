import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  alpha,
} from '@mui/material';
import { Close, Description, Add } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  getMyAttentions,
  getProgressNotes,
  addProgressNote,
} from '../../services/api/practitionerService';
import type { AttentionResponseDTO, ProgressNoteResponseDTO } from '../../types/attention.types';

export default function PatientEvolutionPage() {
  const { patientId, attentionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attention, setAttention] = useState<AttentionResponseDTO | null>(null);
  const [notes, setNotes] = useState<ProgressNoteResponseDTO[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const attentions = await getMyAttentions();
        const id = Number(attentionId);
        const pId = Number(patientId);
        const found = attentions.find((a) => a.id === id && a.patientId === pId);
        if (!found) {
          setError('Atención no encontrada');
          return;
        }
        setAttention(found);
        const progress = await getProgressNotes(found.id);
        setNotes(progress);
      } catch (err) {
        console.error(err);
        setError('Error al cargar la evolución');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [patientId, attentionId]);

  const handleAdd = async () => {
    if (!attention || noteContent.trim().length < 10) {
      setError('La nota debe tener al menos 10 caracteres');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await addProgressNote(attention.id, { content: noteContent.trim() });
      const progress = await getProgressNotes(attention.id);
      setNotes(progress);
      setNoteContent('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      setError('Error al agregar la evolución');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
      <Box sx={{ width: { xs: '100%', md: 320 } }}>
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Datos del Paciente
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            NOMBRE COMPLETO
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
            {attention?.patientName}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Tratamiento Actual
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">TRATAMIENTO</Typography>
          <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>{attention?.treatmentName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>INICIO</Typography>
          {attention?.startDate && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>{format(parseISO(attention.startDate), "dd/MM/yyyy")}</Typography>
          )}
        </Paper>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Evolución Clínica</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Add />}
            onClick={() => setShowAddForm(true)}
          >
            Agregar evolución
          </Button>
        </Box>

        <Dialog
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
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
                  Agregar evolución - {attention?.patientName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {attention?.treatmentName}
                </Typography>
              </Box>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setShowAddForm(false)}
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
                onClick={handleAdd}
                sx={{ mt: 2 }}
                disabled={noteContent.trim().length < 10 || submitting}
              >
                Agregar evolución
              </Button>
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
              onClick={() => setShowAddForm(false)}
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

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Historial de Evoluciones ({notes.length})</Typography>
          {notes.length === 0 ? (
            <Alert severity="info">No hay notas registradas</Alert>
          ) : (
            <Stack spacing={2}>
              {notes.map((n) => (
                <Paper key={n.id} sx={{ p: 2, borderRadius: 2 }} elevation={0}>
                  <Typography variant="caption" color="text.secondary">{format(parseISO(n.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>{n.note}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
