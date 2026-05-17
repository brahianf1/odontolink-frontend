import { Alert, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AiAgentConfigurationResponseDTO } from '../../../../../types/aiAgent.types';

interface ProviderSyncCardProps {
  configuration: AiAgentConfigurationResponseDTO;
}

const formatTimestamp = (value?: string | null): string => {
  if (!value) return '—';
  try {
    return format(parseISO(value), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return value;
  }
};

export default function ProviderSyncCard({ configuration }: ProviderSyncCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Sincronización con el proveedor
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              ID del agente en el proveedor
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'ui-monospace, SFMono-Regular, "Courier New", monospace',
                wordBreak: 'break-all',
              }}
            >
              {configuration.providerAgentId || '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Última sincronización
            </Typography>
            <Typography variant="body2">{formatTimestamp(configuration.providerSyncedAt)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Última actualización local
            </Typography>
            <Typography variant="body2">{formatTimestamp(configuration.updatedAt)}</Typography>
          </Box>
          {configuration.lastSyncError && (
            <Alert severity="error" variant="outlined">
              <Typography variant="caption" fontWeight={700} display="block">
                Último error de sincronización
              </Typography>
              <Typography variant="body2">{configuration.lastSyncError}</Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
