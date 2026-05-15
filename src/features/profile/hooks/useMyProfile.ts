import { useCallback, useEffect, useState } from 'react';
import { getMyProfile } from '../../../services/api/profileService';
import type { MyProfileDTO } from '../../../types/profile.types';
import { getErrorMessage } from '../utils/apiErrors';

interface UseMyProfileResult {
  profile: MyProfileDTO | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<MyProfileDTO | null>;
  setProfile: (profile: MyProfileDTO) => void;
}

export function useMyProfile(): UseMyProfileResult {
  const [profile, setProfile] = useState<MyProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProfile();
      setProfile(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar tu perfil.'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, loading, error, refresh: load, setProfile };
}
