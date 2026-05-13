import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  Edit,
  Delete,
  CalendarMonth,
  Schedule,
  Warning,
  TrackChanges,
  CheckCircle,
} from '@mui/icons-material';
import type { OfferedTreatmentResponseDTO } from '../../types/practitioner.types';

const DAYS_MAP: Record<string, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

interface TreatmentCardProps {
  treatment: OfferedTreatmentResponseDTO;
  completedPatientsCount?: number;
  onEdit: (treatment: OfferedTreatmentResponseDTO) => void;
  onDelete: (id: number) => void;
}

export default function TreatmentCard({
  treatment,
  completedPatientsCount,
  onEdit,
  onDelete,
}: TreatmentCardProps) {
  // Extraer datos
  const {
    treatment: treatmentInfo,
    requirements,
    durationInMinutes,
    availabilitySlots,
    offerStartDate,
    offerEndDate,
    maxCompletedAttentions,
  } = treatment;

  const attendedPatients = completedPatientsCount ?? 0;
  const patientQuota = maxCompletedAttentions ?? 0;
  const hasProgressData = patientQuota > 0;
  const progressValue = hasProgressData ? Math.min((attendedPatients / patientQuota) * 100, 100) : 0;

  // Agrupar horarios por día para mostrarlos de forma compacta
  const slotsByDay = availabilitySlots.reduce<Record<string, string[]>>((acc, slot) => {
    const dayLabel = DAYS_MAP[slot.dayOfWeek] || slot.dayOfWeek;
    const timeRange = `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;
    if (!acc[dayLabel]) {
      acc[dayLabel] = [];
    }
    acc[dayLabel].push(timeRange);
    return acc;
  }, {});

  // Días únicos para los chips de disponibilidad
  const uniqueDays = [...new Set(availabilitySlots.map((s) => s.dayOfWeek))];

  // Formatear fechas
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.25s ease',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[6],
          borderColor: 'primary.light',
        },
      }}
    >
      {/* ═══════ Header ═══════ */}
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {treatmentInfo.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Chip
              label={treatmentInfo.area}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`${durationInMinutes} min`}
              size="small"
              variant="outlined"
              icon={<Schedule sx={{ fontSize: '1rem !important' }} />}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
        {treatmentInfo.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>
            {treatmentInfo.description}
          </Typography>
        )}
      </Box>

      {/* ═══════ Body ═══════ */}
      <CardContent sx={{ flexGrow: 1, px: 2.5, pt: 2, pb: 1 }}>
        {/* Info Grid: 2 columnas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          {/* Disponibilidad */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <CalendarMonth sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                Disponibilidad
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {uniqueDays.map((dayKey) => (
                <Chip
                  key={dayKey}
                  label={DAYS_MAP[dayKey]}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>

          {/* Horarios */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <Schedule sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                Horarios
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {Object.entries(slotsByDay).map(([day, times]) => (
                <Typography key={day} variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <Box component="span" fontWeight={600}>{day}:</Box>{' '}
                  {times.join(', ')}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Período de oferta */}
          {(offerStartDate || offerEndDate) && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <CalendarMonth sx={{ fontSize: 18, color: 'secondary.main' }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                  Período de oferta
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                {formatDate(offerStartDate)} — {formatDate(offerEndDate)}
              </Typography>
            </Box>
          )}

          {/* Cupo máximo */}
          {maxCompletedAttentions != null && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <TrackChanges sx={{ fontSize: 18, color: 'secondary.main' }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                  Cupo y progreso
                </Typography>
              </Box>
              {hasProgressData ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                      Cupo de atenciones
                    </Typography>
                    <Chip
                      size="small"
                      icon={<CheckCircle sx={{ fontSize: '0.95rem !important' }} />}
                      label={`${attendedPatients} de ${maxCompletedAttentions}`}
                      color={progressValue >= 100 ? 'success' : 'secondary'}
                      variant="filled"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                      },
                    }}
                  />
                </>
              ) : (
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                  {maxCompletedAttentions} atenciones máximas
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Requerimientos */}
        {requirements && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.06),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.warning.main, 0.2),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="caption" fontWeight={700} color="warning.dark" textTransform="uppercase" letterSpacing={0.5}>
                  Requerimientos
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                {requirements}
              </Typography>
            </Paper>
          </>
        )}
      </CardContent>

      {/* ═══════ Footer ═══════ */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          px: 2.5,
          py: 2,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<Edit />}
          onClick={() => onEdit(treatment)}
          sx={{
            flex: 1,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Modificar
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<Delete />}
          onClick={() => onDelete(treatment.id)}
          sx={{
            flex: 1,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Eliminar
        </Button>
      </Box>
    </Card>
  );
}
