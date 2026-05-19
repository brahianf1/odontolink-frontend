import { useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThemeVariantCard from './ThemeVariantCard';
import ThemeUploader from './ThemeUploader';
import { useCustomThemes } from '../hooks/useCustomThemes';
import { customThemeDtoToVariant } from '../../../../theme/variants';
import type { ThemeVariant } from '../../../../theme/variants/_types';

interface CustomThemesSectionProps {
  /** The currently selected variant id (in the admin's local preview). */
  selectedVariantId: string;
  /** Mode used to render the card swatches (light/dark). */
  effectiveMode: 'light' | 'dark';
  /** Called when the admin clicks a custom card to preview it locally. */
  onSelect: (variant: ThemeVariant, event: ReactMouseEvent<HTMLButtonElement>) => void;
}

export const CustomThemesSection = ({
  selectedVariantId,
  effectiveMode,
  onSelect,
}: CustomThemesSectionProps) => {
  const theme = useTheme();
  const { customThemes, loading, error, refresh, remove, mutating } = useCustomThemes();
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (pendingDeleteId == null) return;
    try {
      await remove(pendingDeleteId);
      setPendingDeleteId(null);
    } catch {
      // Error stays surfaced in the section banner — leave the dialog open
      // so the admin can read it; they can close manually.
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="titleLarge" sx={{ fontWeight: 600, mb: 0.5 }}>
            Themes personalizados
          </Typography>
          <Typography variant="bodyMedium" color="text.secondary">
            Subí themes propios pegando CSS shadcn-style. Se guardan en el backend y
            se suman al catálogo para todos los admins.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => void refresh()}
            disabled={loading}
            aria-label="Refrescar"
            sx={{ border: `1px solid ${theme.palette.outlineVariant}` }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={() => setUploaderOpen(true)}
          >
            Subir nuevo theme
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
          {error.details.length > 0 && (
            <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
              {error.details.map((d, i) => (
                <li key={i}>
                  <Typography variant="bodySmall">{d}</Typography>
                </li>
              ))}
            </Box>
          )}
        </Alert>
      )}

      {!loading && customThemes.length === 0 && !error && (
        <Box
          sx={{
            border: `1px dashed ${theme.palette.outlineVariant}`,
            p: 4,
            textAlign: 'center',
            backgroundColor: theme.palette.surfaces.containerLow,
          }}
        >
          <Typography variant="titleMedium" sx={{ fontWeight: 600, mb: 1 }}>
            Aún no hay themes personalizados.
          </Typography>
          <Typography variant="bodyMedium" color="text.secondary" sx={{ mb: 2 }}>
            {'Pegá un archivo CSS estilo shadcn (`:root { ... } .dark { ... }`) para crear el primero.'}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setUploaderOpen(true)}
          >
            Subir nuevo theme
          </Button>
        </Box>
      )}

      {customThemes.length > 0 && (
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
          {customThemes.map((dto) => {
            const variant = customThemeDtoToVariant(dto);
            return (
              <Box key={dto.id} sx={{ position: 'relative' }}>
                <ThemeVariantCard
                  variant={variant}
                  mode={effectiveMode}
                  selected={selectedVariantId === variant.id}
                  onSelect={(event) => onSelect(variant, event)}
                />
                <IconButton
                  size="small"
                  aria-label={`Eliminar ${variant.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDeleteId(dto.id);
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: theme.palette.surfaces.containerLow,
                    border: `1px solid ${theme.palette.outlineVariant}`,
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      )}

      <ThemeUploader open={uploaderOpen} onClose={() => setUploaderOpen(false)} />

      <Dialog open={pendingDeleteId != null} onClose={() => setPendingDeleteId(null)}>
        <DialogTitle>Eliminar theme</DialogTitle>
        <DialogContent>
          <DialogContentText>
            El theme se marca como eliminado y deja de aparecer en el catálogo. Si está
            aplicado como theme institucional, vas a recibir un error y deberás aplicar
            otro primero.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDeleteId(null)} disabled={mutating}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={mutating}>
            {mutating ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomThemesSection;
