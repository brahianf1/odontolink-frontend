import { useCallback, useEffect, useRef, useState } from 'react';
import {
  activatePolicyRule,
  createPolicyRule,
  deactivatePolicyRule,
  deletePolicyRule,
  listPolicyRules,
  updatePolicyRule,
} from '../../../../services/api/aiAgentService';
import type {
  PolicyRuleRequestDTO,
  PolicyRuleResponseDTO,
} from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';
import { useAiAgentContext } from '../components/AiAgentContext';

interface UsePolicyRulesResult {
  policyRules: PolicyRuleResponseDTO[];
  loading: boolean;
  mutatingId: number | null;
  error: string | null;
  refresh: () => Promise<void>;
  create: (payload: PolicyRuleRequestDTO) => Promise<PolicyRuleResponseDTO>;
  update: (id: number, payload: PolicyRuleRequestDTO) => Promise<PolicyRuleResponseDTO>;
  remove: (id: number) => Promise<void>;
  setActive: (id: number, active: boolean) => Promise<PolicyRuleResponseDTO>;
}

const sortPolicyRules = (items: PolicyRuleResponseDTO[]): PolicyRuleResponseDTO[] =>
  [...items].sort((a, b) => a.label.localeCompare(b.label, 'es'));

export function usePolicyRules(): UsePolicyRulesResult {
  const { refreshHealth, markConfigurationDraft } = useAiAgentContext();
  const [policyRules, setPolicyRules] = useState<PolicyRuleResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPolicyRules();
      if (!mountedRef.current) return;
      setPolicyRules(sortPolicyRules(data));
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudieron cargar las reglas de comportamiento.');
      if (!mountedRef.current) return;
      setError(mapped.message);
      setPolicyRules([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Toda mutación de PolicyRule revierte el lifecycle del agente a DRAFT
  // (confirmado por backend). markConfigurationDraft es 0-latency. Solo
  // setActive/remove llaman refreshHealth porque cambian el conteo de
  // activas (MIN_ACTIVE_GUARDRAILS). create/update no mueven ese conteo
  // (create entra como nueva, update solo toca label/text), así que
  // ahorramos el round-trip al health.
  const create = useCallback(
    async (payload: PolicyRuleRequestDTO) => {
      setMutatingId(-1);
      try {
        const created = await createPolicyRule(payload);
        if (mountedRef.current) setPolicyRules((prev) => sortPolicyRules([...prev, created]));
        markConfigurationDraft();
        return created;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [markConfigurationDraft]
  );

  const update = useCallback(
    async (id: number, payload: PolicyRuleRequestDTO) => {
      setMutatingId(id);
      try {
        const updated = await updatePolicyRule(id, payload);
        if (mountedRef.current) {
          setPolicyRules((prev) => sortPolicyRules(prev.map((r) => (r.id === id ? updated : r))));
        }
        markConfigurationDraft();
        return updated;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [markConfigurationDraft]
  );

  const remove = useCallback(
    async (id: number) => {
      setMutatingId(id);
      try {
        await deletePolicyRule(id);
        if (mountedRef.current) {
          setPolicyRules((prev) => prev.filter((r) => r.id !== id));
        }
        markConfigurationDraft();
        void refreshHealth();
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [refreshHealth, markConfigurationDraft]
  );

  const setActive = useCallback(
    async (id: number, active: boolean) => {
      setMutatingId(id);
      try {
        const updated = active ? await activatePolicyRule(id) : await deactivatePolicyRule(id);
        if (mountedRef.current) {
          setPolicyRules((prev) => sortPolicyRules(prev.map((r) => (r.id === id ? updated : r))));
        }
        markConfigurationDraft();
        void refreshHealth();
        return updated;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [refreshHealth, markConfigurationDraft]
  );

  return { policyRules, loading, mutatingId, error, refresh, create, update, remove, setActive };
}
