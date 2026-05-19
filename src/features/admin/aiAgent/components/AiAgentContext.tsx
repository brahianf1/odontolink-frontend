import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';
import {
  getConfiguration,
  getGovernancePolicy,
  getHealth,
} from '../../../../services/api/aiAgentService';
import type {
  AiAgentConfigurationResponseDTO,
  AiAgentHealthResponseDTO,
  AiAgentLifecycle,
  AiGovernancePolicyResponseDTO,
} from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';

export type AiAgentTabId =
  | 'dashboard'
  | 'configuration'
  | 'policy-rules'
  | 'provider-guardrails'
  | 'emergency-keywords'
  | 'knowledge-base'
  | 'governance'
  | 'history';

interface AiAgentSnackbarState {
  open: boolean;
  severity: AlertColor;
  message: string;
}

interface AiAgentContextValue {
  notify: (message: string, severity?: AlertColor) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  notifyWarning: (message: string) => void;
  notifyInfo: (message: string) => void;
  registerDirty: (tab: AiAgentTabId, dirty: boolean) => void;
  isTabDirty: (tab: AiAgentTabId) => boolean;
  anyDirty: () => boolean;

  configuration: AiAgentConfigurationResponseDTO | null;
  configurationLoading: boolean;
  configurationError: string | null;
  isUnconfigured: boolean;
  lifecycle: AiAgentLifecycle | null;
  refreshConfiguration: () => Promise<void>;
  setConfiguration: (config: AiAgentConfigurationResponseDTO | null) => void;
  /**
   * Marca el lifecycle local como DRAFT sin pegarle al backend. Usar después
   * de mutaciones que el backend confirma que revierten el agente (toggle de
   * PolicyRule, attachment de ProviderGuardrail, alta/baja de KB, etc.). Es
   * 0-latency y evita el "Verificando…" repetido que veríamos si re-fetchearamos.
   */
  markConfigurationDraft: () => void;

  governance: AiGovernancePolicyResponseDTO | null;
  governanceLoading: boolean;
  governanceError: string | null;
  refreshGovernance: () => Promise<void>;
  setGovernance: (policy: AiGovernancePolicyResponseDTO) => void;

  health: AiAgentHealthResponseDTO | null;
  healthLoading: boolean;
  healthError: string | null;
  refreshHealth: () => Promise<void>;
}

const AiAgentContext = createContext<AiAgentContextValue | null>(null);

interface AiAgentProviderProps {
  children: ReactNode;
}

