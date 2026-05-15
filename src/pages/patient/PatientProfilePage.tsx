import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ConstructionOutlined as ConstructionIcon } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

export default function PatientProfilePage() {
  const { user } = useAuthStore();

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulta los datos de tu cuenta de paciente.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 4 }}
        >
          <Avatar
            sx={{
              width: 96,
              height: 96,
              bgcolor: 'primary.main',
              fontSize: '2.25rem',
              fontWeight: 700,
            }}
          >
            {initials || 'P'}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Chip
              label="Paciente"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1, fontWeight: 600 }}
            />
          </Box>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: 'action.hover',
          }}
        >
          <ConstructionIcon color="action" />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Edición de perfil próximamente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estamos trabajando en la API de actualización de perfil. Mientras tanto, los datos
              mostrados son los registrados al crear tu cuenta.
            </Typography>
          </Box>
        </Paper>
      </Paper>
    </Box>
  );
}
