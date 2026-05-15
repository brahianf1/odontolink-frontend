import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentResponseDTO } from '../../../types/appointment.types';

interface CancelByPatientDialogProps {
  open: boolean;
  appointment: AppointmentResponseDTO | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const MAX_REASON = 1000;

export default function CancelByPatientDialog({
  open,
  appointment,
  loading = false,
  onClose,
  onConfirm,
}: CancelByPatientDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!appointment) return null;

  const date = new Date(appointment.appointmentTime);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Cancelar turno
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Esta acción libera el horario para otros pacientes. No se puede deshacer.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Paper
          variant="outlined"
          sx={{ p: 2.5, mb: 2, backgroundColor: 'action.hover', borderRadius: 2 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                TRATAMIENTO
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {appointment.treatmentName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                PRACTICANTE
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {appointment.practitionerName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                FECHA Y HORA
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {format(date, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Motivo (opcional)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Indícale al practicante por qué cancelas…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          inputProps={{ maxLength: MAX_REASON }}
          helperText={`${reason.length}/${MAX_REASON} caracteres`}
          disabled={loading}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ flex: 1 }}>
          Mantener turno
        </Button>
        <Button
          onClick={() => onConfirm(reason)}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={{ flex: 1 }}
        >
          {loading ? 'Cancelando…' : 'Cancelar turno'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
