import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { AttentionResponseDTO } from '../../../../types/attention.types';

interface CancelAttentionDialogProps {
  open: boolean;
  attention: AttentionResponseDTO | null;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

const MIN_REASON = 5;
const MAX_REASON = 1000;

type FormValues = { reason: string };

/**
 * Modal counterpart of FinalizeAttentionDialog for the cancellation flow.
 * Same preconditions as finalize (no pending or unmarked appointments) —
 * those are enforced by disabling the entry button upstream via
 * checkAttentionTermination. This dialog just collects the required reason
 * and confirms.
 */
export default function CancelAttentionDialog({
  open,
  attention,
  submitting,
  errorMessage,
  onClose,
  onConfirm,
}: CancelAttentionDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: { reason: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) reset({ reason: '' });
  }, [open, reset]);

  const submit = async ({ reason }: FormValues) => {
    await onConfirm(reason.trim());
  };

  const reason = watch('reason');
  const length = reason?.length ?? 0;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancelar caso clínico</DialogTitle>
      <DialogContent>
        {attention && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Vas a cancelar el caso de
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {attention.patientName} — {attention.treatmentName}
            </Typography>
          </Box>
        )}

        <Alert severity="warning" sx={{ mb: 2 }}>
          Una vez cancelado, el caso queda en estado <strong>Cancelado</strong>: ya no podrás agregar notas de evolución. Tu historial clínico se conserva intacto.
        </Alert>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Controller
          control={control}
          name="reason"
          rules={{
            required: 'Indicá el motivo de la cancelación',
            minLength: { value: MIN_REASON, message: `Mínimo ${MIN_REASON} caracteres` },
            maxLength: { value: MAX_REASON, message: `Máximo ${MAX_REASON} caracteres` },
            validate: (v) => v.trim().length >= MIN_REASON || `Mínimo ${MIN_REASON} caracteres`,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Motivo de la cancelación"
              fullWidth
              multiline
              minRows={3}
              autoFocus
              required
              placeholder="Explicá por qué se cancela el caso (queda en el historial)."
              error={!!errors.reason}
              helperText={errors.reason?.message ?? `${length}/${MAX_REASON} caracteres`}
              disabled={submitting}
              inputProps={{ maxLength: MAX_REASON }}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Volver
        </Button>
        <Button
          onClick={handleSubmit(submit)}
          variant="contained"
          color="error"
          disabled={submitting || !isValid}
        >
          {submitting ? 'Cancelando…' : 'Cancelar caso'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
