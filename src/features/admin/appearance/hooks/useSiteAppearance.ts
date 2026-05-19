import { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../../../store/themeStore';

/**
 * Module-level guard so multiple consumers of `useSiteAppearance` across the
 * tree (e.g. App.tsx bootstrap + AdminAppearancePage) trigger at most one
 * initial fetch per app session.
 */
let bootstrapPromise: Promise<void> | null = null;
import {
  getSiteAppearance,
  modeToApi,
  type Mode,
  updateSiteAppearance,
} from '../../../../services/api/appearanceApi';
import type {
  ApiTier,
  SiteAppearanceResponseDTO,
} from '../types/appearance';
import {
  summarizeAppearanceError,
  type AppearanceErrorSummary,
} from '../utils/appearanceErrors';

export interface ApplyInstitutionalPayload {
  themeVariantId: string;
  fontPairId: string;
  /** Mode policy for new visitors (existing users keep their LS preference). */
  defaultMode: Mode;
  allowUserOverride: boolean;
}

interface UseSiteAppearanceReturn {
  siteConfig: SiteAppearanceResponseDTO | null;
  loaded: boolean;
  loading: boolean;
  applying: boolean;
  error: AppearanceErrorSummary | null;
  refresh: () => Promise<void>;
  apply: (payload: ApplyInstitutionalPayload) => Promise<SiteAppearanceResponseDTO>;
}

/** Tier constant unused here but re-exported by index for callers wanting it. */
export type { ApiTier };

/**
 * Hook that owns the lifecycle of the institutional site appearance config.
 * Bootstraps with a single fetch on mount, exposes a manual `refresh`, and
 * a writable `apply` that PUTs with the current version as If-Match.
 *
 * Designed to be called once at the root of the admin appearance page; the
 * resulting state is shared via the themeStore so every other component
 * (including `useAppTheme`) sees the latest value automatically.
 */
export const useSiteAppearance = (): UseSiteAppearanceReturn => {
  const siteConfig = useThemeStore((s) => s.siteConfig);
  const loaded = useThemeStore((s) => s.siteConfigLoaded);
  const setSiteConfig = useThemeStore((s) => s.setSiteConfig);

  const [loading, setLoading] = useState(!loaded);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<AppearanceErrorSummary | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSiteAppearance();
      if (isMounted.current) setSiteConfig(data);
    } catch (err) {
      if (isMounted.current) setError(summarizeAppearanceError(err as never));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [setSiteConfig]);

  // App-level bootstrap: every consumer awaits the same promise the first
  // time the store has not been hydrated yet. Subsequent consumers see
  // `loaded === true` and skip the fetch entirely.
  useEffect(() => {
    if (loaded) return;
    if (!bootstrapPromise) {
      bootstrapPromise = refresh().finally(() => {
        bootstrapPromise = null;
      });
    }
    void bootstrapPromise;
  }, [loaded, refresh]);

  const apply = useCallback(
    async (payload: ApplyInstitutionalPayload) => {
      if (!siteConfig) {
        throw new Error('Site config has not loaded yet.');
      }
      setApplying(true);
      setError(null);
      try {
        const updated = await updateSiteAppearance(
          {
            themeVariantId: payload.themeVariantId,
            fontPairId: payload.fontPairId,
            defaultMode: modeToApi(payload.defaultMode),
            allowUserOverride: payload.allowUserOverride,
          },
          siteConfig.version,
        );
        if (isMounted.current) setSiteConfig(updated);
        return updated;
      } catch (err) {
        const summary = summarizeAppearanceError(err as never);
        if (isMounted.current) setError(summary);
        throw summary;
      } finally {
        if (isMounted.current) setApplying(false);
      }
    },
    [siteConfig, setSiteConfig],
  );

  return {
    siteConfig,
    loaded,
    loading,
    applying,
    error,
    refresh,
    apply,
  };
};
