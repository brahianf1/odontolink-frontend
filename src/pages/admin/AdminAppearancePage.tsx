import { useMemo, useState, type MouseEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { useThemeStore, type ThemeMode } from '../../store/themeStore';
import {
  DEFAULT_VARIANT_ID,
  officialVariants,
  experimentalVariants,
} from '../../theme/variants';
import {
  DEFAULT_FONT_PAIR_ID,
  fontPairList,
} from '../../theme/fonts';
import { originFromEvent, withViewTransition } from '../../theme/viewTransition';
import ThemeVariantCard from '../../features/admin/appearance/components/ThemeVariantCard';
import FontPairCard from '../../features/admin/appearance/components/FontPairCard';
import ModeSelector from '../../features/admin/appearance/components/ModeSelector';
import AppearancePreview from '../../features/admin/appearance/components/AppearancePreview';
import CustomThemesSection from '../../features/admin/appearance/components/CustomThemesSection';
import SiteDefaultBar from '../../features/admin/appearance/components/SiteDefaultBar';
import { useSiteAppearance } from '../../features/admin/appearance/hooks/useSiteAppearance';
import { modeFromApi } from '../../services/api/appearanceApi';

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography variant="titleLarge" sx={{ fontWeight: 600, mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="bodyMedium" color="text.secondary">
      {subtitle}
    </Typography>
  </Box>
);

export default function AdminAppearancePage() {
  const theme = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const themeVariant = useThemeStore((s) => s.themeVariant);
  const fontPair = useThemeStore((s) => s.fontPair);
  const setMode = useThemeStore((s) => s.setMode);
  const setThemeVariant = useThemeStore((s) => s.setThemeVariant);
  const setFontPair = useThemeStore((s) => s.setFontPair);

  const { siteConfig, loaded, loading, error: siteError } = useSiteAppearance();

  const [showExperimental, setShowExperimental] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  /** Mode used to render the swatches inside each ThemeVariantCard. */
  const effectiveMode = theme.palette.mode;

  const visibleVariants = useMemo(
    () => (showExperimental ? [...officialVariants, ...experimentalVariants] : officialVariants),
    [showExperimental],
  );

  const handleModeChange = (next: ThemeMode, event: MouseEvent<HTMLButtonElement>) => {
    if (next === mode) return;
    withViewTransition(() => setMode(next), originFromEvent(event));
  };

  const handlePickVariant = (variantId: string, defaultFontPairId: string, event: MouseEvent<HTMLButtonElement>) => {
    if (themeVariant === variantId) return;
    withViewTransition(() => {
      setThemeVariant(variantId);
      setFontPair(defaultFontPairId);
    }, originFromEvent(event));
  };

  const handleSyncToInstitutional = (event: MouseEvent<HTMLButtonElement>) => {
    if (!siteConfig) return;
    const targetMode = modeFromApi(siteConfig.defaultMode);
    withViewTransition(() => {
      setMode(targetMode);
      setThemeVariant(siteConfig.themeVariantId);
      setFontPair(siteConfig.fontPairId);
    }, originFromEvent(event));
    setSnackMessage('Vista local alineada con el tema institucional.');
    setSnackOpen(true);
  };

  const handleResetToDefaults = (event: MouseEvent<HTMLButtonElement>) => {
    withViewTransition(() => {
      setMode('light');
      setThemeVariant(DEFAULT_VARIANT_ID);
      setFontPair(DEFAULT_FONT_PAIR_ID);
    }, originFromEvent(event));
    setSnackMessage('Vista local restablecida a los valores por defecto del build.');
    setSnackOpen(true);
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Apariencia
        </Typography>
        <Typography variant="bodyMedium" color="text.secondary">
          Personaliza el tema institucional. Tus clicks generan una <strong>vista local</strong>{' '}
          (solo vos la ves); cuando estés conforme, aplicalo como tema institucional desde la
          barra inferior y todos los usuarios lo verán en su próxima carga.
        </Typography>
      </Box>

      {loading && !loaded && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Cargando configuración institucional…
        </Alert>
      )}

      {siteError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No pude leer la configuración institucional del backend: {siteError.message}. Las
          ediciones locales siguen funcionando, pero no podés aplicar como institucional hasta
          que el servidor responda.
        </Alert>
      )}

      {/* MODE */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            title="Modo de color"
            subtitle="Per-usuario, por accesibilidad. La opción Sistema sigue la preferencia del SO. El default que aplicás como institucional es el que ven los visitantes nuevos."
          />
          <ModeSelector value={mode} onChange={handleModeChange} />
        </CardContent>
      </Card>

      {/* COLOR THEME — built-ins */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
            justifyContent="space-between"
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="titleLarge" sx={{ fontWeight: 600, mb: 0.5 }}>
                Tema de color
              </Typography>
              <Typography variant="bodyMedium" color="text.secondary">
                {visibleVariants.length} variantes built-in. Click para previsualizar localmente.
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={showExperimental}
                  onChange={(e) => setShowExperimental(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="bodyMedium">
                  Mostrar temas experimentales
                </Typography>
              }
            />
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fill, minmax(220px, 1fr))',
                lg: 'repeat(auto-fill, minmax(240px, 1fr))',
              },
              gap: 2,
            }}
          >
            {visibleVariants.map((variant) => (
              <ThemeVariantCard
                key={variant.id}
                variant={variant}
                mode={effectiveMode}
                selected={themeVariant === variant.id}
                onSelect={(event) => handlePickVariant(variant.id, variant.defaultFontPair, event)}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* CUSTOM THEMES — server-backed */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <CustomThemesSection
            selectedVariantId={themeVariant}
            effectiveMode={effectiveMode}
            onSelect={(variant, event) =>
              handlePickVariant(variant.id, variant.defaultFontPair, event)
            }
          />
        </CardContent>
      </Card>

      {/* FONT PAIR */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            title="Tipografía"
            subtitle="Combinaciones modernas de fuentes para display y cuerpo. Independiente del tema de color."
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: 2,
            }}
          >
            {fontPairList.map((pair) => (
              <FontPairCard
                key={pair.id}
                pair={pair}
                selected={fontPair === pair.id}
                onSelect={(event) => {
                  if (fontPair === pair.id) return;
                  withViewTransition(() => setFontPair(pair.id), originFromEvent(event));
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* PREVIEW */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            title="Vista previa en vivo"
            subtitle="Componentes reales con los ajustes locales actuales. Cambia mientras pruebas."
          />
          <AppearancePreview />
        </CardContent>
      </Card>

      <Divider sx={{ mb: 2 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 1 }}
      >
        <Stack spacing={0.25}>
          <Typography variant="bodyMedium">
            Tu vista es local (solo este navegador). El tema institucional se cambia desde
            la barra inferior.
          </Typography>
          <Typography variant="bodySmall" color="text.secondary">
            El default global de fábrica (lo que ven usuarios sin nada en localStorage) sigue
            siendo {' '}
            <Box
              component="span"
              sx={{
                fontFamily: theme.typography.fontFamilyMono,
                fontSize: '0.85em',
              }}
            >
              VITE_THEME_VARIANT
            </Box>{' '}
            del build.
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            onClick={handleSyncToInstitutional}
            startIcon={<SyncIcon />}
            variant="outlined"
            color="primary"
            disabled={!siteConfig}
          >
            Sincronizar con institucional
          </Button>
          <Button
            onClick={handleResetToDefaults}
            variant="text"
            color="primary"
          >
            Restablecer al default del build
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackMessage}
      />

      <SiteDefaultBar />
    </Box>
  );
}
