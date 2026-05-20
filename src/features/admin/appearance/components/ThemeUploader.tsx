import { useMemo, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { parseShadcnCss, type ParsedCssResult } from '../utils/parseShadcnCss';
import {
  detailsToFieldMap,
  type AppearanceErrorSummary,
} from '../utils/appearanceErrors';
import { fontPairList } from '../../../../theme/fonts';
import {
  useCustomThemes,
  type CreateCustomThemeInput,
} from '../hooks/useCustomThemes';
import type { Tier } from '../../../../services/api/appearanceApi';

interface ThemeUploaderProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const Swatch = ({ color, label }: { color: string; label: string }) => (
  <Box
    title={`${label}: ${color}`}
    sx={{
      width: 36,
      height: 36,
      backgroundColor: color,
      border: '1px solid rgba(0,0,0,0.12)',
    }}
  />
);

export const ThemeUploader = ({ open, onClose, onCreated }: ThemeUploaderProps) => {
  const theme = useTheme();
  const { create, mutating } = useCustomThemes();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('');
  const [fitScore, setFitScore] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [tier, setTier] = useState<Tier>('official');
  const [defaultFontPair, setDefaultFontPair] = useState('inter-source-jetbrains');
  const [css, setCss] = useState('');
  const [submitError, setSubmitError] = useState<AppearanceErrorSummary | null>(null);

  const parsed: ParsedCssResult | null = useMemo(() => {
    if (!css.trim()) return null;
    return parseShadcnCss(css);
  }, [css]);

  const canSubmit =
    !mutating &&
    name.trim().length >= 3 &&
    !!parsed?.light &&
    !!parsed?.dark &&
    parsed.errors.length === 0;

  const handleClose = () => {
    if (mutating) return;
    setName('');
    setDescription('');
    setMood('');
    setFitScore(3);
    setTier('official');
    setDefaultFontPair('inter-source-jetbrains');
    setCss('');
    setSubmitError(null);
    onClose();
  };

  const handleFileDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.css')) return;
    const text = await file.text();
    setCss(text);
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCss(text);
  };

  const handleSubmit = async () => {
    if (!parsed?.light || !parsed?.dark) return;
    const payload: CreateCustomThemeInput = {
      name: name.trim(),
      description: description.trim(),
      mood: mood.trim(),
      fitScore,
      tier,
      defaultFontPair,
      light: parsed.light,
      dark: parsed.dark,
      sourceCss: css,
    };
    try {
      setSubmitError(null);
      await create(payload);
      onCreated?.();
      handleClose();
    } catch (err) {
      setSubmitError(err as AppearanceErrorSummary);
    }
  };

  const submitFields = submitError ? detailsToFieldMap(submitError.details) : {};

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { backgroundColor: theme.palette.surfaces.containerLow } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        Subir nuevo theme personalizado
        <IconButton
          aria-label="cerrar"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Nombre"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputProps={{ minLength: 3, maxLength: 120 }}
              helperText={submitFields['name']}
              error={Boolean(submitFields['name'])}
            />
            <TextField
              select
              label="Tier"
              value={tier}
              onChange={(e) => setTier(e.target.value as Tier)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="official">Oficial</MenuItem>
              <MenuItem value="experimental">Experimental</MenuItem>
            </TextField>
          </Stack>

          <TextField
            label="Descripción"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            inputProps={{ maxLength: 500 }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Mood (descripción corta)"
              fullWidth
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. Healthcare clean"
            />
            <TextField
              select
              label="Font pair por defecto"
              value={defaultFontPair}
              onChange={(e) => setDefaultFontPair(e.target.value)}
              sx={{ minWidth: 260 }}
            >
              {fontPairList.map((pair) => (
                <MenuItem key={pair.id} value={pair.id}>
                  {pair.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Box>
            <Typography variant="labelLarge" sx={{ display: 'block', mb: 1 }}>
              Fit score: {fitScore}/5
            </Typography>
            <Slider
              value={fitScore}
              min={1}
              max={5}
              step={1}
              marks
              onChange={(_, v) => setFitScore(v as 1 | 2 | 3 | 4 | 5)}
            />
          </Box>

          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            sx={{
              border: `1px dashed ${theme.palette.outlineVariant}`,
              p: 2,
              backgroundColor: theme.palette.surfaces.containerLowest,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <Button
                component="label"
                startIcon={<UploadFileIcon />}
                size="small"
                variant="outlined"
              >
                Subir archivo .css
                <input
                  type="file"
                  accept=".css,text/css"
                  hidden
                  onChange={handleFileSelect}
                />
              </Button>
              <Typography variant="bodySmall" color="text.secondary">
                o pegá el CSS directamente abajo (también podés soltarlo en este recuadro).
              </Typography>
            </Stack>
            <TextField
              label="CSS"
              required
              fullWidth
              multiline
              minRows={8}
              maxRows={16}
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder=":root { --primary: #...; ... } .dark { ... }"
              InputProps={{
                sx: { fontFamily: theme.typography.fontFamilyMono, fontSize: 13 },
              }}
            />
          </Box>

          {/* Parse result */}
          {parsed && parsed.errors.length > 0 && (
            <Alert severity="error">
              <AlertTitle>El CSS tiene errores</AlertTitle>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {parsed.errors.map((e, i) => (
                  <li key={i}>
                    <Typography
                      component="span"
                      sx={{ fontFamily: theme.typography.fontFamilyMono, fontSize: 12 }}
                    >
                      {e}
                    </Typography>
                  </li>
                ))}
              </Box>
            </Alert>
          )}

          {parsed && parsed.errors.length === 0 && parsed.warnings.length > 0 && (
            <Alert severity="warning">
              <AlertTitle>Advertencias (no bloquean)</AlertTitle>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {parsed.warnings.map((w, i) => (
                  <li key={i}>
                    <Typography
                      component="span"
                      sx={{ fontFamily: theme.typography.fontFamilyMono, fontSize: 12 }}
                    >
                      {w}
                    </Typography>
                  </li>
                ))}
              </Box>
            </Alert>
          )}

          {parsed?.light && parsed?.dark && parsed.errors.length === 0 && (
            <Box>
              <Typography variant="labelLarge" sx={{ display: 'block', mb: 1 }}>
                Vista previa de tokens parseados
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="bodySmall" sx={{ width: 56 }}>
                    LIGHT
                  </Typography>
                  <Swatch color={parsed.light.primary} label="primary" />
                  <Swatch color={parsed.light.secondary} label="secondary" />
                  <Swatch color={parsed.light.tertiary} label="tertiary" />
                  <Swatch color={parsed.light.background} label="background" />
                  <Swatch color={parsed.light.surface} label="surface" />
                  <Swatch color={parsed.light.error} label="error" />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="bodySmall" sx={{ width: 56 }}>
                    DARK
                  </Typography>
                  <Swatch color={parsed.dark.primary} label="primary" />
                  <Swatch color={parsed.dark.secondary} label="secondary" />
                  <Swatch color={parsed.dark.tertiary} label="tertiary" />
                  <Swatch color={parsed.dark.background} label="background" />
                  <Swatch color={parsed.dark.surface} label="surface" />
                  <Swatch color={parsed.dark.error} label="error" />
                </Stack>
              </Stack>
            </Box>
          )}

          {submitError && (
            <Alert severity="error">
              <AlertTitle>No se pudo guardar el theme</AlertTitle>
              <Typography variant="bodyMedium">{submitError.message}</Typography>
              {submitError.details.length > 0 && (
                <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                  {submitError.details.map((d, i) => (
                    <li key={i}>
                      <Typography variant="bodySmall">{d}</Typography>
                    </li>
                  ))}
                </Box>
              )}
              {submitError.traceId && (
                <Typography
                  variant="bodySmall"
                  sx={{ display: 'block', mt: 1, opacity: 0.7 }}
                >
                  Trace id: {submitError.traceId}
                </Typography>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={mutating}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!canSubmit}
        >
          {mutating ? 'Guardando…' : 'Crear theme'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemeUploader;
