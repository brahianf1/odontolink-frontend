import type {
  ActiveCustomThemeDTO,
  CustomThemeSummaryDTO,
} from '../../features/admin/appearance/types/appearance';
import { tierFromApi } from '../../services/api/appearanceApi';
import type { ThemeVariant } from './_types';

/**
 * Convert a custom-theme DTO from the backend into the in-memory ThemeVariant
 * shape used by createAppTheme. The slug becomes the variant id, enums are
 * lowercased, and light/dark token sets are passed through unchanged (their
 * shape already matches ThemeVariantColors).
 */
export const customThemeDtoToVariant = (
  dto: CustomThemeSummaryDTO | ActiveCustomThemeDTO,
): ThemeVariant => ({
  id: dto.slug,
  name: dto.name,
  description: dto.description,
  mood: dto.mood,
  fitScore: Math.min(5, Math.max(1, dto.fitScore)) as ThemeVariant['fitScore'],
  tier: tierFromApi(dto.tier),
  defaultFontPair: dto.defaultFontPair,
  light: dto.light,
  dark: dto.dark,
});

/**
 * Convert the full list of custom-theme summaries fetched by the admin
 * dashboard into ThemeVariant objects. Returns an empty array if no themes
 * exist (typical first-boot state).
 */
export const customThemeListToVariants = (
  list: CustomThemeSummaryDTO[],
): ThemeVariant[] => list.map(customThemeDtoToVariant);
