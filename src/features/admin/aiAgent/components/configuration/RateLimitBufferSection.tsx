import { Alert, Box, Grid, Slider, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { Controller, type Control } from 'react-hook-form';
import type { ConfigurationFormValues } from '../../schemas/configuration.schemas';

interface RateLimitBufferSectionProps {
  control: Control<ConfigurationFormValues>;
  disabled?: boolean;
}

export default function RateLimitBufferSection({
  control,
  disabled,
}: RateLimitBufferSectionProps) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Conversación y rate limiting
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="conversationBufferSize"
            control={control}
            render={({ field, fieldState }) => {
              const value = typeof field.value === 'number' ? field.value : 20;
              const turns = Math.floor(value / 2);
              return (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                      Mensajes recordados por sesión: {value}
                    </Typography>
                    <Tooltip
                      title="Cantidad de mensajes (entre usuario y bot) que el chatbot recuerda en una misma sesión. Mensajes más viejos se descartan automáticamente."
                      arrow
                    >
                      <HelpIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Stack>
                  <Slider
                    value={value}
                    onChange={(_, v) => field.onChange(Array.isArray(v) ? v[0] : v)}
                    min={4}
                    max={50}
                    step={1}
                    disabled={disabled}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 4, label: '4' },
                      { value: 50, label: '50' },
                    ]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Aproximadamente {turns} {turns === 1 ? 'turno completo' : 'turnos completos'}{' '}
                    paciente ↔ bot.
                  </Typography>
                  {fieldState.error && (
                    <Typography variant="caption" color="error" display="block">
                      {fieldState.error.message}
                    </Typography>
                  )}
                </Box>
              );
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="rateLimitAnonymousPerHour"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === '' ? 0 : Number(raw));
                }}
                label="Mensajes/hora por IP anónima"
                fullWidth
                required
                type="number"
                disabled={disabled}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  'Tope de mensajes que puede enviar un usuario no autenticado por hora (1–1000). Sugerido: 20.'
                }
                inputProps={{ min: 1, max: 1000, step: 1, inputMode: 'numeric' }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="rateLimitAuthenticatedPerHour"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === '' ? 0 : Number(raw));
                }}
                label="Mensajes/hora por usuario autenticado"
                fullWidth
                required
                type="number"
                disabled={disabled}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  'Tope de mensajes por usuario autenticado por hora (1–5000). Sugerido: 60.'
                }
                inputProps={{ min: 1, max: 5000, step: 1, inputMode: 'numeric' }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Alert severity="info" variant="outlined">
            Los cambios de rate limit se aplican a sesiones nuevas. Las sesiones activas mantienen
            el tope previo hasta el próximo reinicio del backend.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}
