import {
  Alert,
  Box,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AccessTime as CreatedIcon,
  Badge as DniIcon,
  CheckCircle as ActiveIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MyProfileDTO } from '../../../types/profile.types';
import { getRoleLabel, normalizeRole } from '../utils/roleLabels';

interface ProfileHeaderProps {
  profile: MyProfileDTO;
}

const formatCreatedAt = (value: string | undefined): string | null => {
  if (!value) return null;
  try {
    return format(parseISO(value), "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return null;
  }
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const theme = useTheme();
  const createdAt = formatCreatedAt(profile.createdAt);
  const roleLabel = getRoleLabel(profile.role);
  const role = normalizeRole(profile.role);

  return (
    <Box>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={700}>
          {profile.firstName} {profile.lastName}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            label={roleLabel}
            size="small"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
          {profile.active ? (
            <Chip
              icon={<ActiveIcon fontSize="small" />}
              label="Cuenta activa"
              size="small"
              variant="outlined"
              color="success"
              sx={{ fontWeight: 600 }}
            />
          ) : null}
        </Stack>
      </Stack>

      <Box
        sx={{
          mt: 2.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <EmailIcon fontSize="small" color="action" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Correo electrónico
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {profile.email}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <DniIcon fontSize="small" color="action" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              DNI
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {profile.dni || '—'}
            </Typography>
          </Box>
        </Stack>

        {createdAt ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CreatedIcon fontSize="small" color="action" />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Miembro desde
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {createdAt}
              </Typography>
            </Box>
          </Stack>
        ) : null}

        {role ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Tipo de cuenta
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {roleLabel}
              </Typography>
            </Box>
          </Stack>
        ) : null}
      </Box>

      {!profile.active ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Tu cuenta está marcada como inactiva. Si creés que es un error, contactá a un administrador.
        </Alert>
      ) : null}
    </Box>
  );
}
