import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  type Theme,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Block as BlockIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  EventAvailable as EventAvailableIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  getDay,
  isBefore,
  isSameDay,
  isSameWeek,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../../services/api/patientService';
import type { OfferedTreatmentResponseDTO } from '../../../types/practitioner.types';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { useWeekAvailabilityCounts } from '../hooks/useWeekAvailabilityCounts';
import { mapBusinessError } from '../utils/apiErrors';
import { usePatientFeedback } from '../context/PatientFeedbackProvider';

interface AppointmentBookingDialogProps {
  open: boolean;
  treatment: OfferedTreatmentResponseDTO;
  onClose: () => void;
  onSuccess: () => void;
}

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

const DAY_MAP: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const SCAN_HORIZON_DAYS = 90;

export default function AppointmentBookingDialog({
  open,
  treatment,
  onClose,
  onSuccess,
}: AppointmentBookingDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = usePatientFeedback();

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [step, setStep] = useState<'calendar' | 'time'>('calendar');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noAvailabilityInHorizon, setNoAvailabilityInHorizon] = useState(false);

  const offerStart = treatment.offerStartDate ? parseISO(treatment.offerStartDate) : null;
  const offerEnd = treatment.offerEndDate ? parseISO(treatment.offerEndDate) : null;

  const availableDaysOfWeek = useMemo(
    () => new Set(treatment.availabilitySlots.map((slot) => DAY_MAP[slot.dayOfWeek])),
    [treatment.availabilitySlots]
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  const minBookableDate = useMemo(() => {
    if (!offerStart) return today;
    const offerStartDay = startOfDay(offerStart);
    return isBefore(offerStartDay, today) ? today : offerStartDay;
  }, [offerStart, today]);

  const maxBookableDate = useMemo(() => {
    return offerEnd ? startOfDay(offerEnd) : addMonths(today, 3);
  }, [offerEnd, today]);

  const isDateAvailable = (date: Date): boolean => {
    if (treatment.quotaExhausted) return false;
    const dayStart = startOfDay(date);
    if (isBefore(dayStart, minBookableDate)) return false;
    if (isBefore(maxBookableDate, dayStart)) return false;
    return availableDaysOfWeek.has(getDay(date));
  };

  const findNextAvailable = (from: Date): Date | null => {
    for (let i = 0; i < SCAN_HORIZON_DAYS; i++) {
      const candidate = addDays(from, i);
      if (isBefore(maxBookableDate, startOfDay(candidate))) return null;
      if (isDateAvailable(candidate)) return candidate;
    }
    return null;
  };

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const visibleAvailableDateKeys = useMemo(
    () =>
      weekDays
        .filter((day) => isDateAvailable(day))
        .map((day) => format(day, 'yyyy-MM-dd')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekDays, treatment, minBookableDate, maxBookableDate, availableDaysOfWeek]
  );

  const { counts: dayCounts, loading: countsLoading } = useWeekAvailabilityCounts(
    open && step === 'calendar' ? treatment.id : null,
    visibleAvailableDateKeys,
    open && step === 'calendar'
  );

  const hasAnyAvailableInWeek = visibleAvailableDateKeys.length > 0;

  const nextAvailableFromNextWeek = useMemo(() => {
    if (!open || step !== 'calendar') return null;
    return findNextAvailable(addDays(weekDays[6], 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, weekDays, treatment, minBookableDate, maxBookableDate]);

  const canGoPrevWeek = useMemo(() => {
    const lastDayPrev = addDays(currentWeekStart, -1);
    return !isBefore(lastDayPrev, minBookableDate);
  }, [currentWeekStart, minBookableDate]);

  const canGoNextWeek = useMemo(() => {
    const firstDayNext = addDays(currentWeekStart, 7);
    return !isBefore(maxBookableDate, firstDayNext);
  }, [currentWeekStart, maxBookableDate]);

  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const { slots: rawSlots, loading: slotsLoading, error: slotsError } = useAvailableSlots(
    open && step === 'time' ? treatment.id : null,
    dateString
  );

  const slots = useMemo(() => {
    if (!selectedDate || !isSameDay(selectedDate, new Date())) return rawSlots;
    const now = Date.now();
    return rawSlots.filter((slot) => parseISO(slot).getTime() > now);
  }, [rawSlots, selectedDate]);

  useEffect(() => {
    if (!open) return;
    const firstAvailable = findNextAvailable(minBookableDate);
    if (firstAvailable) {
      setCurrentWeekStart(startOfWeek(firstAvailable, { weekStartsOn: 1 }));
      setNoAvailabilityInHorizon(false);
    } else {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
      setNoAvailabilityInHorizon(true);
    }
    setSelectedDate(null);
    setSelectedSlot('');
    setStep('calendar');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, treatment.id]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setStep('time');
  };

  const handleBackToCalendar = () => {
    setStep('calendar');
    setSelectedDate(null);
    setSelectedSlot('');
  };

  const handleJumpToNextAvailable = () => {
    if (!nextAvailableFromNextWeek) return;
    setCurrentWeekStart(
      startOfWeek(nextAvailableFromNextWeek, { weekStartsOn: 1 })
    );
  };

  const performBooking = async () => {
    setSubmitting(true);
    try {
      await patientService.scheduleAppointment({
        offeredTreatmentId: treatment.id,
        appointmentTime: selectedSlot,
      });
      notifySuccess('Turno reservado correctamente.');
      setConfirming(false);
      onSuccess();
      navigate('/patient/booking-confirmed', {
        state: {
          practitionerName: treatment.practitionerName,
          date: selectedSlot,
          treatmentName: treatment.treatment.name,
        },
      });
    } catch (err) {
      const { message } = mapBusinessError(err, 'No pudimos completar la reserva.');
      notifyError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setSelectedDate(null);
    setSelectedSlot('');
    setStep('calendar');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      PaperProps={{ sx: { backgroundColor: 'background.default' } }}
      TransitionProps={{ timeout: 300 }}
    >
      <DialogTitle
        sx={{
          py: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 3, md: 4 },
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: theme.shadows[1],
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {step === 'time' && (
            <IconButton onClick={handleBackToCalendar} size="small" disabled={submitting}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <CalendarIcon sx={{ color: 'primary.main', fontSize: { xs: 28, sm: 32 } }} />
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Reservar Turno
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step === 'calendar' ? 'Selecciona un día' : 'Elige tu horario'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} disabled={submitting} aria-label="cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
        }}
      >
        {step === 'calendar' && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {treatment.treatment.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <PersonIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">{treatment.practitionerName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">{treatment.durationInMinutes} min</Typography>
              </Box>
              {treatment.treatment.area && (
                <Chip
                  label={treatment.treatment.area}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    color: 'primary.dark',
                  }}
                />
              )}
            </Box>
            {treatment.requirements && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                <strong>Requisitos:</strong> {treatment.requirements}
              </Typography>
            )}
            {(offerStart || offerEnd) && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Oferta vigente:{' '}
                {offerStart ? format(offerStart, "d 'de' MMM yyyy", { locale: es }) : '—'} →{' '}
                {offerEnd ? format(offerEnd, "d 'de' MMM yyyy", { locale: es }) : '—'}
              </Typography>
            )}
          </Paper>
        )}

        {treatment.quotaExhausted && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Este tratamiento alcanzó su cupo máximo. No se pueden reservar más turnos.
          </Alert>
        )}

        {step === 'calendar' && noAvailabilityInHorizon && !treatment.quotaExhausted && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No hay fechas disponibles para este tratamiento en los próximos{' '}
            {SCAN_HORIZON_DAYS} días dentro de la oferta vigente.
          </Alert>
        )}

        {step === 'calendar' ? (
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 1.5, sm: 2 },
                mb: 3,
                p: 2,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Tooltip
                  title={canGoPrevWeek ? '' : 'No hay fechas anteriores disponibles'}
                  disableHoverListener={canGoPrevWeek}
                >
                  <span>
                    <IconButton
                      onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
                      disabled={!canGoPrevWeek}
                      aria-label="semana anterior"
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Typography variant="h6" fontWeight={600} sx={{ textAlign: 'center', flex: 1 }}>
                  {(() => {
                    const s = format(weekDays[0], 'MMMM yyyy', { locale: es });
                    return s.charAt(0).toUpperCase() + s.slice(1);
                  })()}
                </Typography>
                <Tooltip
                  title={
                    canGoNextWeek
                      ? ''
                      : offerEnd
                      ? `La oferta finaliza el ${format(offerEnd, "d 'de' MMM yyyy", { locale: es })}`
                      : 'No hay más fechas disponibles'
                  }
                  disableHoverListener={canGoNextWeek}
                >
                  <span>
                    <IconButton
                      onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                      disabled={!canGoNextWeek}
                      aria-label="próxima semana"
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {nextAvailableFromNextWeek &&
                !isSameWeek(nextAvailableFromNextWeek, currentWeekStart, { weekStartsOn: 1 }) && (
                  <Button
                    size="small"
                    variant={hasAnyAvailableInWeek ? 'text' : 'contained'}
                    color="primary"
                    startIcon={<EventAvailableIcon />}
                    onClick={handleJumpToNextAvailable}
                    sx={{ flexShrink: 0 }}
                  >
                    Próxima fecha:{' '}
                    {format(nextAvailableFromNextWeek, "EEE d 'de' MMM", { locale: es })}
                  </Button>
                )}
            </Box>

            {step === 'calendar' &&
              !hasAnyAvailableInWeek &&
              !noAvailabilityInHorizon && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  No hay días bookeables en esta semana. Usá el botón "Próxima fecha"
                  para saltar al siguiente turno disponible.
                </Alert>
              )}

            {isMobile ? (
              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: 1.5,
                  pb: 1,
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': { height: 6 },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: 3,
                  },
                }}
              >
                {weekDays.map((day) =>
                  renderDayCard(day, {
                    isMobile: true,
                    theme,
                    today,
                    selectedDate,
                    isDateAvailable,
                    dayCounts,
                    countsLoading,
                    onSelect: handleDateSelect,
                  })
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(5, 1fr)',
                    xl: 'repeat(7, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {weekDays.map((day) =>
                  renderDayCard(day, {
                    isMobile: false,
                    theme,
                    today,
                    selectedDate,
                    isDateAvailable,
                    dayCounts,
                    countsLoading,
                    onSelect: handleDateSelect,
                  })
                )}
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                backgroundColor: alpha(theme.palette.success.main, 0.08),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Fecha seleccionada
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {selectedDate && format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                </Typography>
              </Box>
            </Paper>

            {slotsLoading ? (
              <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={2}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary">
                  Cargando horarios disponibles…
                </Typography>
              </Box>
            ) : slotsError ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {slotsError}
              </Alert>
            ) : slots.length > 0 ? (
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                  Horarios disponibles
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      md: 'repeat(4, 1fr)',
                      lg: 'repeat(5, 1fr)',
                      xl: 'repeat(7, 1fr)',
                    },
                    gap: { xs: 1.5, sm: 2 },
                  }}
                >
                  {slots.map((slot) => {
                    const slotDate = parseISO(slot);
                    const isSelected = selectedSlot === slot;
                    return (
                      <Paper
                        key={slot}
                        elevation={isSelected ? 2 : 1}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'primary.main' : 'background.paper',
                          border: `2px solid ${isSelected ? theme.palette.primary.dark : 'transparent'}`,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          minHeight: { xs: 100, sm: 110 },
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          '&:hover': {
                            backgroundColor: isSelected
                              ? 'primary.dark'
                              : alpha(theme.palette.primary.main, 0.08),
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                          },
                        }}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          sx={{
                            color: isSelected ? 'primary.contrastText' : 'text.primary',
                            lineHeight: 1,
                          }}
                        >
                          {format(slotDate, 'HH:mm')}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <Alert
                severity="warning"
                sx={{ borderRadius: 2 }}
                action={
                  nextAvailableFromNextWeek ? (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => {
                        handleBackToCalendar();
                        handleJumpToNextAvailable();
                      }}
                    >
                      Ver próxima fecha
                    </Button>
                  ) : undefined
                }
              >
                No hay horarios disponibles para esta fecha. Por favor selecciona otra.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 2.5 },
          backgroundColor: 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 2,
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
        }}
      >
        <Button onClick={handleClose} disabled={submitting} variant="outlined" size="large">
          Cancelar
        </Button>
        <Button
          onClick={() => setConfirming(true)}
          variant="contained"
          size="large"
          disabled={!selectedSlot || submitting || step === 'calendar'}
          startIcon={<CheckCircleIcon />}
        >
          Confirmar reserva
        </Button>
      </DialogActions>

      <Dialog open={confirming} onClose={() => !submitting && setConfirming(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Confirmar reserva
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verifica los detalles de tu turno antes de confirmar.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  PRACTICANTE
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {treatment.practitionerName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  FECHA Y HORA
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedSlot
                    ? format(parseISO(selectedSlot), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })
                    : ''}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  TRATAMIENTO
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {treatment.treatment.name}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirming(false)} disabled={submitting} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            onClick={performBooking}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ flex: 1 }}
          >
            {submitting ? 'Reservando…' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

interface DayCardConfig {
  isMobile: boolean;
  theme: Theme;
  today: Date;
  selectedDate: Date | null;
  isDateAvailable: (date: Date) => boolean;
  dayCounts: Map<string, number>;
  countsLoading: boolean;
  onSelect: (date: Date) => void;
}

function renderDayCard(day: Date, cfg: DayCardConfig) {
  const {
    isMobile,
    theme,
    today,
    selectedDate,
    isDateAvailable,
    dayCounts,
    countsLoading,
    onSelect,
  } = cfg;

  const dateKey = format(day, 'yyyy-MM-dd');
  const isPast = isBefore(startOfDay(day), today);
  const availableByDay = isDateAvailable(day);
  const count = dayCounts.get(dateKey);
  const hasSlots = count !== undefined ? count > 0 : null;
  const clickable = availableByDay && (hasSlots ?? true);
  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
  const isToday = isSameDay(day, new Date());

  const opacity = isPast ? 0.25 : !availableByDay ? 0.55 : hasSlots === false ? 0.65 : 1;

  return (
    <Paper
      key={day.toISOString()}
      elevation={isSelected ? 2 : 1}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        textAlign: 'center',
        cursor: clickable ? 'pointer' : 'not-allowed',
        opacity,
        backgroundColor: isSelected ? 'primary.main' : 'background.paper',
        border: `2px solid ${
          isSelected
            ? theme.palette.primary.dark
            : isToday
            ? theme.palette.primary.main
            : 'transparent'
        }`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        minWidth: isMobile ? 84 : 'auto',
        minHeight: { xs: 110, sm: 120 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0.5,
        scrollSnapAlign: isMobile ? 'start' : 'none',
        flexShrink: 0,
        '&:hover': clickable
          ? {
              backgroundColor: isSelected
                ? 'primary.dark'
                : alpha(theme.palette.primary.main, 0.08),
              borderColor: alpha(theme.palette.primary.main, 0.5),
            }
          : {},
      }}
      onClick={() => clickable && onSelect(day)}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: isSelected ? 'primary.contrastText' : 'text.secondary',
          textTransform: 'uppercase',
          textDecoration: isPast ? 'line-through' : 'none',
        }}
      >
        {format(day, 'EEE', { locale: es })}
      </Typography>
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          color: isSelected ? 'primary.contrastText' : 'text.primary',
          lineHeight: 1,
          textDecoration: isPast ? 'line-through' : 'none',
          fontSize: { xs: '1.5rem', sm: '2rem' },
        }}
      >
        {format(day, 'd')}
      </Typography>
      {!availableByDay && !isPast && (
        <BlockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
      )}
      {availableByDay && !isPast && (
        <Box sx={{ minHeight: 18, display: 'flex', alignItems: 'center' }}>
          {countsLoading && count === undefined ? (
            <Skeleton variant="text" width={48} sx={{ fontSize: '0.7rem' }} />
          ) : count === undefined ? null : count > 0 ? (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: isSelected ? 'primary.contrastText' : 'success.main',
                fontSize: '0.7rem',
              }}
            >
              {count} {count === 1 ? 'turno' : 'turnos'}
            </Typography>
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: isSelected ? 'primary.contrastText' : 'text.disabled',
                fontSize: '0.7rem',
              }}
            >
              Sin turnos
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
