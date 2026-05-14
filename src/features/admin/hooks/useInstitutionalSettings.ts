import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getInstitutionalSettings,
  updateInstitutionalSettings,
} from '../../../services/api/adminService';
import type {
  InstitutionalSettingsResponseDTO,
  UpdateInstitutionalSettingsRequestDTO,
} from '../../../types/admin.types';

interface UseInstitutionalSettingsState {
  settings: InstitutionalSettingsResponseDTO | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  reload: () => Promise<void>;
  save: (
    payload: UpdateInstitutionalSettingsRequestDTO
  ) => Promise<InstitutionalSettingsResponseDTO>;
}

export const useInstitutionalSettings = (): UseInstitutionalSettingsState => {
  const [settings, setSettings] = useState<InstitutionalSettingsResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstitutionalSettings();
      if (isMounted.current) setSettings(data);
    } catch (err) {
      if (isMounted.current) {
        const message =
          (err as { message?: string })?.message ||
          'Error al cargar la configuración institucional';
        setError(message);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (payload: UpdateInstitutionalSettingsRequestDTO) => {
      setSaving(true);
      try {
        const updated = await updateInstitutionalSettings(payload);
        if (isMounted.current) setSettings(updated);
        return updated;
      } finally {
        if (isMounted.current) setSaving(false);
      }
    },
    []
  );

  return {
    settings,
    loading,
    saving,
    error,
    reload: load,
    save,
  };
};
