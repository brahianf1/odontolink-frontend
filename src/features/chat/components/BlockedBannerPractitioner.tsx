import { Alert, Box, Button, Typography } from '@mui/material';
import { formatMessageTime } from '../utils/chatTimeFormat';

interface BlockedBannerPractitionerProps {
  reason?: string | null;
  blockedAt?: string | null;
  submitting: boolean;
  onUnblock: () => void;
}

export default function BlockedBannerPractitioner({
  reason,
  blockedAt,
  submitting,
  onUnblock,
}: BlockedBannerPractitionerProps) {
  return (
    <Alert
      severity="warning"
      action={
        <Button
          color="inherit"
          size="small"
          variant="outlined"
          onClick={onUnblock}
          disabled={submitting}
        >
          {submitting ? 'Desbloqueando…' : 'Desbloquear'}
        </Button>
      }
      sx={{ borderRadius: 0 }}
    >
      <Box>
        <Typography variant="subtitle2" fontWeight={700}>
          Bloqueaste esta conversación
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          {blockedAt ? `Desde ${formatMessageTime(blockedAt)}. ` : ''}
          El paciente no puede enviar mensajes, pero sí leer el historial.
        </Typography>
        {reason?.trim() && (
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
          >
            Motivo: {reason}
          </Typography>
        )}
      </Box>
    </Alert>
  );
}
