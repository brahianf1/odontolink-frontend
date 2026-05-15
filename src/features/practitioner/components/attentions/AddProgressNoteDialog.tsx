import { useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { Close, Description } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';

interface AddProgressNoteDialogProps {
  open: boolean;
  attentionLabel?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<boolean>;
}

const MIN = 10;
const MAX = 5000;

type FormValues = { content: string };

export default function AddProgressNoteDialog({
  open,
  attentionLabel,
  submitting,
  onClose,
  onSubmit,
}: AddProgressNoteDialogProps) {
  const { control, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm<FormValues>({
    defaultValues: { content: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) reset({ content: '' });
  }, [open, reset]);

  const submit = async ({ content }: FormValues) => {
    const ok = await onSubmit(content.trim());
    if (ok) reset({ content: '' });
  };

  const content = watch('content');
  const length = content?.length ?? 0;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          pt: 2.5,
          px: 3,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Description sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Agregar nota de evolución
            </Typography>
            {attentionLabel && (
              <Typography variant="caption" color="text.secondary">
                {attentionLabel}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={submitting} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 3 }}>
        <Controller
          control={control}
          name="content"
          rules={{
            required: 'Escribe la evolución del paciente',
            minLength: { value: MIN, message: `Mínimo ${MIN} caracteres` },
            maxLength: { value: MAX, message: `Máximo ${MAX} caracteres` },
            validate: (v) => v.trim().length >= MIN || `Mínimo ${MIN} caracteres`,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nueva nota"
              fullWidth
              multiline
              minRows={5}
              autoFocus
              required
              placeholder="Describe la evolución, hallazgos, plan de tratamiento…"
              error={!!errors.content}
              helperText={errors.content?.message ?? `${length}/${MAX} caracteres`}
              disabled={submitting}
              inputProps={{ maxLength: MAX }}
            />
          )}
        />
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: (t) => alpha(t.palette.background.default, 0.5),
          borderTop: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(submit)}
          variant="contained"
          disabled={submitting || !isValid}
        >
          {submitting ? 'Guardando…' : 'Guardar nota'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
