import { useEffect } from 'react';
import { getMyProfile } from '../../../services/api/profileService';
import { useAuthStore } from '../../../store/authStore';

export function useProfileSync(): void {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getMyProfile()
      .then((data) => {
        if (cancelled) return;
        updateUser({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          profilePictureUrl: data.profilePictureUrl ?? null,
        });
      })
      .catch(() => {
        // 401 → apiClient interceptor handles logout. Other errors stay silent.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, updateUser]);
}
