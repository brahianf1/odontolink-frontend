import type { AiAgentHealthResponseDTO } from '../../../../types/aiAgent.types';
import { useAiAgentContext } from '../components/AiAgentContext';

interface UseAiAgentHealthResult {
  health: AiAgentHealthResponseDTO | null;
  loading: boolean;
  error: string | null;
  isNotConfigured: boolean;
  refresh: () => Promise<void>;
}

export function useAiAgentHealth(): UseAiAgentHealthResult {
  const { health, healthLoading, healthError, refreshHealth, isUnconfigured } =
    useAiAgentContext();
  return {
    health,
    loading: healthLoading,
    error: healthError,
    isNotConfigured: isUnconfigured,
    refresh: refreshHealth,
  };
}
