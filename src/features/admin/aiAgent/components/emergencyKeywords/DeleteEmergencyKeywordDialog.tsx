import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { EmergencyKeywordResponseDTO } from '../../../../../types/aiAgent.types';

interface DeleteEmergencyKeywordDialogProps {
  open: boolean;
  target: EmergencyKeywordResponseDTO | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteEmergencyKeywordDialog({
  open,
  target,
  deleting,
  onCancel,
  onConfirm,
}: DeleteEmergencyKeywordDialogProps) {
  return (
    <Dialog open={open} onClose={deleting ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar palabra de emergencia</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Seguro que querés eliminar la palabra "{target?.term ?? ''}"? Esta acción no se puede
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
