import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { ConfigurationFormValues } from '../../schemas/configuration.schemas';
import { RETRIEVAL_METHODS } from '../../utils/retrievalMethods';

interface RetrievalMethodSelectProps {
  control: Control<ConfigurationFormValues>;
  disabled?: boolean;
}

export default function RetrievalMethodSelect({
  control,
  disabled,
}: RetrievalMethodSelectProps) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Método de recuperación
      </Typography>
      <Controller
        name="retrievalMethod"
        control={control}
        render={({ field, fieldState }) => (
          <FormControl error={!!fieldState.error} component="fieldset" fullWidth>
            <RadioGroup
              value={field.value}
              onChange={(_, v) => field.onChange(v)}
            >
              {RETRIEVAL_METHODS.map((method) => (
                <FormControlLabel
                  key={method.value}
                  value={method.value}
                  disabled={disabled}
                  control={<Radio />}
                  label={
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {method.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {method.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mb: 0.5 }}
                />
              ))}
            </RadioGroup>
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        )}
      />
    </Box>
  );
}
