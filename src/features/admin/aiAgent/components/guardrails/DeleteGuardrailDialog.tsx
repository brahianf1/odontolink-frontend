import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { GuardrailResponseDTO } from '../../../../../types/aiAgent.types';

interface DeleteGuardrailDialogProps {
  open: boolean;
  target: GuardrailResponseDTO | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteGuardrailDialog({
  open,
  target,
  deleting,
  onCancel,
  onConfirm,
}: DeleteGuardrailDialogProps) {
  return (
    <Dialog open={open} onClose={deleting ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar guardrail</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Seguro que querés eliminar el guardrail "{target?.label ?? ''}"? Esta acción no se puede
          deshacer.
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
