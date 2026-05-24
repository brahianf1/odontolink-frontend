import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  type Theme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  EventAvailable as EventAvailableIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import patientService from '../../../services/api/patientService';
import type { OfferedTreatmentResponseDTO } from '../../../types/practitioner.types';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { useAvailabilityCounts } from '../hooks/useAvailabilityCounts';
import { mapBusinessError } from '../utils/apiErrors';
import { usePatientFeedback } from '../context/PatientFeedbackProvider';
import { useNonWorkingDays } from '../../../hooks/useNonWorkingDays';

interface AppointmentBookingDialogProps {
  open: boolean;
  treatment: OfferedTreatmentResponseDTO;
  onClose: () => void;
  onSuccess: () => void;
}

type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

const DAY_MAP: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const SCAN_HORIZON_DAYS = 90;

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

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
  const slotPanelRef = useRef<HTMLDivElement | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noAvailabilityInHorizon, setNoAvailabilityInHorizon] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const offerStart = treatment.offerStartDate ? parseISO(treatment.offerStartDate) : null;
  const offerEnd = treatment.offerEndDate ? parseISO(treatment.offerEndDate) : null;

  const nonWorkingYears = useMemo(() => {
    const startYear = (offerStart ?? today).getFullYear();
    const endYear = (offerEnd ?? addMonths(today, 3)).getFullYear();
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);
    return years;
  }, [offerStart, offerEnd, today]);
  const { isNonWorkingDay, getNonWorkingDayName } = useNonWorkingDays(nonWorkingYears);

  const availableDaysOfWeek = useMemo(
    () => new Set(treatment.availabilitySlots.map((slot) => DAY_MAP[slot.dayOfWeek])),
    [treatment.availabilitySlots]
  );

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
    if (isNonWorkingDay(format(date, 'yyyy-MM-dd'))) return false;
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

  const monthGridDays = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [currentMonth]);

  const monthBookableDateKeys = useMemo(
    () =>
      monthGridDays
        .filter(
          (day) => isSameMonth(day, currentMonth) && isDateAvailable(day)
        )
        .map((day) => format(day, 'yyyy-MM-dd')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthGridDays, currentMonth, treatment, minBookableDate, maxBookableDate, availableDaysOfWeek, isNonWorkingDay]
  );

  const { counts: dayCounts, loading: countsLoading } = useAvailabilityCounts(
    open ? treatment.id : null,
    monthBookableDateKeys,
    open
  );

  const nextAvailableFromNextMonth = useMemo(() => {
    if (!open) return null;
    const startFrom = addDays(endOfMonth(currentMonth), 1);
    return findNextAvailable(startFrom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentMonth, treatment, minBookableDate, maxBookableDate, isNonWorkingDay]);

  const hasAnyAvailableInMonth = monthBookableDateKeys.length > 0;

  const canGoPrevMonth = useMemo(() => {
    const prevMonthEnd = endOfMonth(addMonths(currentMonth, -1));
    return !isBefore(prevMonthEnd, minBookableDate);
  }, [currentMonth, minBookableDate]);

  const canGoNextMonth = useMemo(() => {
    const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
    return !isBefore(maxBookableDate, nextMonthStart);
  }, [currentMonth, maxBookableDate]);

  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const isSelectedNonWorking = dateString ? isNonWorkingDay(dateString) : false;
  const { slots: rawSlots, loading: slotsLoading, error: slotsError } = useAvailableSlots(
    open && selectedDate && !isSelectedNonWorking ? treatment.id : null,
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
      setCurrentMonth(startOfMonth(firstAvailable));
      setSelectedDate(firstAvailable);
      setNoAvailabilityInHorizon(false);
    } else {
      setCurrentMonth(startOfMonth(today));
      setSelectedDate(null);
      setNoAvailabilityInHorizon(true);
    }
    setSelectedSlot('');
    setDetailsExpanded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, treatment.id]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    if (isMobile && slotPanelRef.current) {
      slotPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleJumpToNextAvailable = () => {
    if (!nextAvailableFromNextMonth) return;
    setCurrentMonth(startOfMonth(nextAvailableFromNextMonth));
    setSelectedDate(nextAvailableFromNextMonth);
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
    onClose();
  };

  const monthLabel = capitalize(format(currentMonth, 'MMMM yyyy', { locale: es }));

  const subtitle = `${treatment.treatment.name} · ${treatment.practitionerName} · ${treatment.durationInMinutes} min`;

  const hasDetails = Boolean(
    treatment.treatment.area || treatment.requirements || offerStart || offerEnd
  );

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
          py: { xs: 1.5, sm: 2 },
          px: { xs: 1.5, sm: 3 },
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.0625rem', sm: '1.25rem' },
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Reservar turno
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={submitting} aria-label="cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 1.5, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: 1200,
          mx: 'auto',
          width: '100%',
        }}
      >
        {hasDetails && (
          <Accordion
            expanded={detailsExpanded}
            onChange={(_event, expanded) => setDetailsExpanded(expanded)}
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: 'transparent',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                backgroundColor: alpha(theme.palette.text.primary, 0.02),
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
              sx={{
                minHeight: 44,
                px: 2,
                '& .MuiAccordionSummary-content': { my: 1 },
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.primary"
                sx={{ fontSize: '0.8125rem' }}
              >
                Detalles del tratamiento
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {treatment.treatment.area && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ minWidth: 80, fontWeight: 600 }}
                    >
                      Área
                    </Typography>
                    <Chip
                      label={treatment.treatment.area}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        borderColor: theme.palette.divider,
                        color: 'text.primary',
                      }}
                    />
                  </Box>
                )}
                {treatment.requirements && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ minWidth: 80, fontWeight: 600, flexShrink: 0 }}
                    >
                      Requisitos
                    </Typography>
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      {treatment.requirements}
                    </Typography>
                  </Box>
                )}
                {(offerStart || offerEnd) && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ minWidth: 80, fontWeight: 600, flexShrink: 0 }}
                    >
                      Vigente
                    </Typography>
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      {offerStart
                        ? format(offerStart, "d 'de' MMM yyyy", { locale: es })
                        : '—'}{' '}
                      →{' '}
                      {offerEnd
                        ? format(offerEnd, "d 'de' MMM yyyy", { locale: es })
                        : '—'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {treatment.quotaExhausted && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Este tratamiento alcanzó su cupo máximo. No se pueden reservar más turnos.
          </Alert>
        )}

        {noAvailabilityInHorizon && !treatment.quotaExhausted && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No hay fechas disponibles para este tratamiento en los próximos{' '}
            {SCAN_HORIZON_DAYS} días dentro de la oferta vigente.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '320px 1fr', md: '360px 1fr' },
            gap: { xs: 2, sm: 3 },
            alignItems: 'start',
          }}
        >
          <MonthCalendar
            theme={theme}
            monthLabel={monthLabel}
            monthGridDays={monthGridDays}
            currentMonth={currentMonth}
            today={today}
            selectedDate={selectedDate}
            offerEnd={offerEnd}
            canGoPrevMonth={canGoPrevMonth}
            canGoNextMonth={canGoNextMonth}
            isDateAvailable={isDateAvailable}
            dayCounts={dayCounts}
            countsLoading={countsLoading}
            hasAnyAvailableInMonth={hasAnyAvailableInMonth}
            nextAvailableFromNextMonth={nextAvailableFromNextMonth}
            getNonWorkingDayName={getNonWorkingDayName}
            onPrevMonth={() => setCurrentMonth(addMonths(currentMonth, -1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
            onSelectDate={handleDateSelect}
            onJumpToNextAvailable={handleJumpToNextAvailable}
          />

          <Box ref={slotPanelRef} sx={{ minWidth: 0 }}>
            <SlotPanel
              theme={theme}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              slots={slots}
              slotsLoading={slotsLoading}
              slotsError={slotsError}
              nextAvailable={nextAvailableFromNextMonth}
              onSelectSlot={setSelectedSlot}
              onJumpToNextAvailable={handleJumpToNextAvailable}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 1.5, sm: 3, md: 4 },
          py: { xs: 1.5, sm: 2 },
          backgroundColor: 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
        }}
      >
        <Button
          onClick={() => setConfirming(true)}
          variant="contained"
          size="large"
          disabled={!selectedSlot || submitting}
          startIcon={<CheckCircleIcon />}
          fullWidth={isMobile}
          sx={{ minWidth: { sm: 240 }, ml: { sm: 'auto' } }}
        >
          Confirmar reserva
        </Button>
      </DialogActions>

      <Dialog
        open={confirming}
        onClose={() => !submitting && setConfirming(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Confirmar reserva
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verificá los detalles de tu turno antes de confirmar.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{ p: 2.5, mb: 2, backgroundColor: 'action.hover', borderRadius: 2 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  PRACTICANTE
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {treatment.practitionerName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  FECHA Y HORA
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedSlot
                    ? format(parseISO(selectedSlot), "EEEE d 'de' MMMM 'a las' HH:mm", {
                        locale: es,
                      })
                    : ''}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
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

interface MonthCalendarProps {
  theme: Theme;
  monthLabel: string;
  monthGridDays: Date[];
  currentMonth: Date;
  today: Date;
  selectedDate: Date | null;
  offerEnd: Date | null;
  canGoPrevMonth: boolean;
  canGoNextMonth: boolean;
  isDateAvailable: (date: Date) => boolean;
  dayCounts: Map<string, number>;
  countsLoading: boolean;
  hasAnyAvailableInMonth: boolean;
  nextAvailableFromNextMonth: Date | null;
  getNonWorkingDayName: (dateKey: string) => string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  onJumpToNextAvailable: () => void;
}

function MonthCalendar({
  theme,
  monthLabel,
  monthGridDays,
  currentMonth,
  today,
  selectedDate,
  offerEnd,
  canGoPrevMonth,
  canGoNextMonth,
  isDateAvailable,
  dayCounts,
  countsLoading,
  hasAnyAvailableInMonth,
  nextAvailableFromNextMonth,
  getNonWorkingDayName,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onJumpToNextAvailable,
}: MonthCalendarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        backgroundColor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Tooltip
          title={canGoPrevMonth ? '' : 'No hay fechas anteriores disponibles'}
          disableHoverListener={canGoPrevMonth}
        >
          <span>
            <IconButton
              onClick={onPrevMonth}
              disabled={!canGoPrevMonth}
              aria-label="mes anterior"
              size="small"
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ fontSize: '1rem', textAlign: 'center', flex: 1, mx: 1 }}
        >
          {monthLabel}
        </Typography>
        <Tooltip
          title={
            canGoNextMonth
              ? ''
              : offerEnd
              ? `La oferta finaliza el ${format(offerEnd, "d 'de' MMM yyyy", { locale: es })}`
              : 'No hay más fechas disponibles'
          }
          disableHoverListener={canGoNextMonth}
        >
          <span>
            <IconButton
              onClick={onNextMonth}
              disabled={!canGoNextMonth}
              aria-label="próximo mes"
              size="small"
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.25,
        }}
      >
        {WEEKDAY_LABELS.map((label, idx) => (
          <Typography
            key={idx}
            variant="caption"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              color: 'text.secondary',
              fontSize: '0.6875rem',
              letterSpacing: 0.5,
              py: 0.5,
            }}
          >
            {label}
          </Typography>
        ))}
        {monthGridDays.map((day) =>
          renderMonthCell(day, {
            theme,
            currentMonth,
            today,
            selectedDate,
            isDateAvailable,
            dayCounts,
            countsLoading,
            getNonWorkingDayName,
            onSelect: onSelectDate,
          })
        )}
      </Box>

      {!hasAnyAvailableInMonth && nextAvailableFromNextMonth && (
        <Alert severity="info" sx={{ borderRadius: 1.5, py: 0.5 }}>
          Este mes no tiene disponibilidad.
        </Alert>
      )}

      {nextAvailableFromNextMonth && (
        <Chip
          label={`Próxima fecha: ${format(
            nextAvailableFromNextMonth,
            "EEE d 'de' MMM",
            { locale: es }
          )}`}
          onClick={onJumpToNextAvailable}
          icon={<EventAvailableIcon />}
          color={hasAnyAvailableInMonth ? 'default' : 'primary'}
          variant={hasAnyAvailableInMonth ? 'outlined' : 'filled'}
          size="small"
          sx={{ fontWeight: 600, cursor: 'pointer', alignSelf: 'stretch' }}
        />
      )}
    </Paper>
  );
}

