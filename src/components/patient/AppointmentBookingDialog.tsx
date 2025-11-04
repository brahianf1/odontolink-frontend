import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  isSameDay,
  parseISO,
  getDay,
  startOfDay,
  isBefore,
} from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../services/api/patientService';
import type { OfferedTreatmentResponseDTO } from '../../types/practitioner.types';

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
  
  // State management
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Start week on Monday
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'calendar' | 'time'>('calendar');

  // Get available days of week from treatment
  const availableDaysOfWeek = useMemo(() => {
    return new Set(
      treatment.availabilitySlots.map((slot) => DAY_MAP[slot.dayOfWeek])
    );
  }, [treatment.availabilitySlots]);

  // Generate week days
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  // Check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = getDay(date);
    const today = startOfDay(new Date());
    return availableDaysOfWeek.has(dayOfWeek) && !isBefore(date, today);
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
      setSelectedDate(null);
      setSelectedSlot('');
      setAvailableSlots([]);
      setError(null);
      setStep('calendar');
    }
  }, [open]);

  // Handle date selection and load available slots
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setAvailableSlots([]);
    setError(null);
    setStep('time');

    const dateStr = format(date, 'yyyy-MM-dd');

    try {
      setLoadingSlots(true);
      const slots = await patientService.getAvailableSlots(treatment.id, dateStr);
      setAvailableSlots(slots);
      if (slots.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
      }
    } catch (err) {
      console.error('Error loading available slots:', err);
      setError('Error al cargar los horarios disponibles');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Navigate weeks
  const handlePreviousWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // Handle slot selection
  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setError(null);
  };

  // Back to calendar
  const handleBackToCalendar = () => {
    setStep('calendar');
    setSelectedDate(null);
    setSelectedSlot('');
    setAvailableSlots([]);
    setError(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setError('Por favor selecciona un horario');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await patientService.scheduleAppointment({
        offeredTreatmentId: treatment.id,
        appointmentTime: selectedSlot,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.message || 'Error al reservar el turno');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedSlot('');
    setAvailableSlots([]);
    setError(null);
    setStep('calendar');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: 'background.default',
        },
      }}
      TransitionProps={{
        timeout: 300,
      }}
    >
      {/* Header */}
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
            <IconButton
              onClick={handleBackToCalendar}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <CalendarIcon sx={{ color: 'primary.main', fontSize: { xs: 28, sm: 32 } }} />
          <Box>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                color: 'text.primary',
              }}
            >
              Reservar Turno
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              {step === 'calendar' ? 'Selecciona un día' : 'Elige tu horario'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          edge="end"
          onClick={handleClose}
          aria-label="cerrar"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {/* Content */}
      <DialogContent 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4 }, 
          py: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: '1400px',
          mx: 'auto',
          width: '100%',
        }}
      >
        {/* Treatment Info Card - Solo en paso de calendario */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              {/* Información principal en línea */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 }, flex: 1 }}>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    color: 'primary.main',
                  }}
                >
                  {treatment.treatment.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <PersonIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {treatment.practitionerName}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <AccessTimeIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {treatment.durationInMinutes} min
                  </Typography>
                </Box>

                {treatment.treatment.area && (
                  <Chip 
                    label={treatment.treatment.area} 
                    size="small"
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      height: 24,
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      color: 'primary.dark',
                    }} 
                  />
                )}
              </Box>

              {/* Requisitos si existen - compactos */}
              {treatment.requirements && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.75rem',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <strong>Req:</strong> {treatment.requirements}
                </Typography>
              )}
            </Box>
          </Paper>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              fontSize: '0.95rem',
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Calendar or Time Selection */}
        {step === 'calendar' ? (
          <Box>
            {/* Week Navigation */}
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
              <IconButton 
                onClick={handlePreviousWeek}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <Typography 
                variant="h6" 
                fontWeight={600}
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  color: 'text.primary',
                }}
              >
                {format(weekDays[0], 'MMMM yyyy', { locale: es }).charAt(0).toUpperCase() + 
                 format(weekDays[0], 'MMMM yyyy', { locale: es }).slice(1)}
              </Typography>
              
              <IconButton 
                onClick={handleNextWeek}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>

            {/* Calendar Grid - Optimizado y responsivo */}
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
              {weekDays.map((day, index) => {
                const available = isDateAvailable(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <Paper
                    key={index}
                    elevation={isSelected ? 2 : 1}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      textAlign: 'center',
                      cursor: available ? 'pointer' : 'not-allowed',
                      opacity: available ? 1 : 0.4,
                      backgroundColor: isSelected 
                        ? 'primary.main'
                        : 'background.paper',
                      border: `2px solid ${
                        isSelected
                          ? theme.palette.primary.dark
                          : isToday
                          ? theme.palette.primary.main
                          : 'transparent'
                      }`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      minHeight: { xs: '100px', sm: '110px' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      '&:hover': available ? {
                        backgroundColor: isSelected 
                          ? 'primary.dark'
                          : alpha(theme.palette.primary.main, 0.08),
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                      } : {},
                    }}
                    onClick={() => available && handleDateSelect(day)}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
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
                        fontSize: { xs: '1.75rem', sm: '2rem' },
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
            {/* Selected Date Display - Compacta */}
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
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.25 }}>
                  Fecha seleccionada
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ fontSize: '0.95rem' }}>
                  {selectedDate && format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                </Typography>
              </Box>
            </Paper>

            {/* Time Slots */}
            {loadingSlots ? (
              <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={2}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary">
                  Cargando horarios disponibles...
                </Typography>
              </Box>
            ) : availableSlots.length > 0 ? (
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    mb: 2.5,
                  }}
                >
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
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '10px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: alpha(theme.palette.divider, 0.1),
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.3),
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.5),
                      },
                    },
                  }}
                >
                  {availableSlots.map((slot) => {
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
                          backgroundColor: isSelected 
                            ? 'primary.main'
                            : 'background.paper',
                          border: `2px solid ${
                            isSelected
                              ? theme.palette.primary.dark
                              : 'transparent'
                          }`,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          minHeight: { xs: '100px', sm: '110px' },
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
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <Typography 
                          variant="h4" 
                          fontWeight={700}
                          sx={{ 
                            fontSize: { xs: '1.75rem', sm: '2rem' },
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
              <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.95rem' }}>
                No hay horarios disponibles para esta fecha. Por favor, selecciona otra fecha.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      {/* Footer Actions */}
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
          boxShadow: `0 -2px 10px ${alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          size="large"
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem' },
            fontWeight: 600,
            borderRadius: 2,
            px: { xs: 3, sm: 4 },
            py: 1.25,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              backgroundColor: alpha(theme.palette.error.main, 0.05),
              borderColor: 'error.main',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmBooking}
          variant="contained"
          size="large"
          disabled={!selectedSlot || loading || step === 'calendar'}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem' },
            fontWeight: 700,
            borderRadius: 2,
            px: { xs: 3, sm: 4 },
            py: 1.25,
            boxShadow: theme.shadows[4],
            '&:hover': {
              boxShadow: theme.shadows[8],
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              backgroundColor: alpha(theme.palette.action.disabled, 0.12),
            },
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'Reservando...' : 'Confirmar Reserva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
