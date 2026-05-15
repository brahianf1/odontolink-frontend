import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';
import type { OfferedTreatmentResponseDTO } from '../../../types/practitioner.types';

interface TreatmentCardProps {
  treatment: OfferedTreatmentResponseDTO;
  onBook: (treatment: OfferedTreatmentResponseDTO) => void;
}

const isBookable = (t: OfferedTreatmentResponseDTO): boolean => {
  if (t.status !== 'ACTIVE') return false;
  if (t.expired) return false;
  if (t.quotaExhausted) return false;
  return true;
};

export default function TreatmentCard({ treatment, onBook }: TreatmentCardProps) {
  const bookable = isBookable(treatment);

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.25s',
        '&:hover': bookable
          ? { boxShadow: 4, borderColor: 'primary.main' }
          : undefined,
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700} sx={{ pr: 1 }}>
            {treatment.treatment.name}
          </Typography>
          {!bookable && (
            <Chip
              label="No disponible"
              size="small"
              color="default"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        {treatment.treatment.area && (
          <Chip
            label={treatment.treatment.area}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mt: 1, mb: 1.5 }}
          />
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6, mb: 2, minHeight: 48 }}
        >
          {treatment.treatment.description || 'Sin descripción disponible.'}
        </Typography>

        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {treatment.practitionerName}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {treatment.durationInMinutes} minutos
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <EventAvailableIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {treatment.availabilitySlots.length} día(s) con disponibilidad
            </Typography>
          </Stack>
        </Stack>

        {treatment.requirements && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1.5,
              backgroundColor: 'action.hover',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              REQUISITOS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {treatment.requirements}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={!bookable}
          onClick={() => onBook(treatment)}
          sx={{ py: 1.1, fontWeight: 600 }}
        >
          {bookable ? 'Reservar turno' : 'No disponible'}
        </Button>
      </CardActions>
    </Card>
  );
}
