import { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

interface AddFaqDialogProps {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => Promise<void>;
}

export default function AddFaqDialog({
  open,
  submitting,
  onClose,
  onSubmit,
}: AddFaqDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setContent('');
      setTitleError(null);
      setContentError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    let ok = true;
    if (title.trim().length === 0) {
      setTitleError('El título es obligatorio.');
      ok = false;
    } else if (title.trim().length > 200) {
      setTitleError('El título no puede superar los 200 caracteres.');
      ok = false;
    } else {
      setTitleError(null);
    }
    if (content.trim().length === 0) {
      setContentError('El contenido es obligatorio.');
      ok = false;
    } else {
      setContentError(null);
    }
    if (!ok) return;
    await onSubmit(title.trim(), content.trim());
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar FAQ</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Título / Pregunta"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            error={!!titleError}
            helperText={titleError ?? 'Pregunta o tema que cubre esta FAQ.'}
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            label="Contenido / Respuesta"
            required
            fullWidth
            multiline
            minRows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            error={!!contentError}
            helperText={contentError ?? 'Texto completo que se indexará en la base de conocimiento.'}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Crear FAQ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
