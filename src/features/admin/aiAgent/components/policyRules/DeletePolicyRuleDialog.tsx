import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { PolicyRuleResponseDTO } from '../../../../../types/aiAgent.types';

interface DeletePolicyRuleDialogProps {
  open: boolean;
  target: PolicyRuleResponseDTO | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeletePolicyRuleDialog({
  open,
  target,
  deleting,
  onCancel,
  onConfirm,
}: DeletePolicyRuleDialogProps) {
  return (
    <Dialog open={open} onClose={deleting ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar regla</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Seguro que querés eliminar la regla "{target?.label ?? ''}"? Esta acción no se puede
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
