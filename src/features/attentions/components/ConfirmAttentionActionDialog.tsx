import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface ConfirmAttentionActionDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  warning?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Generic confirmation dialog for attention-scoped actions (finalize,
 * cancel, supervisor finalize, etc.). Replaces the previous role-specific
 * FinalizeAttentionDialog and CancelAttentionDialog in the practitioner
 * feature and the supervisor's ConfirmActionDialog.
 */
export default function ConfirmAttentionActionDialog({
  open,
  title,
  message,
  warning,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmColor = 'primary',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmAttentionActionDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Box sx={{ mb: warning ? 1.5 : 0 }}>{message}</Box>
        </DialogContentText>
        {warning && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {warning}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
