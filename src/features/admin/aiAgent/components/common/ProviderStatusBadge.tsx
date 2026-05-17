import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { CheckCircle as OkIcon, Error as ErrorIcon } from '@mui/icons-material';

interface ProviderStatusBadgeProps {
  providerReachable: boolean;
  providerErrorDetail?: string | null;
}

export default function ProviderStatusBadge({
  providerReachable,
  providerErrorDetail,
}: ProviderStatusBadgeProps) {
  const tooltipText = providerReachable
    ? 'El proveedor de IA responde correctamente.'
    : providerErrorDetail || 'El proveedor de IA no está disponible.';

  return (
    <Tooltip title={tooltipText} arrow>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box
          component={providerReachable ? OkIcon : ErrorIcon}
          sx={{
            color: providerReachable ? 'success.main' : 'error.main',
            fontSize: 20,
          }}
        />
        <Typography
          variant="body2"
          sx={{ color: providerReachable ? 'success.main' : 'error.main', fontWeight: 600 }}
        >
          {providerReachable ? 'Proveedor disponible' : 'Proveedor caído'}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
