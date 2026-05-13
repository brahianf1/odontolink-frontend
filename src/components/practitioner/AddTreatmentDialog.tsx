import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
  Alert,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  MedicalServices,
  Add,
  Delete,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  EventNote,
  Schedule,
  Description,
} from '@mui/icons-material';
import type {
  TreatmentResponseDTO,
  OfferedTreatmentResponseDTO,
  AddOfferedTreatmentRequestDTO,
  AvailabilitySlotDTO,
} from '../../types/practitioner.types';

// --- Constantes ---
const DIAS_SEMANA_MAP: Record<string, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

const STEPS = [
  { id: 1, title: 'Tratamiento', icon: <MedicalServices /> },
  { id: 2, title: 'Reglas de la Oferta', icon: <EventNote /> },
  { id: 3, title: 'Horarios', icon: <Schedule /> },
  { id: 4, title: 'Indicaciones', icon: <Description /> },
];

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface AddTreatmentDialogProps {
  open: boolean;
  onClose: () => void;
  masterTreatments: TreatmentResponseDTO[];
  offeredTreatments: OfferedTreatmentResponseDTO[];
  onSubmit: (data: AddOfferedTreatmentRequestDTO) => Promise<void>;
}

export default function AddTreatmentDialog({
  open,
  onClose,
  masterTreatments,
  offeredTreatments,
  onSubmit,
}: AddTreatmentDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --- Estados del stepper ---
  const [currentStep, setCurrentStep] = useState(0);

  // --- Estados del formulario ---
  const [treatmentId, setTreatmentId] = useState<number | ''>('');
  const [durationInMinutes, setDurationInMinutes] = useState<number>(30);
  const [requirements, setRequirements] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlotDTO[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [patientQuota, setPatientQuota] = useState<number>(10);

  // --- Estados para inputs de horario ---
  const [currentDay, setCurrentDay] = useState<DayOfWeek>('MONDAY');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('12:00');

  // --- Estados de validación ---
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Tratamientos disponibles ---
  const availableTreatments = masterTreatments.filter(
    (mt) => !offeredTreatments.some((ot) => ot.treatment.id === mt.id)
  );
  const isCatalogEmpty = masterTreatments.length === 0;
  const isAllOffered = masterTreatments.length > 0 && availableTreatments.length === 0;

  // --- Reset al cerrar ---
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setTreatmentId('');
      setDurationInMinutes(30);
      setRequirements('');
      setSlots([]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setPatientQuota(10);
      setCurrentDay('MONDAY');
      setSlotStartTime('09:00');
      setSlotEndTime('12:00');
      setFieldErrors({});
      setSubmitError(null);
      setSubmitting(false);
    }
  }, [open]);

  // --- Validación por paso ---
  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Tratamiento
        if (!treatmentId) {
          errors.treatment = 'Selecciona un tratamiento para continuar';
        }
        break;
      case 1: // Reglas
        if (!patientQuota || patientQuota < 1) {
          errors.quota = 'Indica cuántos pacientes atenderás';
        }
        if (!durationInMinutes || durationInMinutes < 15) {
          errors.duration = 'La duración mínima es 15 minutos';
        }
        if (!startDate) {
          errors.startDate = 'Selecciona la fecha de inicio';
        }
        if (!endDate) {
          errors.endDate = 'Selecciona la fecha de finalización';
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          errors.endDate = 'La fecha de fin debe ser posterior al inicio';
        }
        break;
      case 2: // Horarios
        if (slots.length === 0) {
          errors.slots = 'Añade al menos un horario de atención';
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Navegación ---
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[fieldName];
      setFieldErrors(newErrors);
    }
  };

  // --- Lógica de horarios ---
  const handleAddSlot = () => {
    if (!currentDay || !slotStartTime || !slotEndTime) return;
    if (slotStartTime >= slotEndTime) {
      setFieldErrors({ ...fieldErrors, timeRange: 'La hora de inicio debe ser anterior a la de fin' });
      return;
    }
    clearFieldError('timeRange');
    clearFieldError('slots');
    const newSlot: AvailabilitySlotDTO = {
      dayOfWeek: currentDay,
      startTime: `${slotStartTime}:00`,
      endTime: `${slotEndTime}:00`,
    };
    setSlots([...slots, newSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  // --- Envío final ---
  const handleSubmit = async () => {
    if (!validateStep()) return;

    const dataToSubmit: AddOfferedTreatmentRequestDTO = {
      treatmentId: Number(treatmentId),
      durationInMinutes: Number(durationInMinutes),
      requirements: requirements || undefined,
      availabilitySlots: slots,
      offerStartDate: startDate,
      offerEndDate: endDate,
      maxCompletedAttentions: Number(patientQuota),
    };

    try {
      setSubmitting(true);
      setSubmitError(null);
      await onSubmit(dataToSubmit);
      onClose();
    } catch (err: any) {
      console.error('Error al crear oferta:', err);
      setSubmitError(err?.message || 'Error al crear la oferta. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Obtener nombre del tratamiento seleccionado ---
  const selectedTreatmentName = treatmentId
    ? masterTreatments.find((t) => t.id === treatmentId)?.name || ''
    : '';

  // --- Renderizado de pasos ---
  const renderStep = () => {
    switch (currentStep) {
      // ========== PASO 1: Selección de tratamiento ==========
      case 0:
        if (isCatalogEmpty) {
          return (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
              }}
            >
              <Info sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Catálogo no disponible
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No se encontraron tratamientos en el catálogo general.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Esto puede pasar si el catálogo aún no cargó o si el backend no devolvió tratamientos.
              </Typography>
            </Paper>
          );
        }

        if (isAllOffered) {
          return (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'success.light',
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
              }}
            >
              <Check sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ¡Excelente trabajo!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ya estás ofreciendo todos los tratamientos disponibles en el catálogo.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Para agregar nuevos tratamientos, primero debes esperar a que se agreguen más opciones al catálogo general.
              </Typography>
            </Paper>
          );
        }

        return (
          <Box>
            <TextField
              select
              label="Tratamiento"
              value={treatmentId}
              onChange={(e) => {
                setTreatmentId(Number(e.target.value));
                clearFieldError('treatment');
              }}
              fullWidth
              required
              error={!!fieldErrors.treatment}
              helperText={
                fieldErrors.treatment ||
                'Elige el procedimiento que vas a ofrecer. Los tratamientos que ya ofreces no aparecen en esta lista.'
              }
            >
              {availableTreatments.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} ({t.area})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );

      // ========== PASO 2: Reglas de la oferta ==========
      case 1:
        return (
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              <TextField
                label="Cupo de Pacientes"
                type="number"
                value={patientQuota}
                onChange={(e) => {
                  setPatientQuota(Number(e.target.value));
                  clearFieldError('quota');
                }}
                fullWidth
                required
                error={!!fieldErrors.quota}
                helperText={fieldErrors.quota || 'Nº de atenciones a completar.'}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Duración (minutos)"
                type="number"
                value={durationInMinutes}
                onChange={(e) => {
                  setDurationInMinutes(Number(e.target.value));
                  clearFieldError('duration');
                }}
                fullWidth
                required
                error={!!fieldErrors.duration}
                helperText={fieldErrors.duration || 'Tiempo estimado por atención.'}
                inputProps={{ min: 15, step: 15 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Período de la oferta *
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <TextField
                  label="Fecha inicio"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    clearFieldError('startDate');
                    clearFieldError('endDate');
                  }}
                  fullWidth
                  required
                  error={!!fieldErrors.startDate}
                  helperText={fieldErrors.startDate}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', display: { xs: 'none', sm: 'block' } }}
                >
                  hasta
                </Typography>
                <TextField
                  label="Fecha fin"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    clearFieldError('endDate');
                  }}
                  fullWidth
                  required
                  error={!!fieldErrors.endDate}
                  helperText={fieldErrors.endDate}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: startDate }}
                />
              </Box>
              {!fieldErrors.startDate && !fieldErrors.endDate && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  <Info sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Los turnos se ofrecerán solo dentro de este rango de fechas.
                </Typography>
              )}
            </Box>
          </Stack>
        );

      // ========== PASO 3: Horarios semanales ==========
      case 2:
        return (
          <Stack spacing={3}>
            {/* Input para agregar bloque de horario */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Añadir un bloque de horario
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: fieldErrors.timeRange ? 'error.main' : 'divider',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Día de la semana"
                    value={currentDay}
                    onChange={(e) => setCurrentDay(e.target.value as DayOfWeek)}
                    fullWidth
                    size="small"
                  >
                    {Object.entries(DIAS_SEMANA_MAP).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr auto' },
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <TextField
                      label="Hora inicio"
                      type="time"
                      value={slotStartTime}
                      onChange={(e) => {
                        setSlotStartTime(e.target.value);
                        clearFieldError('timeRange');
                      }}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldErrors.timeRange}
                      inputProps={{ step: 1800 }}
                    />
                    <TextField
                      label="Hora fin"
                      type="time"
                      value={slotEndTime}
                      onChange={(e) => {
                        setSlotEndTime(e.target.value);
                        clearFieldError('timeRange');
                      }}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldErrors.timeRange}
                      inputProps={{ step: 1800 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddSlot}
                      startIcon={<Add />}
                      size="small"
                      sx={{
                        gridColumn: { xs: '1 / -1', sm: 'auto' },
                        minWidth: 'auto',
                      }}
                    >
                      Añadir
                    </Button>
                  </Box>
                </Stack>
                {fieldErrors.timeRange && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {fieldErrors.timeRange}
                  </Typography>
                )}
              </Paper>
            </Box>

            {/* Lista de horarios agregados */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Horarios configurados ({slots.length})
              </Typography>

              {slots.length === 0 ? (
                <Alert
                  severity={fieldErrors.slots ? 'error' : 'info'}
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {fieldErrors.slots || 'Añade los días y horas en que atenderás.'}
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {slots.map((slot, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        px: 2,
                        py: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip
                          label={DIAS_SEMANA_MAP[slot.dayOfWeek]}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        <Typography variant="body2">
                          {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveSlot(index)}
                        aria-label="Eliminar horario"
                        sx={{
                          '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        );

      // ========== PASO 4: Indicaciones ==========
      case 3:
        return (
          <Box>
            <TextField
              label="Requerimientos especiales (opcional)"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Ej: El paciente debe venir con un acompañante, no requiere ayuno, etc."
              helperText="Estas indicaciones las verá el paciente antes de reservar el turno."
            />

            {/* Resumen de la configuración */}
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2.5,
                border: '1px solid',
                borderColor: 'primary.light',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" gutterBottom>
                Resumen de tu oferta
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Tratamiento:</strong> {selectedTreatmentName}
                </Typography>
                <Typography variant="body2">
                  <strong>Duración:</strong> {durationInMinutes} minutos
                </Typography>
                <Typography variant="body2">
                  <strong>Cupo:</strong> {patientQuota} pacientes
                </Typography>
                <Typography variant="body2">
                  <strong>Período:</strong> {startDate} — {endDate}
                </Typography>
                <Typography variant="body2">
                  <strong>Horarios:</strong> {slots.length} bloque(s) configurado(s)
                </Typography>
                {requirements && (
                  <Typography variant="body2">
                    <strong>Indicaciones:</strong> {requirements}
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          m: { xs: 0, sm: 2 },
          maxHeight: { sm: '90vh' },
        },
      }}
    >
      {/* --- Header --- */}
      <DialogTitle
        sx={{
          pb: 2,
          pt: 2.5,
          px: { xs: 2, sm: 3 },
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MedicalServices sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
          <Box>
            <Typography variant="h6" fontWeight={700} fontSize={{ xs: '1.1rem', sm: '1.25rem' }}>
              Nueva Oferta
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completa los pasos para configurar tu oferta
            </Typography>
          </Box>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="cerrar"
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      {/* --- Stepper --- */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: 2.5,
          pb: 1,
        }}
      >
        {/* Desktop Stepper */}
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {STEPS.map((step) => (
              <Step key={step.id}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Mobile Progress */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
            Paso {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={((currentStep + 1) / STEPS.length) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
              },
            }}
          />
        </Box>
      </Box>

      {/* --- Contenido del paso --- */}
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 2 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}
        {renderStep()}
      </DialogContent>

      {/* --- Footer con navegación --- */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          gap: 1.5,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={handleBack}
          disabled={currentStep === 0}
          variant="outlined"
          startIcon={<ChevronLeft />}
          fullWidth={isMobile}
          sx={{
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1,
          }}
        >
          Anterior
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={<ChevronRight />}
            disabled={currentStep === 0 && availableTreatments.length === 0}
            fullWidth={isMobile}
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            startIcon={<Check />}
            disabled={submitting}
            fullWidth={isMobile}
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            {submitting ? 'Creando...' : 'Crear Oferta'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
