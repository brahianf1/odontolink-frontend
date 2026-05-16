import { Alert, Box, Typography } from '@mui/material';

interface BlockedNoticePatientProps {
  blockerLabel: string;
}

export default function BlockedNoticePatient({
  blockerLabel,
}: BlockedNoticePatientProps) {
  return (
    <Alert severity="info" sx={{ borderRadius: 0 }}>
      <Box>
        <Typography variant="subtitle2" fontWeight={700}>
          Conversación bloqueada
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          {blockerLabel} bloqueó esta conversación. Puedes leer los mensajes
          anteriores, pero no enviar mensajes nuevos.
        </Typography>
      </Box>
    </Alert>
  );
}
