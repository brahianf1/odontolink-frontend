import { useMemo, useState, type MouseEvent } from 'react';
import {
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
import RestoreIcon from '@mui/icons-material/Restore';
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

  const [showExperimental, setShowExperimental] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

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

  const handleResetToDefaults = (event: MouseEvent<HTMLButtonElement>) => {
    withViewTransition(() => {
      setMode('light');
      setThemeVariant(DEFAULT_VARIANT_ID);
      setFontPair(DEFAULT_FONT_PAIR_ID);
    }, originFromEvent(event));
    setSnackOpen(true);
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Apariencia
        </Typography>
        <Typography variant="bodyMedium" color="text.secondary">
          Personaliza el tema de color, la tipografía y el modo claro/oscuro. Los
          cambios se guardan en este navegador y se aplican al instante.
        </Typography>
      </Box>

      {/* MODE */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            title="Modo de color"
            subtitle="Elegí cómo se ve la app en este dispositivo. La opción Sistema sigue la preferencia del SO."
          />
          <ModeSelector value={mode} onChange={handleModeChange} />
        </CardContent>
      </Card>

      {/* COLOR THEME */}
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
                {visibleVariants.length} variantes disponibles. Cada una está clasificada
                por su afinidad con el contexto institucional.
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
                onSelect={(event) => {
                  if (themeVariant === variant.id) return;
                  withViewTransition(() => {
                    setThemeVariant(variant.id);
                    // When picking a theme, also align the font pair to the theme's preferred default.
                    setFontPair(variant.defaultFontPair);
                  }, originFromEvent(event));
                }}
              />
            ))}
          </Box>
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
            subtitle="Componentes reales con los ajustes actuales. Cambia mientras pruebas."
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
      >
        <Stack spacing={0.25}>
          <Typography variant="bodyMedium">
            Las preferencias se guardan localmente en este navegador.
          </Typography>
          <Typography variant="bodySmall" color="text.secondary">
            Para definir un default global se sigue usando la variable de entorno{' '}
            <Box
              component="span"
              sx={{
                fontFamily: theme.typography.fontFamilyMono,
                fontSize: '0.85em',
              }}
            >
              VITE_THEME_VARIANT
            </Box>{' '}
            en el build.
          </Typography>
        </Stack>
        <Button
          onClick={handleResetToDefaults}
          startIcon={<RestoreIcon />}
          variant="outlined"
          color="primary"
        >
          Restablecer
        </Button>
      </Stack>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Apariencia restablecida a los valores por defecto."
      />
    </Box>
  );
}
