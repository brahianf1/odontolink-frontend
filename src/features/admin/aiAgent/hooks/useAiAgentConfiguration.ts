import { useCallback, useState } from 'react';
import {
  publish as publishConfiguration,
  revertToDraft,
  saveConfiguration,
} from '../../../../services/api/aiAgentService';
import type {
  AiAgentConfigurationResponseDTO,
  UpdateAiAgentConfigurationRequestDTO,
} from '../../../../types/aiAgent.types';
import { useAiAgentContext } from '../components/AiAgentContext';

interface UseAiAgentConfigurationResult {
  configuration: AiAgentConfigurationResponseDTO | null;
  loading: boolean;
  saving: boolean;
  publishing: boolean;
  reverting: boolean;
  error: string | null;
  isUnconfigured: boolean;
  refresh: () => Promise<void>;
  save: (payload: UpdateAiAgentConfigurationRequestDTO) => Promise<AiAgentConfigurationResponseDTO>;
  revert: () => Promise<AiAgentConfigurationResponseDTO>;
  publish: (override?: boolean) => Promise<AiAgentConfigurationResponseDTO>;
}

export function useAiAgentConfiguration(): UseAiAgentConfigurationResult {
  const {
    configuration,
    configurationLoading,
    configurationError,
    isUnconfigured,
    refreshConfiguration,
    setConfiguration,
    refreshHealth,
  } = useAiAgentContext();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [reverting, setReverting] = useState(false);

  // El bootstrap del context dispara refreshHealth solo una vez al cargar
  // la configuration inicial. save/publish/revert cambian el lifecycle (y
  // pueden cambiar campos que afectan missingRequirements), así que ahora
  // pedimos refresh de health explícito acá — antes el useEffect del context
  // lo hacía automáticamente al cambiar configuration.
  const save = useCallback(
    async (payload: UpdateAiAgentConfigurationRequestDTO) => {
      setSaving(true);
      try {
        const updated = await saveConfiguration(payload);
        setConfiguration(updated);
        void refreshHealth();
        return updated;
      } finally {
        setSaving(false);
      }
    },
    [setConfiguration, refreshHealth]
  );

  const revert = useCallback(async () => {
    setReverting(true);
    try {
      const updated = await revertToDraft();
      setConfiguration(updated);
      void refreshHealth();
      return updated;
    } finally {
      setReverting(false);
    }
  }, [setConfiguration, refreshHealth]);

  const publish = useCallback(
    async (override = false) => {
      setPublishing(true);
      try {
        const updated = await publishConfiguration(override);
        setConfiguration(updated);
        void refreshHealth();
        return updated;
      } finally {
        setPublishing(false);
      }
    },
    [setConfiguration, refreshHealth]
  );

  return {
    configuration,
    loading: configurationLoading,
    saving,
    publishing,
    reverting,
    error: configurationError,
    isUnconfigured,
    refresh: refreshConfiguration,
    save,
    revert,
    publish,
  };
}
