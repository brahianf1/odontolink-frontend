import { Box, Grid, Slider, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { Controller, type Control } from 'react-hook-form';
import type { ConfigurationFormValues } from '../../schemas/configuration.schemas';

interface ParametersSectionProps {
  control: Control<ConfigurationFormValues>;
  disabled?: boolean;
}

interface SliderFieldProps {
  label: string;
  tooltip: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  errorMessage?: string;
}

function SliderField({
  label,
  tooltip,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  errorMessage,
}: SliderFieldProps) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography variant="body2" fontWeight={600}>
          {label}: {value.toFixed(2)}
        </Typography>
        <Tooltip title={tooltip} arrow>
          <HelpIcon fontSize="small" color="action" />
        </Tooltip>
      </Stack>
      <Slider
        value={value}
        onChange={(_, v) => onChange(Array.isArray(v) ? v[0] : v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        valueLabelDisplay="auto"
        marks={[
          { value: min, label: String(min) },
          { value: max, label: String(max) },
        ]}
      />
      {errorMessage && (
        <Typography variant="caption" color="error">
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
}

export default function ParametersSection({ control, disabled }: ParametersSectionProps) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Parámetros del modelo y recuperación
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="temperature"
            control={control}
            render={({ field, fieldState }) => (
              <SliderField
                label="Temperatura"
                tooltip="Controla la creatividad de las respuestas. 0 = determinista, 1 = muy creativa."
                value={field.value}
                onChange={field.onChange}
                min={0}
                max={1}
                step={0.05}
                disabled={disabled}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="topP"
            control={control}
            render={({ field, fieldState }) => (
              <SliderField
                label="Top-P"
                tooltip="Define el muestreo por probabilidad acumulada (nucleus sampling)."
                value={field.value}
                onChange={field.onChange}
                min={0}
                max={1}
                step={0.05}
                disabled={disabled}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="maxTokens"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === '' ? undefined : Number(raw));
                }}
                label="Tokens máximos por respuesta"
                fullWidth
                type="number"
                disabled={disabled}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  'Límite superior de tokens generados por respuesta (1–512).'
                }
                inputProps={{ min: 1, max: 512, step: 1, inputMode: 'numeric' }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="k"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === '' ? undefined : Number(raw));
                }}
                label="Documentos recuperados (k)"
                fullWidth
                type="number"
                disabled={disabled}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  'Cantidad de fragmentos relevantes que se recuperan de la base de conocimiento (1–50).'
                }
                inputProps={{ min: 1, max: 50, step: 1, inputMode: 'numeric' }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
