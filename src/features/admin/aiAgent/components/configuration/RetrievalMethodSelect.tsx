import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
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

      <Divider sx={{ my: 2 }} />

      <Controller
        name="provideCitations"
        control={control}
        render={({ field }) => (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={disabled}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    Incluir citas en las respuestas
                  </Typography>
                  <Tooltip
                    arrow
                    title="Si está activo, el agente devuelve junto a cada respuesta las referencias a los documentos de la Knowledge Base que usó. Útil para contextos académicos o auditables. Para chat de pacientes, recomendado dejarlo desactivado."
                  >
                    <HelpIcon fontSize="small" color="action" />
                  </Tooltip>
                </Stack>
              }
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Por defecto: desactivado (respuestas limpias para el paciente).
            </Typography>
          </Box>
        )}
      />

      <Divider sx={{ my: 2 }} />

      <Controller
        name="showConfidenceIndicator"
        control={control}
        render={({ field }) => (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={disabled}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    Mostrar indicador de confianza al paciente
                  </Typography>
                  <Tooltip
                    arrow
                    title="Cuando está activado, cada respuesta del chatbot incluye un bloque con la categoría de confianza (oficial / parcial / general / fuera de alcance). Desactivalo para A/B testing o demos donde no quieras mostrarlo."
                  >
                    <HelpIcon fontSize="small" color="action" />
                  </Tooltip>
                </Stack>
              }
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Por defecto: activado.
            </Typography>
          </Box>
        )}
      />
    </Box>
  );
}
