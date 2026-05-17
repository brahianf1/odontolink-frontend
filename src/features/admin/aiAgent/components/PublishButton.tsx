import { useState } from 'react';
import { Button, CircularProgress, Stack, Tooltip } from '@mui/material';
import { Publish as PublishIcon } from '@mui/icons-material';
import { useAiAgentConfiguration } from '../hooks/useAiAgentConfiguration';
import { useGovernancePolicy } from '../hooks/useGovernancePolicy';
import LifecycleChip from './common/LifecycleChip';
import PublishConfirmDialog from './publish/PublishConfirmDialog';
import { useAiAgentContext } from './AiAgentContext';

export default function PublishButton() {
  const { configuration, publishing, publish, loading } = useAiAgentConfiguration();
  const { policy, loading: loadingPolicy } = useGovernancePolicy();
  const { health, healthLoading, notifySuccess, refreshHealth } = useAiAgentContext();
  const [open, setOpen] = useState(false);

  if (loading || loadingPolicy) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress size={20} />
      </Stack>
    );
  }

  if (!configuration) {
    return null;
  }

  const lifecycle = configuration.lifecycle;
  const allowOverride = policy?.allowOverride ?? false;
  const missingCount = health?.missingRequirements?.length ?? 0;
  const providerReachable = health?.providerReachable ?? true;
  const isPublished = lifecycle === 'PUBLISHED';

  const isWaitingForHealth = healthLoading && !health;

  // Lógica de habilitación MD3
  let disabled = false;
  let tooltipText = '';

  if (isPublished) {
    disabled = true;
    tooltipText = 'El agente ya está publicado.';
  } else if (isWaitingForHealth) {
    disabled = true;
    tooltipText = 'Verificando estado del agente…';
  } else if (!providerReachable) {
    disabled = true;
    tooltipText = 'El proveedor de IA no está disponible. Intentá nuevamente más tarde.';
  } else if (missingCount > 0 && !allowOverride) {
    disabled = true;
    tooltipText = `Faltan ${missingCount} ${
      missingCount === 1 ? 'requisito' : 'requisitos'
    } para publicar. Revisalos en la pestaña Estado.`;
  } else if (missingCount > 0 && allowOverride) {
    tooltipText = `Faltan ${missingCount} ${
      missingCount === 1 ? 'requisito' : 'requisitos'
    }. Podés forzar la publicación con override.`;
  } else {
    tooltipText = 'Publicar la versión actual del agente.';
  }

  const handleOpen = async () => {
    setOpen(true);
    void refreshHealth();
  };

  const handleConfirm = async (override: boolean) => {
    await publish(override);
    notifySuccess('Agente publicado correctamente.');
    setOpen(false);
  };

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <LifecycleChip lifecycle={lifecycle} size="medium" />
      <Tooltip title={tooltipText} arrow>
        <span>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PublishIcon />}
            disabled={disabled || publishing}
            onClick={handleOpen}
          >
            {isPublished ? 'Publicado' : 'Publicar'}
          </Button>
        </span>
      </Tooltip>
      <PublishConfirmDialog
        open={open}
        publishing={publishing}
        allowOverride={allowOverride}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </Stack>
  );
}
