import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type {
  KnowledgeBaseDocumentResponseDTO,
  UpdateKnowledgeBaseDocumentRequestDTO,
} from '../../../../../types/aiAgent.types';

interface EditDocumentDialogProps {
  open: boolean;
  target: KnowledgeBaseDocumentResponseDTO | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    id: number,
    payload: UpdateKnowledgeBaseDocumentRequestDTO
  ) => Promise<void>;
}

export default function EditDocumentDialog({
  open,
  target,
  saving,
  onClose,
  onSubmit,
}: EditDocumentDialogProps) {
  const isFaq = target?.kind === 'FAQ_TEXT';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (open && target) {
      setTitle(target.title);
      setContent(target.inlineContent ?? '');
      setTitleError(null);
    }
  }, [open, target]);

  const contentChanged = useMemo(() => {
    if (!isFaq || !target) return false;
    return (target.inlineContent ?? '') !== content;
  }, [isFaq, target, content]);

  const handleSubmit = async () => {
    if (!target) return;
    if (title.trim().length === 0) {
      setTitleError('El título es obligatorio.');
      return;
    }
    if (title.trim().length > 200) {
      setTitleError('El título no puede superar los 200 caracteres.');
      return;
    }
    setTitleError(null);
    const payload: UpdateKnowledgeBaseDocumentRequestDTO = { title: title.trim() };
    if (isFaq && contentChanged) {
      payload.content = content;
    }
    await onSubmit(target.id, payload);
  };

  if (!target) return null;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar {isFaq ? 'FAQ' : 'documento'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Título"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            error={!!titleError}
            helperText={titleError ?? undefined}
            inputProps={{ maxLength: 200 }}
          />
          {isFaq ? (
            <TextField
              label="Contenido"
              fullWidth
              multiline
              minRows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
              helperText="Si modificás el contenido, el documento se re-indexará automáticamente."
            />
          ) : (
            <Alert severity="info">
              Solo podés renombrar este documento. Para reemplazar el archivo, eliminalo y subí uno
              nuevo.
            </Alert>
          )}
          {isFaq && contentChanged && (
            <Alert severity="warning">
              Al guardar, el contenido se re-indexará y el documento volverá al estado{' '}
              <strong>INDEXING</strong> hasta que la indexación finalice.
            </Alert>
          )}
          {!isFaq && target.originalFileName && (
            <Typography variant="caption" color="text.secondary">
              Archivo original: {target.originalFileName}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
