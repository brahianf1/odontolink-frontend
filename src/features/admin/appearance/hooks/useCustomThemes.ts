import { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../../../store/themeStore';
import {
  createCustomTheme,
  deleteCustomTheme,
  getCustomTheme,
  listCustomThemes,
  tierToApi,
  type Tier,
} from '../../../../services/api/appearanceApi';
import type {
  CreateCustomThemeRequest,
  CustomThemeDetailDTO,
  CustomThemeSummaryDTO,
} from '../types/appearance';
import type { ThemeVariantColors } from '../../../../theme/variants/_types';
import {
  summarizeAppearanceError,
  type AppearanceErrorSummary,
} from '../utils/appearanceErrors';

export interface CreateCustomThemeInput {
  name: string;
  description: string;
  mood: string;
  fitScore: 1 | 2 | 3 | 4 | 5;
  tier: Tier;
  defaultFontPair: string;
  light: ThemeVariantColors;
  dark: ThemeVariantColors;
  sourceCss: string;
}

interface UseCustomThemesReturn {
  customThemes: CustomThemeSummaryDTO[];
  loading: boolean;
  mutating: boolean;
  error: AppearanceErrorSummary | null;
  refresh: () => Promise<void>;
  create: (input: CreateCustomThemeInput) => Promise<CustomThemeDetailDTO>;
  remove: (id: number) => Promise<void>;
  fetchDetail: (id: number) => Promise<CustomThemeDetailDTO>;
}

const toCreatePayload = (input: CreateCustomThemeInput): CreateCustomThemeRequest => ({
  name: input.name,
  description: input.description,
  mood: input.mood,
  fitScore: input.fitScore,
  tier: tierToApi(input.tier),
  defaultFontPair: input.defaultFontPair,
  light: input.light,
  dark: input.dark,
  sourceCss: input.sourceCss,
});

/**
 * Hook owning the admin-only custom themes catalog. Fetches the list on
 * mount, exposes mutations (create / delete), keeps the themeStore in sync.
 *
 * Only mount this hook on routes the admin actually visits — it consumes an
 * authenticated endpoint and should not run for non-admin users.
 */
export const useCustomThemes = (): UseCustomThemesReturn => {
  const customThemes = useThemeStore((s) => s.customThemes);
  const setCustomThemes = useThemeStore((s) => s.setCustomThemes);

  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
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
      const data = await listCustomThemes();
      if (isMounted.current) setCustomThemes(data);
    } catch (err) {
      if (isMounted.current) setError(summarizeAppearanceError(err as never));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [setCustomThemes]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: CreateCustomThemeInput) => {
      setMutating(true);
      setError(null);
      try {
        const created = await createCustomTheme(toCreatePayload(input));
        if (isMounted.current) {
          setCustomThemes([created, ...customThemes]);
        }
        return created;
      } catch (err) {
        const summary = summarizeAppearanceError(err as never);
        if (isMounted.current) setError(summary);
        throw summary;
      } finally {
        if (isMounted.current) setMutating(false);
      }
    },
    [customThemes, setCustomThemes],
  );

  const remove = useCallback(
    async (id: number) => {
      setMutating(true);
      setError(null);
      try {
        await deleteCustomTheme(id);
        if (isMounted.current) {
          setCustomThemes(customThemes.filter((t) => t.id !== id));
        }
      } catch (err) {
        const summary = summarizeAppearanceError(err as never);
        if (isMounted.current) setError(summary);
        throw summary;
      } finally {
        if (isMounted.current) setMutating(false);
      }
    },
    [customThemes, setCustomThemes],
  );

  const fetchDetail = useCallback(async (id: number) => {
    return getCustomTheme(id);
  }, []);

  return {
    customThemes,
    loading,
    mutating,
    error,
    refresh,
    create,
    remove,
    fetchDetail,
  };
};
