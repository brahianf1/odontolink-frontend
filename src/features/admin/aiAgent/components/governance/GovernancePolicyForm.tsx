import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Controller, useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DEFAULT_GOVERNANCE_VALUES,
  governanceFormSchema,
  type GovernanceFormValues,
} from '../../schemas/governance.schemas';
import type {
  AiGovernancePolicyResponseDTO,
  UpdateAiGovernancePolicyRequestDTO,
} from '../../../../../types/aiAgent.types';

interface GovernancePolicyFormProps {
  policy: AiGovernancePolicyResponseDTO;
  saving: boolean;
  onSubmit: (payload: UpdateAiGovernancePolicyRequestDTO) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}

const buildInitial = (p: AiGovernancePolicyResponseDTO): GovernanceFormValues => ({
  requireSystemPrompt: p.requireSystemPrompt,
  requireWelcomeMessage: p.requireWelcomeMessage,
  requireGuardrails: p.requireGuardrails,
  minActiveGuardrails:
    typeof p.minActiveGuardrails === 'number'
      ? p.minActiveGuardrails
      : DEFAULT_GOVERNANCE_VALUES.minActiveGuardrails,
  requireIndexedDocuments: p.requireIndexedDocuments,
  allowOverride: p.allowOverride,
});

export default function GovernancePolicyForm({
  policy,
  saving,
  onSubmit,
  onDirtyChange,
}: GovernancePolicyFormProps) {
  const { control, handleSubmit, reset, watch } = useForm<GovernanceFormValues>({
    resolver: zodResolver(governanceFormSchema),
    mode: 'onChange',
    defaultValues: buildInitial(policy),
  });
  const { isDirty, isValid } = useFormState({ control });

  useEffect(() => {
    reset(buildInitial(policy));
  }, [policy, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const requireGuardrails = watch('requireGuardrails');
  const allowOverride = watch('allowOverride');

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      requireSystemPrompt: values.requireSystemPrompt,
      requireWelcomeMessage: values.requireWelcomeMessage,
      requireGuardrails: values.requireGuardrails,
      minActiveGuardrails: values.minActiveGuardrails,
      requireIndexedDocuments: values.requireIndexedDocuments,
      allowOverride: values.allowOverride,
    });
  });

  return (
    <form onSubmit={submit} noValidate>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Requisitos para publicar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Configurá qué condiciones debe cumplir la configuración antes de poder publicar el
            agente.
          </Typography>
          <Stack spacing={1}>
            <Controller
              name="requireSystemPrompt"
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
                  label="Exigir prompt de sistema"
                />
              )}
            />
            <Controller
              name="requireWelcomeMessage"
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
                  label="Exigir mensaje de bienvenida"
                />
              )}
            />
            <Controller
              name="requireIndexedDocuments"
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
                  label="Exigir al menos un documento indexado"
                />
              )}
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Reglas de comportamiento
          </Typography>
          <Controller
            name="requireGuardrails"
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
                label="Exigir reglas activas"
              />
            )}
          />
          <Controller
            name="minActiveGuardrails"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? 0}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === '' ? 0 : Number(raw));
                }}
                type="number"
                label="Mínimo de reglas activas"
                disabled={saving || !requireGuardrails}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  'Cantidad mínima de reglas de comportamiento activas requerida para publicar.'
                }
                inputProps={{ min: 0, max: 50, step: 1, inputMode: 'numeric' }}
                sx={{ mt: 1.5, maxWidth: 320 }}
                fullWidth
              />
            )}
          />
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Override administrativo
          </Typography>
          <Controller
            name="allowOverride"
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
                label="Permitir forzar publicación aunque falten requisitos"
              />
            )}
          />
          {allowOverride && (
            <Alert severity="warning" sx={{ mt: 1.5 }}>
              Si está habilitado, los administradores pueden publicar el agente incluso con
              requisitos faltantes. Usalo con criterio.
            </Alert>
          )}
        </Box>

        <Divider />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={() => reset(buildInitial(policy))}
            disabled={saving || !isDirty}
          >
            Descartar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
            }
            disabled={saving || !isDirty || !isValid}
          >
            Guardar política
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
