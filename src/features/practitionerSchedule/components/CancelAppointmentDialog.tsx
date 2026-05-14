import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import type { AppointmentResponseDTO } from '../../../types/attention.types';

interface CancelAppointmentDialogProps {
  open: boolean;
  appointment: AppointmentResponseDTO | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (id: number, motive: string) => Promise<void> | void;
}

const MIN_MOTIVE_LENGTH = 5;

export default function CancelAppointmentDialog({
  open,
  appointment,
  submitting,
  onClose,
  onConfirm,
}: CancelAppointmentDialogProps) {
  const [motive, setMotive] = useState('');
  const [touched, setTouched] = useState(false);

  const trimmed = motive.trim();
  const isInvalid = trimmed.length < MIN_MOTIVE_LENGTH;

  const handleClose = () => {
    if (submitting) return;
    setMotive('');
    setTouched(false);
    onClose();
  };

  const handleConfirm = async () => {
    setTouched(true);
    if (!appointment || isInvalid) return;
    await onConfirm(appointment.id, trimmed);
    setMotive('');
    setTouched(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancelar turno</DialogTitle>
      <DialogContent>
        {appointment && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Estás cancelando el turno de
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {appointment.patientName} — {appointment.treatmentName}
            </Typography>
          </Box>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          Indica el motivo de la cancelación. El paciente podrá verlo en su agenda.
        </Alert>

        <TextField
          label="Motivo de la cancelación"
          value={motive}
          onChange={(e) => setMotive(e.target.value)}
          onBlur={() => setTouched(true)}
          fullWidth
          multiline
          minRows={3}
          required
          autoFocus
          error={touched && isInvalid}
          helperText={
            touched && isInvalid
              ? `Indica un motivo de al menos ${MIN_MOTIVE_LENGTH} caracteres`
              : ' '
          }
          disabled={submitting}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Volver
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={submitting || isInvalid}
        >
          Confirmar cancelación
        </Button>
      </DialogActions>
    </Dialog>
  );
}
