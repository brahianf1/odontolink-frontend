import { useEffect } from 'react';
import {
  Box,
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
  Typography,
} from '@mui/material';
import { Controller, useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  providerGuardrailAttachmentSchema,
  type ProviderGuardrailAttachmentFormValues,
} from '../../schemas/providerGuardrail.schemas';
import type {
  ProviderGuardrailResponseDTO,
  UpdateProviderGuardrailAttachmentRequestDTO,
} from '../../../../../types/aiAgent.types';
import { providerGuardrailTypeMeta } from '../../utils/providerGuardrailTypes';

interface ProviderGuardrailAttachmentDialogProps {
  open: boolean;
  target: ProviderGuardrailResponseDTO | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateProviderGuardrailAttachmentRequestDTO) => Promise<void>;
}

const defaultsFor = (
  target: ProviderGuardrailResponseDTO | null
): ProviderGuardrailAttachmentFormValues =>
  target
    ? { attached: target.attached, priority: target.priority }
    : { attached: false, priority: 100 };

export default function ProviderGuardrailAttachmentDialog({
  open,
  target,
  saving,
  onClose,
  onSubmit,
}: ProviderGuardrailAttachmentDialogProps) {
  const { control, handleSubmit, reset } = useForm<ProviderGuardrailAttachmentFormValues>({
    resolver: zodResolver(providerGuardrailAttachmentSchema),
    mode: 'onChange',
    defaultValues: defaultsFor(target),
  });
  const { isValid, isDirty } = useFormState({ control });

  useEffect(() => {
    if (open) {
      reset(defaultsFor(target));
    }
  }, [open, target, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({ attached: values.attached, priority: values.priority });
  });

  const meta = target ? providerGuardrailTypeMeta(target.type) : null;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar filtro: {target?.displayName ?? '(sin nombre)'}</DialogTitle>
      <form onSubmit={submit} noValidate>
        <DialogContent dividers>
          <Stack spacing={2}>
            {meta && (
              <Typography variant="caption" color="text.secondary">
                Tipo: {meta.label}. Esta metadata se sincroniza desde DigitalOcean.
              </Typography>
            )}
            <Controller
              name="attached"
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
            <Controller
              name="priority"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    field.onChange(raw === '' ? 0 : Number(raw));
                  }}
                  label="Prioridad"
                  type="number"
                  fullWidth
                  disabled={saving}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ??
                    'Menor valor = mayor prioridad (0 es la más alta).'
                  }
                  inputProps={{ min: 0, max: 9999, step: 1, inputMode: 'numeric' }}
                />
              )}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Los cambios se aplicarán cuando publiques el agente.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !isValid || !isDirty}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
