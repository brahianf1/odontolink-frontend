import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScheduleDensity } from '../types/schedule.types';

interface ScheduleDensityState {
  density: ScheduleDensity;
  setDensity: (density: ScheduleDensity) => void;
}

/**
 * Persists the practitioner's preferred calendar density across sessions,
 * mirroring the existing themeStore pattern. Affects only the planning view
 * (Schedule-X grid); the daily agenda is unaffected because it has no
 * vertical grid to scale.
 */
export const useScheduleDensityStore = create<ScheduleDensityState>()(
  persist(
    (set) => ({
      density: 'comfortable',
      setDensity: (density) => set({ density }),
    }),
    { name: 'schedule-density' }
  )
);