interface MonthCellConfig {
  theme: Theme;
  currentMonth: Date;
  today: Date;
  selectedDate: Date | null;
  isDateAvailable: (date: Date) => boolean;
  dayCounts: Map<string, number>;
  countsLoading: boolean;
  getNonWorkingDayName: (dateKey: string) => string | null;
  onSelect: (date: Date) => void;
}

function renderMonthCell(day: Date, cfg: MonthCellConfig) {
  const { theme, currentMonth, today, selectedDate, isDateAvailable, dayCounts, countsLoading, getNonWorkingDayName, onSelect } = cfg;

  const inMonth = isSameMonth(day, currentMonth);
  const isPast = isBefore(startOfDay(day), today);
  const availableByDay = isDateAvailable(day);
  const dateKey = format(day, 'yyyy-MM-dd');
  const count = dayCounts.get(dateKey);
  const hasSlots = count !== undefined ? count > 0 : null;
  const clickable = inMonth && availableByDay && (hasSlots ?? true);
  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
  const isToday = isSameDay(day, new Date());
  const holidayName = inMonth && !isPast ? getNonWorkingDayName(dateKey) : null;

  let opacity: number;
  if (!inMonth) opacity = 0.25;
  else if (isPast) opacity = 0.3;
  else if (!availableByDay) opacity = 0.45;
  else if (hasSlots === false) opacity = 0.55;
  else opacity = 1;

  const bg = isSelected
    ? theme.palette.primary.main
    : isToday && inMonth && !isPast
    ? alpha(theme.palette.primary.main, 0.1)
    : 'transparent';

  const textColor = isSelected ? theme.palette.primary.contrastText : 'text.primary';

  const cell = (
    <Box
      onClick={() => clickable && onSelect(day)}
      sx={{
        aspectRatio: '1 / 1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '50%',
        cursor: clickable ? 'pointer' : 'default',
        opacity,
        backgroundColor: bg,
        border: isToday && inMonth && !isPast && !isSelected
          ? `1.5px solid ${theme.palette.primary.main}`
          : '1.5px solid transparent',
        transition: 'background-color 0.15s ease, transform 0.1s ease',
        userSelect: 'none',
        '&:hover': clickable
          ? {
              backgroundColor: isSelected
                ? theme.palette.primary.dark
                : alpha(theme.palette.primary.main, 0.16),
            }
          : {},
      }}
    >
      <Typography
        sx={{
          fontWeight: isToday || isSelected ? 700 : 500,
          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
          lineHeight: 1,
          color: textColor,
          textDecoration: isPast && inMonth ? 'line-through' : 'none',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {format(day, 'd')}
      </Typography>
      {inMonth && !isPast && availableByDay && (
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 3, sm: 4 },
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: isSelected
              ? theme.palette.primary.contrastText
              : countsLoading && count === undefined
              ? alpha(theme.palette.text.disabled, 0.4)
              : hasSlots
              ? theme.palette.success.main
              : 'transparent',
          }}
        />
      )}
    </Box>
  );

  return (
    <Tooltip key={day.toISOString()} title={holidayName ? `Feriado — ${holidayName}` : ''} arrow>
      {cell}
    </Tooltip>
  );
}

