import type { ThemeVariantColors } from '../../../../theme/variants/_types';

/**
 * Wire-level enums — exactly what the backend serializes/deserializes.
 * Internal app code converts to/from the existing lowercase shapes used by
 * the themeStore (`light/dark/system`, `official/experimental`).
 */
export type ApiMode = 'LIGHT' | 'DARK' | 'SYSTEM';
export type ApiTier = 'OFFICIAL' | 'EXPERIMENTAL';

/** Public site-config payload — returned by GET /api/site-config/appearance. */
export interface SiteAppearanceResponseDTO {
  themeVariantId: string;
  fontPairId: string;
  defaultMode: ApiMode;
  allowUserOverride: boolean;
  version: number;
  updatedAt: string; // ISO-8601 with Z (UTC)
  /** Omitted from JSON (NON_NULL) when the active variant is built-in. */
  activeCustomTheme?: ActiveCustomThemeDTO;
}

/**
 * Custom theme as embedded in the public GET response (no sourceCss to save
 * bandwidth on anonymous requests).
 */
export interface ActiveCustomThemeDTO {
  id: number;
  slug: string;
  name: string;
  description: string;
  mood: string;
  fitScore: number;
  tier: ApiTier;
  defaultFontPair: string;
  light: ThemeVariantColors;
  dark: ThemeVariantColors;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** Listing item — same as ActiveCustomThemeDTO (also without sourceCss). */
export type CustomThemeSummaryDTO = ActiveCustomThemeDTO;

/** Full detail returned by POST/PUT/GET-by-id — includes sourceCss. */
export interface CustomThemeDetailDTO extends ActiveCustomThemeDTO {
  sourceCss: string;
}

/** Body for PUT /api/admin/site-config/appearance. */
export interface UpdateSiteAppearanceRequest {
  themeVariantId: string;
  fontPairId: string;
  defaultMode: ApiMode;
  allowUserOverride: boolean;
}

/** Body for POST /api/admin/site-config/custom-themes. */
export interface CreateCustomThemeRequest {
  name: string;
  description: string;
  mood: string;
  fitScore: number;
  tier: ApiTier;
  defaultFontPair: string;
  light: ThemeVariantColors;
  dark: ThemeVariantColors;
  sourceCss: string;
}

/** Body for PUT /api/admin/site-config/custom-themes/{id} — same shape. */
export type UpdateCustomThemeRequest = CreateCustomThemeRequest;
