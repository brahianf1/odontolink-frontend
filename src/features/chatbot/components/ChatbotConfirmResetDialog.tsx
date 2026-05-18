import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface ChatbotConfirmResetDialogProps {
  open: boolean;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ChatbotConfirmResetDialog({
  open,
  submitting,
  onCancel,
  onConfirm,
}: ChatbotConfirmResetDialogProps) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Iniciar nueva conversación</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Se borrará la conversación actual y el asistente no recordará lo hablado. ¿Querés
          continuar?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Sí, empezar de cero
        </Button>
      </DialogActions>
    </Dialog>
  );
}
