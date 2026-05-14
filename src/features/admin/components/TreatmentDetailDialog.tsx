import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import type { TreatmentResponseDTO } from '../../../types/practitioner.types';

interface TreatmentDetailDialogProps {
  open: boolean;
  treatment: TreatmentResponseDTO | null;
  onClose: () => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="overline"
    sx={{
      color: 'text.secondary',
      fontWeight: 600,
      letterSpacing: '0.08em',
      lineHeight: 1.2,
    }}
  >
    {children}
  </Typography>
);

export default function TreatmentDetailDialog({
  open,
  treatment,
  onClose,
}: TreatmentDetailDialogProps) {
  if (!treatment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        {treatment.name}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Tratamiento del catálogo maestro · ID #{treatment.id}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box>
            <SectionLabel>Área</SectionLabel>
            <Typography variant="body1" sx={{ mt: 0.5, color: 'text.primary' }}>
              {treatment.area?.trim() || 'Sin área asignada'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <SectionLabel>Descripción</SectionLabel>
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: treatment.description ? 'text.primary' : 'text.secondary',
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
              }}
            >
              {treatment.description?.trim() || 'Este tratamiento aún no tiene descripción.'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
