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
  DEFAULT_POLICY_RULE_VALUES,
  policyRuleFormSchema,
  type PolicyRuleFormValues,
} from '../../schemas/policyRule.schemas';
import type {
  PolicyRuleRequestDTO,
  PolicyRuleResponseDTO,
} from '../../../../../types/aiAgent.types';

interface PolicyRuleFormDialogProps {
  open: boolean;
  target: PolicyRuleResponseDTO | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: PolicyRuleRequestDTO) => Promise<void>;
}

export default function PolicyRuleFormDialog({
  open,
  target,
  saving,
  onClose,
  onSubmit,
}: PolicyRuleFormDialogProps) {
  const isEdit = target !== null;
  const { control, handleSubmit, reset } = useForm<PolicyRuleFormValues>({
    resolver: zodResolver(policyRuleFormSchema),
    mode: 'onChange',
    defaultValues: target
      ? { label: target.label, text: target.text, active: target.active }
      : DEFAULT_POLICY_RULE_VALUES,
  });
  const { isValid } = useFormState({ control });

  useEffect(() => {
    if (open) {
      reset(
        target
          ? { label: target.label, text: target.text, active: target.active }
          : DEFAULT_POLICY_RULE_VALUES
      );
    }
  }, [open, target, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      label: values.label.trim(),
      text: values.text.trim(),
      active: values.active,
    });
  });

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar regla' : 'Nueva regla'}</DialogTitle>
      <form onSubmit={submit} noValidate>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Controller
              name="label"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Nombre"
                  fullWidth
                  required
                  disabled={saving}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? 'Nombre corto para identificarla.'}
                  inputProps={{ maxLength: 100 }}
                />
              )}
            />
            <Controller
              name="text"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Texto de la regla"
                  fullWidth
                  required
                  multiline
                  minRows={5}
                  disabled={saving}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ??
                    'Instrucción que el modelo IA debe respetar siempre.'
                  }
                  inputProps={{ maxLength: 2000 }}
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
                  label="Activa"
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
            disabled={saving || !isValid}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isEdit ? 'Guardar cambios' : 'Crear regla'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
