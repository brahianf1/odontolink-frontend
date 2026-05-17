import { useCallback, useEffect } from 'react';
import { Alert, Skeleton, Stack } from '@mui/material';
import { useAiAgentConfiguration } from '../../hooks/useAiAgentConfiguration';
import { useAiAgentContext } from '../AiAgentContext';
import ConfigurationForm from './ConfigurationForm';
import InitialSetupWizard from './InitialSetupWizard';
import type { UpdateAiAgentConfigurationRequestDTO } from '../../../../../types/aiAgent.types';

export default function ConfigurationTab() {
  const {
    configuration,
    loading,
    saving,
    reverting,
    error,
    isUnconfigured,
    save,
    revert,
  } = useAiAgentConfiguration();
  const { notifySuccess, registerDirty } = useAiAgentContext();

  const handleDirtyChange = useCallback(
    (dirty: boolean) => registerDirty('configuration', dirty),
    [registerDirty]
  );

  useEffect(() => {
    return () => {
      registerDirty('configuration', false);
    };
  }, [registerDirty]);

  const handleWizardSubmit = useCallback(
    async (payload: UpdateAiAgentConfigurationRequestDTO) => {
      await save(payload);
      notifySuccess('Configuración inicial creada. El agente está en estado borrador.');
    },
    [save, notifySuccess]
  );

  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={420} />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (isUnconfigured || !configuration) {
    return <InitialSetupWizard onSubmit={handleWizardSubmit} submitting={saving} />;
  }

  return (
    <ConfigurationForm
      configuration={configuration}
      saving={saving}
      reverting={reverting}
      onSave={save}
      onRevert={revert}
      onDirtyChange={handleDirtyChange}
    />
  );
}