interface SlotPanelProps {
  theme: Theme;
  selectedDate: Date | null;
  selectedSlot: string;
  slots: string[];
  slotsLoading: boolean;
  slotsError: string | null;
  nextAvailable: Date | null;
  onSelectSlot: (slot: string) => void;
  onJumpToNextAvailable: () => void;
}

function SlotPanel({
  theme,
  selectedDate,
  selectedSlot,
  slots,
  slotsLoading,
  slotsError,
  nextAvailable,
  onSelectSlot,
  onJumpToNextAvailable,
}: SlotPanelProps) {
  if (!selectedDate) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: `1px dashed ${theme.palette.divider}`,
          textAlign: 'center',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <CalendarMonthIcon sx={{ color: 'text.disabled', fontSize: 40 }} />
        <Typography variant="body2" color="text.secondary">
          Elegí un día del calendario para ver los horarios disponibles.
        </Typography>
      </Paper>
    );
  }

  const dateLabel = capitalize(
    format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
  );

  if (slotsLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Cargando horarios…
        </Typography>
      </Paper>
    );
  }

  if (slotsError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {slotsError}
      </Alert>
    );
  }

  if (slots.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          {dateLabel}
        </Typography>
        <Alert
          severity="warning"
          sx={{ borderRadius: 1.5, mt: 1 }}
          action={
            nextAvailable ? (
              <Button color="inherit" size="small" onClick={onJumpToNextAvailable}>
                Ver próxima fecha
              </Button>
            ) : undefined
          }
        >
          No hay horarios disponibles para esta fecha.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {dateLabel}
        </Typography>
        <Typography
          variant="caption"
          color="success.main"
          sx={{ fontWeight: 700, letterSpacing: 0.5 }}
        >
          {slots.length} {slots.length === 1 ? 'TURNO DISPONIBLE' : 'TURNOS DISPONIBLES'}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
          gap: 1,
        }}
      >
        {slots.map((slot) => {
          const slotDate = parseISO(slot);
          const isSelected = selectedSlot === slot;
          return (
            <Paper
              key={slot}
              elevation={0}
              onClick={() => onSelectSlot(slot)}
              sx={{
                py: 1.25,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isSelected
                  ? 'primary.main'
                  : alpha(theme.palette.primary.main, 0.06),
                border: `1.5px solid ${
                  isSelected
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.primary.main, 0.2)
                }`,
                borderRadius: 1.5,
                transition: 'all 0.15s ease',
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: isSelected
                    ? 'primary.dark'
                    : alpha(theme.palette.primary.main, 0.12),
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: isSelected ? 'primary.contrastText' : 'text.primary',
                  lineHeight: 1,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {format(slotDate, 'HH:mm')}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}
