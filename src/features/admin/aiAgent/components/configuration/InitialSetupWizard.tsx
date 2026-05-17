import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
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
import { useAiAgentContext } from '../AiAgentContext';
import type { UpdateAiAgentConfigurationRequestDTO } from '../../../../../types/aiAgent.types';
import { mapAiAgentError } from '../../utils/apiErrors';
import { retrievalMethodMeta } from '../../utils/retrievalMethods';

interface InitialSetupWizardProps {
  onSubmit: (payload: UpdateAiAgentConfigurationRequestDTO) => Promise<void>;
  submitting: boolean;
}

const STEPS = ['Identidad y prompts', 'Parámetros del modelo', 'Revisión final'];

const STEP_FIELDS: Array<Array<keyof ConfigurationFormValues>> = [
  ['displayName', 'systemPromptCore', 'welcomeMessage'],
  ['temperature', 'topP', 'maxTokens', 'k', 'retrievalMethod'],
  [],
];

export default function InitialSetupWizard({ onSubmit, submitting }: InitialSetupWizardProps) {
  const { notifyError } = useAiAgentContext();
  const [activeStep, setActiveStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, trigger, getValues } = useForm<ConfigurationFormValues>({
    resolver: zodResolver(configurationFormSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_CONFIG_VALUES,
  });
  const { isValid } = useFormState({ control });

  const handleNext = async () => {
    const ok = await trigger(STEP_FIELDS[activeStep]);
    if (!ok) return;
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setServerError(null);
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const handleFinish = async () => {
    const ok = await trigger();
    if (!ok) {
      setActiveStep(0);
      return;
    }
    const values = getValues();
    setServerError(null);
    try {
      await onSubmit({
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
      });
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo crear la configuración inicial.');
      setServerError(mapped.message);
      notifyError(mapped.message);
    }
  };

  const summaryValues = getValues();

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Configuración inicial del agente IA
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Completá los siguientes pasos para dar de alta el chatbot.
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 360 }}>
          {activeStep === 0 && <PromptsSection control={control} disabled={submitting} />}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <ParametersSection control={control} disabled={submitting} />
              <Divider />
              <RetrievalMethodSelect control={control} disabled={submitting} />
            </Stack>
          )}
          {activeStep === 2 && <ReviewStep values={summaryValues} />}
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {serverError}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || submitting}
            startIcon={<ArrowBackIcon />}
          >
            Atrás
          </Button>
          <Stack direction="row" spacing={1}>
            <Typography variant="caption" color="text.secondary" alignSelf="center">
              Paso {activeStep + 1} de {STEPS.length}
            </Typography>
            {activeStep < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                disabled={submitting}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                variant="contained"
                color="primary"
                startIcon={
                  submitting ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />
                }
                disabled={submitting || !isValid}
              >
                Crear configuración
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ReviewStep({ values }: { values: ConfigurationFormValues }) {
  const methodMeta = retrievalMethodMeta(values.retrievalMethod);
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Revisá la configuración antes de crear
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryRow label="Nombre del agente" value={values.displayName || '—'} />
          <SummaryRow label="Método de recuperación" value={methodMeta.label} />
          <SummaryRow label="Temperatura" value={values.temperature.toFixed(2)} />
          <SummaryRow label="Top-P" value={values.topP.toFixed(2)} />
          <SummaryRow
            label="Tokens máximos"
            value={values.maxTokens !== undefined ? String(values.maxTokens) : '—'}
          />
          <SummaryRow label="k (documentos)" value={values.k !== undefined ? String(values.k) : '—'} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="caption" color="text.secondary">
            System prompt
          </Typography>
          <Box
            sx={{
              p: 1.5,
              backgroundColor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 180,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.8rem',
              mb: 2,
            }}
          >
            {values.systemPromptCore || '—'}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Mensaje de bienvenida
          </Typography>
          <Box
            sx={{
              p: 1.5,
              backgroundColor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 120,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontSize: '0.85rem',
            }}
          >
            {values.welcomeMessage || '—'}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1.2 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