export function AiAgentProvider({ children }: AiAgentProviderProps) {
  const [snackbar, setSnackbar] = useState<AiAgentSnackbarState>({
    open: false,
    severity: 'info',
    message: '',
  });
  const dirtyTabsRef = useRef<Set<AiAgentTabId>>(new Set());
  const [dirtyVersion, setDirtyVersion] = useState(0);

  const [configuration, setConfigurationState] =
    useState<AiAgentConfigurationResponseDTO | null>(null);
  const [configurationLoading, setConfigurationLoading] = useState(true);
  const [configurationError, setConfigurationError] = useState<string | null>(null);
  const [isUnconfigured, setIsUnconfigured] = useState(false);

  const [governance, setGovernanceState] = useState<AiGovernancePolicyResponseDTO | null>(null);
  const [governanceLoading, setGovernanceLoading] = useState(true);
  const [governanceError, setGovernanceError] = useState<string | null>(null);

  const [health, setHealthState] = useState<AiAgentHealthResponseDTO | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const notify = useCallback((message: string, severity: AlertColor = 'info') => {
    setSnackbar({ open: true, severity, message });
  }, []);

  const notifySuccess = useCallback((message: string) => notify(message, 'success'), [notify]);
  const notifyError = useCallback((message: string) => notify(message, 'error'), [notify]);
  const notifyWarning = useCallback((message: string) => notify(message, 'warning'), [notify]);
  const notifyInfo = useCallback((message: string) => notify(message, 'info'), [notify]);

  const registerDirty = useCallback((tab: AiAgentTabId, dirty: boolean) => {
    const wasDirty = dirtyTabsRef.current.has(tab);
    if (dirty) {
      dirtyTabsRef.current.add(tab);
    } else {
      dirtyTabsRef.current.delete(tab);
    }
    if (wasDirty !== dirty) {
      setDirtyVersion((v) => v + 1);
    }
  }, []);

  const isTabDirty = useCallback((tab: AiAgentTabId) => dirtyTabsRef.current.has(tab), []);
  const anyDirty = useCallback(() => dirtyTabsRef.current.size > 0, []);

  useEffect(() => {
    if (dirtyTabsRef.current.size === 0) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [dirtyVersion]);

  const setConfiguration = useCallback((config: AiAgentConfigurationResponseDTO | null) => {
    setConfigurationState(config);
    setIsUnconfigured(config === null);
  }, []);

  const markConfigurationDraft = useCallback(() => {
    setConfigurationState((prev) => {
      if (!prev || prev.lifecycle !== 'PUBLISHED') return prev;
      return { ...prev, lifecycle: 'DRAFT' };
    });
  }, []);

  const refreshConfiguration = useCallback(async () => {
    setConfigurationLoading(true);
    setConfigurationError(null);
    try {
      const data = await getConfiguration();
      if (!mountedRef.current) return;
      setConfiguration(data);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo cargar la configuración.');
      if (!mountedRef.current) return;
      setConfigurationError(mapped.message);
      setConfiguration(null);
    } finally {
      if (mountedRef.current) setConfigurationLoading(false);
    }
  }, [setConfiguration]);

  const setGovernance = useCallback((policy: AiGovernancePolicyResponseDTO) => {
    setGovernanceState(policy);
  }, []);

  const refreshGovernance = useCallback(async () => {
    setGovernanceLoading(true);
    setGovernanceError(null);
    try {
      const data = await getGovernancePolicy();
      if (!mountedRef.current) return;
      setGovernanceState(data);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo cargar la política de gobernanza.');
      if (!mountedRef.current) return;
      setGovernanceError(mapped.message);
    } finally {
      if (mountedRef.current) setGovernanceLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshConfiguration();
    void refreshGovernance();
  }, [refreshConfiguration, refreshGovernance]);

  // Coalescing: si ya hay un refresh en vuelo, reutilizamos su Promise en
  // lugar de disparar un segundo fetch concurrente. El admin puede
  // disparar varios refreshes encadenados (botón manual + mutación que
  // también refresca, o múltiples mutaciones rápidas) y todos comparten
  // el mismo round-trip.
  const healthInFlightRef = useRef<Promise<void> | null>(null);

  const refreshHealth = useCallback((): Promise<void> => {
    if (configuration === null) {
      setHealthState(null);
      setHealthError(null);
      return Promise.resolve();
    }
    if (healthInFlightRef.current) return healthInFlightRef.current;
    setHealthLoading(true);
    setHealthError(null);
    const promise = (async () => {
      try {
        const data = await getHealth();
        if (!mountedRef.current) return;
        setHealthState(data);
      } catch (err) {
        const mapped = mapAiAgentError(err, 'No se pudo cargar el estado de salud.');
        if (!mountedRef.current) return;
        if (mapped.isNotConfigured) {
          setHealthState(null);
        } else {
          setHealthError(mapped.message);
        }
      } finally {
        healthInFlightRef.current = null;
        if (mountedRef.current) setHealthLoading(false);
      }
    })();
    healthInFlightRef.current = promise;
    return promise;
  }, [configuration]);

  // Bootstrap: refresh health al MONTAR (cuando la config carga por primera
  // vez). Después de eso, las mutaciones deciden explícitamente cuándo
  // refrescar health. Sin esto, cualquier mutación local de configuration
  // (markConfigurationDraft, save, publish, revert) dispararía refreshHealth
  // en cascada por dependencia, anulando la estrategia de triggers reducidos.
  const healthBootstrappedRef = useRef(false);
  useEffect(() => {
    if (configuration && !healthBootstrappedRef.current) {
      healthBootstrappedRef.current = true;
      void refreshHealth();
    }
  }, [configuration, refreshHealth]);

  const handleClose = (_event: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const lifecycle: AiAgentLifecycle | null = configuration
    ? configuration.lifecycle
    : isUnconfigured
      ? 'UNCONFIGURED'
      : null;

  const value = useMemo<AiAgentContextValue>(
    () => ({
      notify,
      notifySuccess,
      notifyError,
      notifyWarning,
      notifyInfo,
      registerDirty,
      isTabDirty,
      anyDirty,
      configuration,
      configurationLoading,
      configurationError,
      isUnconfigured,
      lifecycle,
      refreshConfiguration,
      setConfiguration,
      markConfigurationDraft,
      governance,
      governanceLoading,
      governanceError,
      refreshGovernance,
      setGovernance,
      health,
      healthLoading,
      healthError,
      refreshHealth,
    }),
    [
      notify,
      notifySuccess,
      notifyError,
      notifyWarning,
      notifyInfo,
      registerDirty,
      isTabDirty,
      anyDirty,
      configuration,
      configurationLoading,
      configurationError,
      isUnconfigured,
      lifecycle,
      refreshConfiguration,
      setConfiguration,
      markConfigurationDraft,
      governance,
      governanceLoading,
      governanceError,
      refreshGovernance,
      setGovernance,
      health,
      healthLoading,
      healthError,
      refreshHealth,
    ]
  );

  return (
    <AiAgentContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AiAgentContext.Provider>
  );
}

export function useAiAgentContext(): AiAgentContextValue {
  const ctx = useContext(AiAgentContext);
  if (!ctx) {
    throw new Error('useAiAgentContext must be used within AiAgentProvider');
  }
  return ctx;
}
