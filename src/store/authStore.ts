import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JwtResponseDTO } from '../types/auth.types';

interface AuthState {
  user: JwtResponseDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (authData: JwtResponseDTO) => void;
  logout: () => void;
  updateUser: (userData: Partial<JwtResponseDTO>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (authData: JwtResponseDTO) => {
        set({
          user: authData,
          token: authData.token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      updateUser: (userData: Partial<JwtResponseDTO>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
