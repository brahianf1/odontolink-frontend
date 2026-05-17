import { Alert, AlertTitle, Box, IconButton, LinearProgress, Stack } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useIndexingJob } from '../../hooks/useIndexingJob';

interface IndexingJobBannerProps {
  jobId: string | null;
  onDismiss: () => void;
  onComplete?: () => void;
}

export default function IndexingJobBanner({
  jobId,
  onDismiss,
  onComplete,
}: IndexingJobBannerProps) {
  const { status, polling, done } = useIndexingJob({
    jobId,
    onTerminal: () => {
      onComplete?.();
    },
  });

  if (!jobId) return null;

  const severity = done
    ? status?.status?.toUpperCase().includes('FAIL') || status?.status?.toUpperCase() === 'ERROR'
      ? 'error'
      : 'success'
    : 'info';

  const title = done
    ? severity === 'error'
      ? 'La re-indexación falló'
      : 'Re-indexación completada'
    : 'Re-indexación en curso';

  return (
    <Alert
      severity={severity}
      sx={{ mb: 2 }}
      action={
        <IconButton size="small" onClick={onDismiss} aria-label="Cerrar">
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <AlertTitle>{title}</AlertTitle>
      <Stack spacing={1}>
        <Box>
          Estado: <strong>{status?.status ?? (polling ? 'Consultando…' : 'Pendiente')}</strong>
          {status?.jobId && (
            <Box
              component="span"
              sx={{
                ml: 1,
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.78rem',
                color: 'text.secondary',
              }}
            >
              ({status.jobId})
            </Box>
          )}
        </Box>
        {status?.errorMessage && <Box>Detalle: {status.errorMessage}</Box>}
        {polling && !done && <LinearProgress />}
      </Stack>
    </Alert>
  );
}
