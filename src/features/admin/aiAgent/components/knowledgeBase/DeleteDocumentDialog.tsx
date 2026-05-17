import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { KnowledgeBaseDocumentResponseDTO } from '../../../../../types/aiAgent.types';

interface DeleteDocumentDialogProps {
  open: boolean;
  target: KnowledgeBaseDocumentResponseDTO | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteDocumentDialog({
  open,
  target,
  deleting,
  onCancel,
  onConfirm,
}: DeleteDocumentDialogProps) {
  return (
    <Dialog open={open} onClose={deleting ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar documento</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Seguro que querés eliminar "{target?.title ?? ''}"? El documento dejará de estar
          disponible para el agente y esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={deleting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
