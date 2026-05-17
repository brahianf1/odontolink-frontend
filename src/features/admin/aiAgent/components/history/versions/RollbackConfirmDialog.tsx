import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { AiAgentConfigurationVersionResponseDTO } from '../../../../../../types/aiAgent.types';

interface RollbackConfirmDialogProps {
  open: boolean;
  target: AiAgentConfigurationVersionResponseDTO | null;
  rollingBack: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RollbackConfirmDialog({
  open,
  target,
  rollingBack,
  onCancel,
  onConfirm,
}: RollbackConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={rollingBack ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Restaurar versión</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Vas a restaurar la versión <strong>v{target?.versionNumber}</strong>. La configuración
          actual será reemplazada por el snapshot de esta versión.
        </Typography>
        <Alert severity="warning">
          Esta acción genera una nueva versión publicada y queda registrada en el audit log.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={rollingBack}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          disabled={rollingBack}
          startIcon={rollingBack ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Restaurar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
