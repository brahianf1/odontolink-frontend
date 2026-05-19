import { useState, type MouseEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import { useSiteAppearance } from '../hooks/useSiteAppearance';
import { useThemeStore } from '../../../../store/themeStore';
import {
  resolveVariant,
  customThemeListToVariants,
} from '../../../../theme/variants';
import { getFontPair } from '../../../../theme/fonts';
import {
  modeFromApi,
  type Mode,
} from '../../../../services/api/appearanceApi';
import {
  withViewTransition,
  originFromEvent,
} from '../../../../theme/viewTransition';
import type { AppearanceErrorSummary } from '../utils/appearanceErrors';

const formatRelative = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '';
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'hace instantes';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
};

/**
 * Sticky bottom bar shown in /admin/appearance. Compares the admin's local
 * preview (themeStore mode/variant/fontPair) with the institutional config
 * (siteConfig) and exposes the action to PUT the local preview as the new
 * institutional default.
 */
export const SiteDefaultBar = () => {
  const theme = useTheme();
  const { siteConfig, applying, apply } = useSiteAppearance();
  const localVariant = useThemeStore((s) => s.themeVariant);
  const localFontPair = useThemeStore((s) => s.fontPair);
  const localMode = useThemeStore((s) => s.mode);
  const customThemes = useThemeStore((s) => s.customThemes);

  const [snackOpen, setSnackOpen] = useState(false);
  const [error, setError] = useState<AppearanceErrorSummary | null>(null);

  const runtimeCustoms = customThemeListToVariants(customThemes);
  const localVariantObj = resolveVariant(localVariant, runtimeCustoms);
  const localFontObj = getFontPair(localFontPair);

  const instVariantObj = siteConfig
    ? resolveVariant(siteConfig.themeVariantId, runtimeCustoms)
    : null;
  const instFontObj = siteConfig ? getFontPair(siteConfig.fontPairId) : null;
  const instModeLower: Mode | null = siteConfig ? modeFromApi(siteConfig.defaultMode) : null;

  const inSync =
    siteConfig != null &&
    siteConfig.themeVariantId === localVariant &&
    siteConfig.fontPairId === localFontPair &&
    instModeLower === localMode;

  const handleApply = async (event: MouseEvent<HTMLButtonElement>) => {
    setError(null);
    try {
      await new Promise<void>((resolve, reject) => {
        withViewTransition(() => {
          apply({
            themeVariantId: localVariant,
            fontPairId: localFontPair,
            defaultMode: localMode,
            allowUserOverride: siteConfig?.allowUserOverride ?? false,
          })
            .then(() => resolve())
            .catch(reject);
        }, originFromEvent(event));
      });
      setSnackOpen(true);
    } catch (err) {
      setError(err as AppearanceErrorSummary);
    }
  };

  if (!siteConfig) return null;

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          mx: { xs: -2, sm: -3, md: -4 },
          mt: 3,
          backgroundColor: theme.palette.surfaces.containerHigh,
          borderTop: `1px solid ${theme.palette.outlineVariant}`,
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          zIndex: 5,
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 3 }}
            divider={
              <Box
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  width: '1px',
                  height: 28,
                  backgroundColor: theme.palette.outlineVariant,
                }}
              />
            }
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box>
              <Typography variant="labelSmall" color="text.secondary">
                TU VISTA (local)
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="bodyMedium" sx={{ fontWeight: 600 }}>
                  {localVariantObj.name}
                </Typography>
                <Typography variant="bodySmall" color="text.secondary">
                  · {localFontObj.name} · {localMode}
                </Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="labelSmall" color="text.secondary">
                INSTITUCIONAL
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="bodyMedium" sx={{ fontWeight: 600 }}>
                  {instVariantObj?.name ?? siteConfig.themeVariantId}
                </Typography>
                <Typography variant="bodySmall" color="text.secondary">
                  · {instFontObj?.name ?? siteConfig.fontPairId} · {instModeLower}
                </Typography>
                <Typography variant="bodySmall" sx={{ color: 'text.secondary' }}>
                  · v{siteConfig.version} · {formatRelative(siteConfig.updatedAt)}
                </Typography>
              </Stack>
            </Box>
            {inSync && (
              <Chip
                label="En sincronía"
                size="small"
                sx={{
                  backgroundColor: theme.palette.tertiary.container,
                  color: theme.palette.tertiary.onContainer,
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>

          <Button
            onClick={handleApply}
            variant="contained"
            color="primary"
            startIcon={applying ? <CircularProgress size={16} color="inherit" /> : <PublishIcon />}
            disabled={applying || inSync}
            sx={{ flexShrink: 0 }}
          >
            {applying ? 'Aplicando…' : 'Aplicar como institucional'}
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Theme institucional actualizado. Todos los usuarios lo verán en su próxima carga."
      />
    </>
  );
};

export default SiteDefaultBar;
