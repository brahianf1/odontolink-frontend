import { Alert, AlertTitle, Box, useTheme } from '@mui/material';
import { HourglassEmpty as HourglassIcon } from '@mui/icons-material';
import { formatCountdown } from '../utils/countdownFormat';

interface ChatbotRateLimitOverlayProps {
  secondsLeft: number;
}

export default function ChatbotRateLimitOverlay({
  secondsLeft,
}: ChatbotRateLimitOverlayProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        px: 1.5,
        py: 1,
      }}
    >
      <Alert
        severity="warning"
        icon={<HourglassIcon fontSize="inherit" />}
        sx={{ alignItems: 'center' }}
      >
        <AlertTitle sx={{ mb: 0, fontWeight: 700 }}>
          Límite por hora alcanzado
        </AlertTitle>
        Podés volver a escribir en{' '}
        <Box
          component="span"
          sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}
        >
          {formatCountdown(secondsLeft)}
        </Box>
        .
      </Alert>
    </Box>
  );
}
