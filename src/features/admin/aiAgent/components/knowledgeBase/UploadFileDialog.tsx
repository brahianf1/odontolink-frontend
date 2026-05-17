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
import FileDropzone from './FileDropzone';

interface UploadFileDialogProps {
  open: boolean;
  uploading: boolean;
  onClose: () => void;
  onSubmit: (title: string, file: File) => Promise<void>;
}

export default function UploadFileDialog({
  open,
  uploading,
  onClose,
  onSubmit,
}: UploadFileDialogProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setFile(null);
      setTitleError(null);
    }
  }, [open]);

  const canSubmit = title.trim().length > 0 && file !== null && !uploading;

  const handleSubmit = async () => {
    if (title.trim().length === 0) {
      setTitleError('El título es obligatorio.');
      return;
    }
    if (title.trim().length > 200) {
      setTitleError('El título no puede superar los 200 caracteres.');
      return;
    }
    if (!file) return;
    setTitleError(null);
    await onSubmit(title.trim(), file);
  };

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Subir documento</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Título"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            error={!!titleError}
            helperText={titleError ?? 'Nombre con el que se mostrará el documento en la base de conocimiento.'}
            inputProps={{ maxLength: 200 }}
          />
          <FileDropzone file={file} onFileSelected={setFile} disabled={uploading} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit}
          onClick={handleSubmit}
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Subir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
