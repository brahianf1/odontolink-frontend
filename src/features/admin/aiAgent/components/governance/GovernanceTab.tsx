import { useCallback, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useGovernancePolicy } from '../../hooks/useGovernancePolicy';
import { useAiAgentContext } from '../AiAgentContext';
import GovernancePolicyForm from './GovernancePolicyForm';
import type { UpdateAiGovernancePolicyRequestDTO } from '../../../../../types/aiAgent.types';
import { mapAiAgentError } from '../../utils/apiErrors';

export default function GovernanceTab() {
  const { policy, loading, saving, error, refresh, save } = useGovernancePolicy();
  const { notifySuccess, notifyError, registerDirty, isUnconfigured } = useAiAgentContext();

  const handleDirtyChange = useCallback(
    (dirty: boolean) => registerDirty('governance', dirty),
    [registerDirty]
  );

  useEffect(() => {
    return () => {
      registerDirty('governance', false);
    };
  }, [registerDirty]);

  const handleSave = async (payload: UpdateAiGovernancePolicyRequestDTO) => {
    try {
      await save(payload);
      registerDirty('governance', false);
      notifySuccess('Política de gobernanza actualizada.');
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo guardar la política de gobernanza.');
      notifyError(mapped.message);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Política de gobernanza
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define qué validaciones se aplican antes de permitir la publicación del agente.
          </Typography>
        </Box>

        {isUnconfigured && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Podés definir la política ahora; se aplicará en cuanto publiques el agente por primera
            vez.
          </Alert>
        )}

        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refresh()}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        ) : loading ? (
          <Stack spacing={1}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={42} />
            ))}
          </Stack>
        ) : policy ? (
          <GovernancePolicyForm
            policy={policy}
            saving={saving}
            onSubmit={handleSave}
            onDirtyChange={handleDirtyChange}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
