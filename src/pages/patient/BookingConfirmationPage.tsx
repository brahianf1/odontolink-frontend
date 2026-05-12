import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  useTheme,
  Avatar,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Person as PersonIcon, CalendarMonth as CalendarIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BookingConfirmationPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as {
    practitionerName?: string;
    date?: string; // ISO
    treatmentName?: string;
  } | undefined;

  const practitionerName = data?.practitionerName || '';
  const dateIso = data?.date || '';
  const treatmentName = data?.treatmentName || '';

  const formattedDate = dateIso ? format(new Date(dateIso), "d 'de' MMMM - h:mm a", { locale: es }) : '';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <Paper sx={{ width: '100%', maxWidth: 560, p: 4, borderRadius: 2 }} elevation={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.success.main, width: 72, height: 72 }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: '#fff' }} />
          </Avatar>

          <Typography variant="h5" fontWeight={700}>
            ¡Turno confirmado!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 480 }}>
            Tu reserva ha sido registrada exitosamente.
          </Typography>

          <Paper variant="outlined" sx={{ width: '100%', p: 2.5, mt: 1, backgroundColor: 'action.hover', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">PRACTICANTE</Typography>
                <Typography variant="subtitle1" fontWeight={600}>{practitionerName}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">FECHA Y HORA</Typography>
                <Typography variant="subtitle1" fontWeight={600}>{formattedDate}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">TRATAMIENTO</Typography>
                <Typography variant="subtitle1" fontWeight={600}>{treatmentName}</Typography>
              </Box>
            </Box>
          </Paper>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.25, fontWeight: 700 }}
            onClick={() => navigate('/patient/treatments')}
          >
            Volver a tratamientos
          </Button>

          <Button variant="text" onClick={() => navigate('/patient/treatments')} sx={{ mt: 1 }}>
            Reservar otro turno
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
