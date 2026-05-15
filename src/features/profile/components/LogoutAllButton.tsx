import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { logoutAllSessions } from '../../../services/api/profileService';
import { useAuthStore } from '../../../store/authStore';
import {
  formatRetryMessage,
  getErrorMessage,
  getRetryAfterSeconds,
  isStatusCode,
} from '../utils/apiErrors';

export function LogoutAllButton() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await logoutAllSessions();
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      if (isStatusCode(err, 429)) {
        setError(
          formatRetryMessage(
            getRetryAfterSeconds(err),
            'Demasiados intentos. Intentá nuevamente más tarde.'
          )
        );
      } else {
        setError(getErrorMessage(err, 'No se pudieron cerrar todas las sesiones.'));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (busy) return;
    setOpen(false);
    setError(null);
  };

  return (
    <Box>
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          Sesiones activas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Si sospechás que alguien más usó tu cuenta, cerrá la sesión en todos los
          dispositivos. Tendrás que volver a iniciar sesión en este equipo.
        </Typography>
        <Box>
          <Button
            color="warning"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={() => setOpen(true)}
          >
            Cerrar sesión en todos los dispositivos
          </Button>
        </Box>
      </Stack>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Cerrar todas las sesiones
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esto invalidará todas tus sesiones activas, incluida la de este
            dispositivo. Vas a tener que volver a iniciar sesión.
          </DialogContentText>
          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={handleConfirm}
            disabled={busy}
            startIcon={
              busy ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            Cerrar todas
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
