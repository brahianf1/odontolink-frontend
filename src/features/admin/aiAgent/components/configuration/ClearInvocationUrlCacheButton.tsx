import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { clearInvocationUrlCache } from '../../../../../services/api/aiAgentService';
import { useAiAgentContext } from '../AiAgentContext';
import { mapAiAgentError } from '../../utils/apiErrors';
import type { AiAgentConfigurationResponseDTO } from '../../../../../types/aiAgent.types';

interface ClearInvocationUrlCacheButtonProps {
  agentInvocationUrl?: string | null;
  disabled?: boolean;
}

export default function ClearInvocationUrlCacheButton({
  agentInvocationUrl,
  disabled,
}: ClearInvocationUrlCacheButtonProps) {
  const { setConfiguration, notifySuccess, notifyError } = useAiAgentContext();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasUrl = !!agentInvocationUrl && agentInvocationUrl.trim().length > 0;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const updated: AiAgentConfigurationResponseDTO = await clearInvocationUrlCache();
      setConfiguration(updated);
      notifySuccess(
        'Caché limpiada. El backend resolverá la URL nuevamente en la próxima invocación al chatbot.'
      );
      setConfirmOpen(false);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo limpiar la caché de la URL.');
      notifyError(mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          URL del agente (proveedor DigitalOcean)
        </Typography>
        {hasUrl ? (
          <Chip
            size="small"
            color="success"
            variant="outlined"
            icon={<CheckIcon sx={{ fontSize: 14 }} />}
            label="Cacheada"
          />
        ) : (
          <Chip size="small" variant="outlined" label="Sin cachear" />
        )}
      </Stack>

      {hasUrl ? (
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.8rem',
            wordBreak: 'break-all',
            color: 'text.primary',
            mb: 1,
          }}
        >
          {agentInvocationUrl}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Aún no resuelta. El backend la descubre y cachea automáticamente en la primera
          invocación al chatbot.
        </Typography>
      )}

      <Tooltip
        title={
          hasUrl
            ? 'Forzá que el backend redescubra la URL en la próxima invocación. Útil si cambiaste el deployment del agente en DigitalOcean.'
            : 'Limpiar la caché ahora no tiene efecto visible — la URL recién se resuelve cuando alguien usa el chatbot.'
        }
        arrow
      >
        <span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => setConfirmOpen(true)}
            disabled={disabled || submitting}
          >
            Limpiar caché de URL del agente
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Limpiar caché de la URL del agente</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Stack spacing={2}>
              <Typography variant="body2">
                Esta acción borra la URL cacheada del agente IA. La próxima invocación al chatbot
                disparará una nueva resolución de la URL desde DigitalOcean.
              </Typography>
              {!hasUrl && (
                <Alert severity="info">
                  Como la URL todavía no se cacheó, esta operación no tendrá un efecto visible
                  inmediato. La URL aparecerá automáticamente la primera vez que se invoque al
                  chatbot.
                </Alert>
              )}
              <Alert severity="info">
                Es una operación segura. No afecta a las conversaciones activas ni a la
                configuración del agente.
              </Alert>
            </Stack>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />
            }
          >
            Limpiar caché
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
