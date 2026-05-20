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
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  addDays,
  addWeeks,
  format,
  getDay,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../../services/api/patientService';
import type { OfferedTreatmentResponseDTO } from '../../../types/practitioner.types';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
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

export default function AppointmentBookingDialog({
  open,
  treatment,
  onClose,
  onSuccess,
}: AppointmentBookingDialogProps) {
  const theme = useTheme();
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

  const offerStart = treatment.offerStartDate ? parseISO(treatment.offerStartDate) : null;
  const offerEnd = treatment.offerEndDate ? parseISO(treatment.offerEndDate) : null;

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

  const availableDaysOfWeek = useMemo(
    () => new Set(treatment.availabilitySlots.map((slot) => DAY_MAP[slot.dayOfWeek])),
    [treatment.availabilitySlots]
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const isDateAvailable = (date: Date): boolean => {
    if (treatment.quotaExhausted) return false;
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return false;
    if (offerStart && isBefore(date, startOfDay(offerStart))) return false;
    if (offerEnd && isBefore(startOfDay(offerEnd), date)) return false;
    return availableDaysOfWeek.has(getDay(date));
  };

  useEffect(() => {
    if (open) {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
      setSelectedDate(null);
      setSelectedSlot('');
      setStep('calendar');
    }
  }, [open]);

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

        {step === 'calendar' ? (
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                p: 2,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <IconButton onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {(() => {
                  const s = format(weekDays[0], 'MMMM yyyy', { locale: es });
                  return s.charAt(0).toUpperCase() + s.slice(1);
                })()}
              </Typography>
              <IconButton onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
                <ArrowForwardIcon />
              </IconButton>
            </Box>

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
              {weekDays.map((day) => {
                const available = isDateAvailable(day);
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isToday = isSameDay(day, new Date());

                return (
                  <Paper
                    key={day.toISOString()}
                    elevation={isSelected ? 2 : 1}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      textAlign: 'center',
                      cursor: available ? 'pointer' : 'not-allowed',
                      opacity: available ? 1 : 0.4,
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
                      minHeight: { xs: 100, sm: 110 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      '&:hover': available
                        ? {
                            backgroundColor: isSelected
                              ? 'primary.dark'
                              : alpha(theme.palette.primary.main, 0.08),
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                          }
                        : {},
                    }}
                    onClick={() => available && handleDateSelect(day)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: isSelected ? 'primary.contrastText' : 'text.secondary',
                        textTransform: 'uppercase',
                        mb: 0.5,
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
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
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
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
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
