import apiClient from './apiClient';
import type {
  ApiMode,
  ApiTier,
  CreateCustomThemeRequest,
  CustomThemeDetailDTO,
  CustomThemeSummaryDTO,
  SiteAppearanceResponseDTO,
  UpdateCustomThemeRequest,
  UpdateSiteAppearanceRequest,
} from '../../features/admin/appearance/types/appearance';

const PUBLIC_BASE = '/api/site-config';
const ADMIN_BASE = '/api/admin/site-config';

/** Construct the If-Match header value the backend expects. */
const ifMatchHeader = (version: number) => ({ 'If-Match': `"v${version}"` });

// ---- Mode/Tier converters (UPPER ↔ lowercase) -----------------------------

export type Mode = 'light' | 'dark' | 'system';
export type Tier = 'official' | 'experimental';

export const modeToApi = (mode: Mode): ApiMode =>
  mode === 'dark' ? 'DARK' : mode === 'system' ? 'SYSTEM' : 'LIGHT';

export const modeFromApi = (mode: ApiMode): Mode =>
  mode === 'DARK' ? 'dark' : mode === 'SYSTEM' ? 'system' : 'light';

export const tierToApi = (tier: Tier): ApiTier =>
  tier === 'experimental' ? 'EXPERIMENTAL' : 'OFFICIAL';

export const tierFromApi = (tier: ApiTier): Tier =>
  tier === 'EXPERIMENTAL' ? 'experimental' : 'official';

// ---- Endpoints ------------------------------------------------------------

/**
 * Public — fetch the institutional site appearance config. Triggers backend
 * bootstrap on first call if the singleton row does not exist. Browser-cached
 * for 60s by default via Cache-Control.
 */
export const getSiteAppearance = async (): Promise<SiteAppearanceResponseDTO> => {
  const response = await apiClient.get<SiteAppearanceResponseDTO>(`${PUBLIC_BASE}/appearance`);
  return response.data;
};

/**
 * Admin — overwrite the site appearance config. Sends If-Match with the
 * caller's current known version; the backend rejects with VERSION_CONFLICT
 * (409) if the singleton has been updated since.
 */
export const updateSiteAppearance = async (
  payload: UpdateSiteAppearanceRequest,
  version: number,
): Promise<SiteAppearanceResponseDTO> => {
  const response = await apiClient.put<SiteAppearanceResponseDTO>(
    `${ADMIN_BASE}/appearance`,
    payload,
    { headers: ifMatchHeader(version) },
  );
  return response.data;
};

/**
 * Admin — list all custom themes (sourceCss excluded). Cache-Control: no-store.
 */
export const listCustomThemes = async (): Promise<CustomThemeSummaryDTO[]> => {
  const response = await apiClient.get<CustomThemeSummaryDTO[]>(`${ADMIN_BASE}/custom-themes`);
  return response.data;
};

/** Admin — fetch a single custom theme by id, including sourceCss. */
export const getCustomTheme = async (id: number): Promise<CustomThemeDetailDTO> => {
  const response = await apiClient.get<CustomThemeDetailDTO>(`${ADMIN_BASE}/custom-themes/${id}`);
  return response.data;
};

/** Admin — create a new custom theme from pasted/uploaded CSS. */
export const createCustomTheme = async (
  payload: CreateCustomThemeRequest,
): Promise<CustomThemeDetailDTO> => {
  const response = await apiClient.post<CustomThemeDetailDTO>(
    `${ADMIN_BASE}/custom-themes`,
    payload,
  );
  return response.data;
};

/** Admin — overwrite a custom theme. Requires the caller's current version. */
export const updateCustomTheme = async (
  id: number,
  payload: UpdateCustomThemeRequest,
  version: number,
): Promise<CustomThemeDetailDTO> => {
  const response = await apiClient.put<CustomThemeDetailDTO>(
    `${ADMIN_BASE}/custom-themes/${id}`,
    payload,
    { headers: ifMatchHeader(version) },
  );
  return response.data;
};

/**
 * Admin — soft-delete a custom theme. Idempotent; the backend does not
 * require If-Match. Returns 204 on success; rejected with THEME_IN_USE when
 * the theme is the active site appearance.
 */
export const deleteCustomTheme = async (id: number): Promise<void> => {
  await apiClient.delete(`${ADMIN_BASE}/custom-themes/${id}`);
};
