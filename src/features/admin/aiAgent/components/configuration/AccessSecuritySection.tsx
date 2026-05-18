import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useWatch, type Control } from 'react-hook-form';
import type { ConfigurationFormValues } from '../../schemas/configuration.schemas';
import { ACCESS_MODES } from '../../utils/accessMode';
import { PII_POLICIES } from '../../utils/piiPolicy';
import { ALLOWED_ROLES, allowedRoleMeta } from '../../utils/allowedRoles';
import type { AllowedRole } from '../../../../../types/aiAgent.types';

interface AccessSecuritySectionProps {
  control: Control<ConfigurationFormValues>;
  disabled?: boolean;
}

export default function AccessSecuritySection({
  control,
  disabled,
}: AccessSecuritySectionProps) {
  const accessMode = useWatch({ control, name: 'accessMode' });
  const showRoles = accessMode === 'PRIVATE';

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Acceso y seguridad
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          Modo de acceso
        </Typography>
        <Controller
          name="accessMode"
          control={control}
          render={({ field, fieldState }) => (
            <FormControl error={!!fieldState.error} component="fieldset" fullWidth>
              <RadioGroup value={field.value} onChange={(_, v) => field.onChange(v)}>
                {ACCESS_MODES.map((mode) => (
                  <FormControlLabel
                    key={mode.value}
                    value={mode.value}
                    disabled={disabled}
                    control={<Radio />}
                    label={
                      <Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {mode.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {mode.description}
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

      {showRoles && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Roles permitidos
          </Typography>
          <Controller
            name="allowedRoles"
            control={control}
            render={({ field, fieldState }) => (
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={ALLOWED_ROLES.map((r) => r.value)}
                value={field.value}
                onChange={(_, value) => field.onChange(value as AllowedRole[])}
                disabled={disabled}
                getOptionLabel={(option) => allowedRoleMeta(option as AllowedRole).label}
                renderTags={(value: readonly AllowedRole[], getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={allowedRoleMeta(option).label}
                        size="small"
                        {...tagProps}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Seleccioná uno o más roles"
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message ??
                      'Solo los roles seleccionados podrán acceder al chatbot.'
                    }
                  />
                )}
              />
            )}
          />
        </Box>
      )}

      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          Política de datos personales (PII)
        </Typography>
        <Controller
          name="piiPolicy"
          control={control}
          render={({ field, fieldState }) => (
            <FormControl error={!!fieldState.error} component="fieldset" fullWidth>
              <RadioGroup value={field.value} onChange={(_, v) => field.onChange(v)}>
                {PII_POLICIES.map((policy) => (
                  <FormControlLabel
                    key={policy.value}
                    value={policy.value}
                    disabled={disabled}
                    control={<Radio />}
                    label={
                      <Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {policy.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {policy.description}
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
    </Box>
  );
}
