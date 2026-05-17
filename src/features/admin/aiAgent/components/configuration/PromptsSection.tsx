import { Box, Grid, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { Controller, type Control } from 'react-hook-form';
import type { ConfigurationFormValues } from '../../schemas/configuration.schemas';

interface PromptsSectionProps {
  control: Control<ConfigurationFormValues>;
  disabled?: boolean;
}

export default function PromptsSection({ control, disabled }: PromptsSectionProps) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Identidad y prompts
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="displayName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Nombre del agente"
                fullWidth
                required
                disabled={disabled}
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? 'Nombre interno del chatbot.'}
                inputProps={{ maxLength: 150 }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="systemPromptCore"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Prompt de sistema"
                fullWidth
                required
                multiline
                minRows={6}
                disabled={disabled}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  'Instrucciones base que recibe el modelo IA en cada conversación.'
                }
                inputProps={{ maxLength: 8000 }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="welcomeMessage"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Mensaje de bienvenida"
                fullWidth
                multiline
                minRows={3}
                disabled={disabled}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  'Saludo inicial mostrado a los usuarios del chat.'
                }
                inputProps={{ maxLength: 2000 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <Tooltip
                        title="Este mensaje NO se envía al modelo de IA. Se utiliza solo para saludar a los usuarios del chat público."
                        arrow
                      >
                        <HelpIcon fontSize="small" color="action" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
