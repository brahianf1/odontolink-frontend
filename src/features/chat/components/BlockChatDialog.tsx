import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import {
  CHAT_BLOCK_REASON_MAX_LENGTH,
  validateBlockReason,
} from '../utils/chatValidation';

interface BlockChatDialogProps {
  open: boolean;
  counterpartName: string;
  submitting: boolean;
  onConfirm: (reason: string | undefined) => void;
  onClose: () => void;
}

export default function BlockChatDialog({
  open,
  counterpartName,
  submitting,
  onConfirm,
  onClose,
}: BlockChatDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  const validation = validateBlockReason(reason);
  const overLimit = reason.length > CHAT_BLOCK_REASON_MAX_LENGTH;

  const handleConfirm = () => {
    if (overLimit) return;
    const sanitized = validation.sanitized;
    onConfirm(sanitized.length === 0 ? undefined : sanitized);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Bloquear conversación</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {counterpartName} no podrá enviarte mensajes mientras la conversación
          esté bloqueada. Podrás desbloquearla cuando lo decidas.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          label="Motivo (opcional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          inputProps={{ maxLength: CHAT_BLOCK_REASON_MAX_LENGTH + 20 }}
          error={overLimit}
          helperText={
            <Typography
              variant="caption"
              component="span"
              sx={{ color: overLimit ? 'error.main' : 'text.secondary' }}
            >
              {reason.length} / {CHAT_BLOCK_REASON_MAX_LENGTH}
            </Typography>
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={submitting || overLimit}
        >
          {submitting ? 'Bloqueando…' : 'Bloquear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
