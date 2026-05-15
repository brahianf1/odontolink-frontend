import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  PersonRemove as PersonRemoveIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import type { PractitionerDTO } from '../../../types/supervisor.types';

interface PractitionerCardProps {
  practitioner: PractitionerDTO;
  onViewAttentions: (practitioner: PractitionerDTO) => void;
  onUnlink: (practitioner: PractitionerDTO) => void;
}

export default function PractitionerCard({
  practitioner,
  onViewAttentions,
  onUnlink,
}: PractitionerCardProps) {
  const { user } = practitioner;
  const initials = `${(user.firstName?.[0] ?? '?').toUpperCase()}${(
    user.lastName?.[0] ?? ''
  ).toUpperCase()}`;

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 48, height: 48 }}>
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body1" fontWeight={700} noWrap>
              {user.firstName} {user.lastName}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
              <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BadgeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Legajo:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {practitioner.studentId}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Año cursado:
            </Typography>
            <Chip label={`${practitioner.studyYear}° año`} size="small" variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              DNI:
            </Typography>
            <Typography variant="body2">{user.dni || '—'}</Typography>
          </Stack>
        </Stack>
      </CardContent>

      <Box sx={{ px: 2.5, pb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={<VisibilityIcon />}
          onClick={() => onViewAttentions(practitioner)}
        >
          Auditar atenciones
        </Button>
        <Tooltip title="Desvincular practicante">
          <IconButton
            size="small"
            color="error"
            onClick={() => onUnlink(practitioner)}
            sx={{ border: 1, borderColor: 'error.light' }}
          >
            <PersonRemoveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
}
