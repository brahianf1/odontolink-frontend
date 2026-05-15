import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { AttentionResponseDTO } from '../../../../types/attention.types';

interface FinalizeAttentionDialogProps {
  open: boolean;
  attention: AttentionResponseDTO | null;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

/**
 * The button that opens this dialog is preemptively disabled if the
 * attention has SCHEDULED appointments (future OR past-unmarked) via
 * checkAttentionTermination. So by the time this opens, the action is
 * almost always safe to confirm. The errorMessage prop surfaces any 422
 * the backend returned (race condition fallback).
 */
export default function FinalizeAttentionDialog({
  open,
  attention,
  submitting,
  errorMessage,
  onClose,
  onConfirm,
}: FinalizeAttentionDialogProps) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Finalizar atención</DialogTitle>
      <DialogContent>
        {attention && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Vas a finalizar la atención de
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {attention.patientName} — {attention.treatmentName}
            </Typography>
          </Box>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary">
          Una vez finalizada, ya no podrás agregar más notas de evolución. Tu historial clínico se conserva.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          onClick={() => void onConfirm()}
          color="success"
          variant="contained"
          disabled={submitting}
        >
          {submitting ? 'Finalizando…' : 'Finalizar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
