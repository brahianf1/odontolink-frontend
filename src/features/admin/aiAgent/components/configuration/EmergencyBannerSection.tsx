import { Box, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { Controller, type Control } from 'react-hook-form';
import type { ConfigurationFormValues } from '../../schemas/configuration.schemas';

interface EmergencyBannerSectionProps {
  control: Control<ConfigurationFormValues>;
  disabled?: boolean;
}

export default function EmergencyBannerSection({
  control,
  disabled,
}: EmergencyBannerSectionProps) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Texto de emergencia
      </Typography>
      <Controller
        name="emergencyBannerText"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Banner de emergencia"
            fullWidth
            required
            multiline
            minRows={3}
            disabled={disabled}
            error={!!fieldState.error}
            helperText={
              fieldState.error?.message ??
              'Se prepende a la respuesta del bot cuando se detecta una palabra de emergencia. Indicá cómo derivar al usuario (guardia, número de emergencias, etc.).'
            }
            inputProps={{ maxLength: 500 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <Tooltip
                    title="Las palabras clave que disparan este banner se administran en la pestaña 'Palabras de emergencia'."
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
    </Box>
  );
}
