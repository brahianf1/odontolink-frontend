import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OfferBucket } from '../utils/offerStatus';

export type TreatmentsViewMode = 'cards' | 'list';
export type TreatmentsFilter = 'ALL' | OfferBucket;

interface TreatmentsViewState {
  view: TreatmentsViewMode;
  filter: TreatmentsFilter;
  setView: (view: TreatmentsViewMode) => void;
  setFilter: (filter: TreatmentsFilter) => void;
}

const VALID_FILTERS: ReadonlyArray<TreatmentsFilter> = [
  'ALL',
  'ACTIVE',
  'PAUSED',
  'INACTIVE',
  'EXPIRED',
];

const VALID_VIEWS: ReadonlyArray<TreatmentsViewMode> = ['cards', 'list'];

interface PersistedShape {
  state?: { view?: unknown; filter?: unknown };
  version?: number;
}

/**
 * View mode + active filter for the Treatments page, persisted across
 * sessions. The store ships at version 2 because the filter vocabulary
 * changed when we adopted the backend's bucket model (ACTIVE/PAUSED/
 * INACTIVE/EXPIRED). Older values like "BLOCKED" or "FULL" no longer apply
 * — migrate any legacy filter back to ACTIVE so practitioners don't open
 * the page to an empty list.
 */
export const useTreatmentsViewStore = create<TreatmentsViewState>()(
  persist(
    (set) => ({
      view: 'cards',
      filter: 'ACTIVE',
      setView: (view) => set({ view }),
      setFilter: (filter) => set({ filter }),
    }),
    {
      name: 'practitioner-treatments-view',
      version: 2,
      migrate: (persistedState, _version) => {
        const persisted = persistedState as PersistedShape['state'] | undefined;
        const view =
          persisted && VALID_VIEWS.includes(persisted.view as TreatmentsViewMode)
            ? (persisted.view as TreatmentsViewMode)
            : 'cards';
        const filter =
          persisted && VALID_FILTERS.includes(persisted.filter as TreatmentsFilter)
            ? (persisted.filter as TreatmentsFilter)
            : 'ACTIVE';
        return { view, filter } as Partial<TreatmentsViewState>;
      },
    }
  )
);
