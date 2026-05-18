import { useEffect } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { Controller, useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DEFAULT_EMERGENCY_KEYWORD_VALUES,
  emergencyKeywordFormSchema,
  type EmergencyKeywordFormValues,
} from '../../schemas/emergencyKeyword.schemas';
import type { EmergencyKeywordResponseDTO } from '../../../../../types/aiAgent.types';

interface EmergencyKeywordFormDialogProps {
  open: boolean;
  target: EmergencyKeywordResponseDTO | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: EmergencyKeywordFormValues) => Promise<void>;
}

export default function EmergencyKeywordFormDialog({
  open,
  target,
  saving,
  onClose,
  onSubmit,
}: EmergencyKeywordFormDialogProps) {
  const isEdit = target !== null;
  const { control, handleSubmit, reset } = useForm<EmergencyKeywordFormValues>({
    resolver: zodResolver(emergencyKeywordFormSchema),
    mode: 'onChange',
    defaultValues: target
      ? { term: target.term, active: target.active }
      : DEFAULT_EMERGENCY_KEYWORD_VALUES,
  });
  const { isValid, isDirty } = useFormState({ control });

  useEffect(() => {
    if (open) {
      reset(
        target
          ? { term: target.term, active: target.active }
          : DEFAULT_EMERGENCY_KEYWORD_VALUES
      );
    }
  }, [open, target, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      term: values.term.trim(),
      active: values.active,
    });
  });

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar palabra de emergencia' : 'Nueva palabra de emergencia'}</DialogTitle>
      <form onSubmit={submit} noValidate>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Controller
              name="term"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Palabra o frase"
                  fullWidth
                  required
                  disabled={saving}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ??
                    'Ejemplos: "sangrado", "dolor agudo", "fiebre alta". La comparación ignora mayúsculas y acentos.'
                  }
                  inputProps={{ maxLength: 100 }}
                />
              )}
            />
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Activo"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !isValid || (isEdit && !isDirty)}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isEdit ? 'Guardar cambios' : 'Crear palabra'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
