import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Save as SaveIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  configurationFormSchema,
  DEFAULT_CONFIG_VALUES,
  type ConfigurationFormValues,
} from '../../schemas/configuration.schemas';
import PromptsSection from './PromptsSection';
import ParametersSection from './ParametersSection';
import RetrievalMethodSelect from './RetrievalMethodSelect';
import type {
  AiAgentConfigurationResponseDTO,
  UpdateAiAgentConfigurationRequestDTO,
} from '../../../../../types/aiAgent.types';
import LifecycleChip from '../common/LifecycleChip';
import { useAiAgentContext } from '../AiAgentContext';
import { mapAiAgentError } from '../../utils/apiErrors';
import { canRevert } from '../../utils/lifecycle';

interface ConfigurationFormProps {
  configuration: AiAgentConfigurationResponseDTO;
  saving: boolean;
  reverting: boolean;
  onSave: (payload: UpdateAiAgentConfigurationRequestDTO) => Promise<AiAgentConfigurationResponseDTO>;
  onRevert: () => Promise<AiAgentConfigurationResponseDTO>;
  onDirtyChange?: (dirty: boolean) => void;
}

const buildInitialValues = (
  config: AiAgentConfigurationResponseDTO
): ConfigurationFormValues => ({
  displayName: config.displayName ?? '',
  systemPromptCore: config.systemPromptCore ?? '',
  welcomeMessage: config.welcomeMessage ?? '',
  temperature: typeof config.temperature === 'number' ? config.temperature : 0.7,
  topP: typeof config.topP === 'number' ? config.topP : 0.9,
  maxTokens:
    typeof config.maxTokens === 'number' ? config.maxTokens : DEFAULT_CONFIG_VALUES.maxTokens,
  k: typeof config.k === 'number' ? config.k : DEFAULT_CONFIG_VALUES.k,
  retrievalMethod: config.retrievalMethod ?? 'REWRITE',
});

export default function ConfigurationForm({
  configuration,
  saving,
  reverting,
  onSave,
  onRevert,
  onDirtyChange,
}: ConfigurationFormProps) {
  const { notifySuccess, notifyError, notifyInfo } = useAiAgentContext();

  const initial = buildInitialValues(configuration);
  const { control, handleSubmit, reset } = useForm<ConfigurationFormValues>({
    resolver: zodResolver(configurationFormSchema),
    mode: 'onChange',
    defaultValues: initial,
  });
  const { isDirty, isValid } = useFormState({ control });

  useEffect(() => {
    reset(buildInitialValues(configuration));
  }, [configuration, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleReset = () => {
    reset(buildInitialValues(configuration));
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload: UpdateAiAgentConfigurationRequestDTO = {
      displayName: values.displayName.trim(),
      systemPromptCore: values.systemPromptCore.trim(),
      welcomeMessage:
        values.welcomeMessage && values.welcomeMessage.trim().length > 0
          ? values.welcomeMessage.trim()
          : undefined,
      temperature: values.temperature,
      topP: values.topP,
      maxTokens: values.maxTokens,
      k: values.k,
      retrievalMethod: values.retrievalMethod,
    };
    try {
      const wasPublished = configuration.lifecycle === 'PUBLISHED';
      const updated = await onSave(payload);
      reset(buildInitialValues(updated));
      onDirtyChange?.(false);
      notifySuccess(
        wasPublished
          ? 'Configuración guardada. Se creó una nueva versión en estado borrador.'
          : 'Configuración guardada correctamente.'
      );
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo guardar la configuración.');
      notifyError(mapped.message);
    }
  });

  const handleRevertClick = async () => {
    try {
      await onRevert();
      notifyInfo('Se revirtió la versión publicada al estado borrador anterior.');
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo revertir a borrador.');
      notifyError(mapped.message);
    }
  };

  const isPublished = configuration.lifecycle === 'PUBLISHED';

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Configuración del agente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Parámetros del modelo, prompts y método de recuperación.
            </Typography>
          </Box>
          <LifecycleChip lifecycle={configuration.lifecycle} size="medium" />
        </Stack>

        {isPublished && (
          <Alert severity="info" sx={{ mb: 2 }}>
            El agente está publicado. Al guardar cambios se creará una nueva versión en estado
            borrador. Tendrás que publicarla nuevamente para que el agente refleje los cambios.
          </Alert>
        )}

        <form onSubmit={onSubmit} noValidate>
          <Stack spacing={3} divider={<Divider flexItem />}>
            <PromptsSection control={control} disabled={saving} />
            <ParametersSection control={control} disabled={saving} />
            <RetrievalMethodSelect control={control} disabled={saving} />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            {canRevert(configuration.lifecycle) ? (
              <Button
                variant="text"
                color="warning"
                startIcon={
                  reverting ? <CircularProgress size={16} color="inherit" /> : <ReplayIcon />
                }
                onClick={handleRevertClick}
                disabled={reverting || saving}
              >
                Revertir a borrador
              </Button>
            ) : (
              <Box />
            )}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={handleReset}
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
                Guardar cambios
              </Button>
            </Stack>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
