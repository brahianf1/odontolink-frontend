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

interface PauseOfferDialogProps {
  open: boolean;
  offer: OfferedTreatmentResponseDTO | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void> | void;
}

export default function PauseOfferDialog({
  open,
  offer,
  submitting,
  onClose,
  onConfirm,
}: PauseOfferDialogProps) {
  const futureAppointments = offer?.currentActiveAttentions ?? 0;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Pausar oferta</DialogTitle>
      <DialogContent>
        {offer && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Vas a pausar la oferta
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {offer.treatment.name}
            </Typography>
          </Box>
        )}
        <Alert severity="info" sx={{ mb: 1 }}>
          Pausar esta oferta la oculta del catálogo y deja de aceptar nuevas reservas.
          Los turnos ya agendados y los casos clínicos en curso siguen su curso normal.
        </Alert>
        {futureAppointments > 0 && (
          <Typography variant="caption" color="text.secondary">
            Tenés {futureAppointments} atención{futureAppointments === 1 ? '' : 'es'} en curso que continuarán normalmente.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          onClick={() => offer && onConfirm(offer.id)}
          variant="contained"
          disabled={submitting || !offer}
        >
          {submitting ? 'Pausando…' : 'Pausar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
