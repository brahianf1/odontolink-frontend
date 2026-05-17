import { useCallback, useState } from 'react';
import { updateGovernancePolicy } from '../../../../services/api/aiAgentService';
import type {
  AiGovernancePolicyResponseDTO,
  UpdateAiGovernancePolicyRequestDTO,
} from '../../../../types/aiAgent.types';
import { useAiAgentContext } from '../components/AiAgentContext';

interface UseGovernancePolicyResult {
  policy: AiGovernancePolicyResponseDTO | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (payload: UpdateAiGovernancePolicyRequestDTO) => Promise<AiGovernancePolicyResponseDTO>;
}

export function useGovernancePolicy(): UseGovernancePolicyResult {
  const {
    governance,
    governanceLoading,
    governanceError,
    refreshGovernance,
    setGovernance,
    refreshHealth,
  } = useAiAgentContext();
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (payload: UpdateAiGovernancePolicyRequestDTO) => {
      setSaving(true);
      try {
        const updated = await updateGovernancePolicy(payload);
        setGovernance(updated);
        void refreshHealth();
        return updated;
      } finally {
        setSaving(false);
      }
    },
    [setGovernance, refreshHealth]
  );

  return {
    policy: governance,
    loading: governanceLoading,
    saving,
    error: governanceError,
    refresh: refreshGovernance,
    save,
  };
}
