import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

export default function SupervisorProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <Alert severity="warning">No se encontró información del usuario en sesión.</Alert>
    );
  }

  const initials = `${(user.firstName?.[0] ?? '?').toUpperCase()}${(
    user.lastName?.[0] ?? ''
  ).toUpperCase()}`;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Mi perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Información de tu cuenta como autoridad académica.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 72,
                height: 72,
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" fontWeight={700}>
                {user.firstName} {user.lastName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Stack>
              <Chip
                icon={<SchoolIcon />}
                label="Docente / Supervisor"
                size="small"
                color="primary"
                sx={{ mt: 1, fontWeight: 600 }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Datos de la cuenta
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BadgeIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ID de usuario
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  #{user.userId}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <EmailIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Correo electrónico
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user.email}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <SchoolIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rol
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user.role}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Alert severity="info" sx={{ mt: 3 }}>
            La edición del perfil docente estará disponible próximamente. Para cambios urgentes,
            contacta a un administrador del sistema.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
