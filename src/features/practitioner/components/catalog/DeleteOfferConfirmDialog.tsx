import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { OfferedTreatmentResponseDTO } from '../../../../types/practitioner.types';

interface DeleteOfferConfirmDialogProps {
  open: boolean;
  offer: OfferedTreatmentResponseDTO | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void> | void;
}

/**
 * Confirmation for DELETE on an offer. The backend's actual behaviour
 * (HARD_DELETED vs SOFT_DELETED) depends on whether the offer has any
 * recorded activity — we can't know up-front, so the copy stays
 * descriptive instead of promising one outcome. The exact `message` the
 * backend returns is surfaced to the practitioner in a Snackbar afterward.
 */
export default function DeleteOfferConfirmDialog({
  open,
  offer,
  submitting,
  onClose,
  onConfirm,
}: DeleteOfferConfirmDialogProps) {
  const alreadyArchived = offer?.status === 'INACTIVE';

  const handleConfirm = async () => {
    if (!offer) return;
    await onConfirm(offer.id);
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar del catálogo</DialogTitle>
      <DialogContent>
        {offer && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Vas a eliminar la oferta
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {offer.treatment.name}
            </Typography>
          </Box>
        )}

        {alreadyArchived ? (
          <Alert severity="info" sx={{ mb: 1 }}>
            Esta oferta ya estaba archivada. Si no tuvo turnos ni atenciones, se eliminará por completo. Si los tuvo, queda como histórico — tu trabajo clínico está protegido.
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 1 }}>
            Si la oferta nunca tuvo reservas, se eliminará del catálogo por completo.
            Si ya tuvo turnos o atenciones, se conserva como histórico y deja de aparecer para los pacientes.
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary">
          Tus pacientes no perderán su historial clínico en ningún caso.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" disabled={submitting || !offer}>
          {submitting ? 'Eliminando…' : 'Eliminar del catálogo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
