import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Close,
  Description,
  EventNote,
  MedicalServices,
  Schedule,
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type {
  AddOfferedTreatmentRequestDTO,
  AvailabilitySlotDTO,
  OfferedTreatmentResponseDTO,
  TreatmentResponseDTO,
} from '../../../../types/practitioner.types';
import { findSlotConflicts } from '../../utils/slotValidation';
import AvailabilitySlotsField from './AvailabilitySlotsField';
import { useNonWorkingDays } from '../../../../hooks/useNonWorkingDays';
import { findOverlappingNonWorkingDays } from '../../../../utils/nonWorkingDayUtils';

type FormValues = {
  treatmentId: number | '';
  durationInMinutes: number;
  requirements: string;
  availabilitySlots: AvailabilitySlotDTO[];
  offerStartDate: string;
  offerEndDate: string;
  maxCompletedAttentions: number;
};

interface OfferWizardDialogProps {
  open: boolean;
  catalog: TreatmentResponseDTO[];
  alreadyOffered: OfferedTreatmentResponseDTO[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (data: AddOfferedTreatmentRequestDTO) => Promise<boolean>;
}

const STEPS = [
  { id: 0, title: 'Tratamiento', icon: <MedicalServices /> },
  { id: 1, title: 'Reglas', icon: <EventNote /> },
  { id: 2, title: 'Horarios', icon: <Schedule /> },
  { id: 3, title: 'Resumen', icon: <Description /> },
];

const TODAY = (): string => format(new Date(), 'yyyy-MM-dd');
const maxDate = (a: string, b: string): string => (a > b ? a : b);

const DEFAULT_VALUES: FormValues = {
  treatmentId: '',
  durationInMinutes: 30,
  requirements: '',
  availabilitySlots: [],
  offerStartDate: TODAY(),
  offerEndDate: '',
  maxCompletedAttentions: 10,
};

export default function OfferWizardDialog({
  open,
  catalog,
  alreadyOffered,
  submitting,
  onClose,
  onSubmit,
}: OfferWizardDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!open) {
      reset(DEFAULT_VALUES);
      setCurrentStep(0);
    }
  }, [open, reset]);

  // Only ACTIVE / PAUSED offers occupy the slot. Archived (INACTIVE)
  // offers don't compete with a new one for the same treatment.
  const availableTreatments = catalog.filter(
    (t) =>
      !alreadyOffered.some(
        (o) =>
          o.treatment.id === t.id &&
          (o.status === 'ACTIVE' || o.status === 'PAUSED')
      )
  );
  const hasArchivedForSlot = (treatmentId: number) =>
    alreadyOffered.some(
      (o) => o.treatment.id === treatmentId && o.status === 'INACTIVE'
    );
  const isCatalogEmpty = catalog.length === 0;
  const isAllOffered = catalog.length > 0 && availableTreatments.length === 0;
  const hasArchivedOnly =
    isAllOffered &&
    alreadyOffered.some((o) => o.status === 'INACTIVE');

  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 0) {
      return trigger('treatmentId');
    }
    if (currentStep === 1) {
      const ok = await trigger([
        'durationInMinutes',
        'maxCompletedAttentions',
        'offerStartDate',
        'offerEndDate',
      ]);
      const { offerStartDate, offerEndDate } = watch();
      if (offerStartDate && offerEndDate && new Date(offerStartDate) > new Date(offerEndDate)) {
        setError('offerEndDate', { message: 'La fecha de fin debe ser posterior al inicio' });
        return false;
      }
      clearErrors('offerEndDate');
      return ok;
    }
    if (currentStep === 2) {
      const slots = watch('availabilitySlots');
      if (slots.length === 0) {
        setError('availabilitySlots', { message: 'Agrega al menos un horario' });
        return false;
      }
      const conflicts = findSlotConflicts(slots);
      if (conflicts.length > 0) {
        setError('availabilitySlots', {
          message: 'Hay horarios inválidos o solapados — revisa los marcados en rojo',
        });
        return false;
      }
      clearErrors('availabilitySlots');
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    const ok = await validateCurrentStep();
    if (ok) setCurrentStep(Math.min(currentStep + 1, STEPS.length - 1));
  };

  const handleBack = () => setCurrentStep(Math.max(currentStep - 1, 0));

  const submitOffer = async (values: FormValues) => {
    const payload: AddOfferedTreatmentRequestDTO = {
      treatmentId: Number(values.treatmentId),
      durationInMinutes: Number(values.durationInMinutes),
      requirements: values.requirements?.trim() || undefined,
      availabilitySlots: values.availabilitySlots,
      offerStartDate: values.offerStartDate,
      offerEndDate: values.offerEndDate,
      maxCompletedAttentions: Number(values.maxCompletedAttentions),
    };
    const ok = await onSubmit(payload);
    if (ok) onClose();
  };

  const formValues = watch();
  const selectedTreatmentName = formValues.treatmentId
    ? catalog.find((t) => t.id === Number(formValues.treatmentId))?.name ?? ''
    : '';

  const nwdYears = useMemo(() => {
    const years: number[] = [];
    if (formValues.offerStartDate) years.push(parseInt(formValues.offerStartDate.substring(0, 4)));
    if (formValues.offerEndDate) years.push(parseInt(formValues.offerEndDate.substring(0, 4)));
    return [...new Set(years)];
  }, [formValues.offerStartDate, formValues.offerEndDate]);
  const { nonWorkingDays } = useNonWorkingDays(nwdYears);

  const overlappingNwd = useMemo(
    () =>
      findOverlappingNonWorkingDays(
        formValues.offerStartDate,
        formValues.offerEndDate,
        formValues.availabilitySlots,
        nonWorkingDays,
      ),
    [formValues.offerStartDate, formValues.offerEndDate, formValues.availabilitySlots, nonWorkingDays],
  );

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
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
      <DialogTitle
        sx={{
          pb: 2,
          pt: 2.5,
          px: { xs: 2, sm: 3 },
          bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MedicalServices sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Nueva oferta
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configura tu oferta paso a paso
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={submitting} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Stepper activeStep={currentStep} alternativeLabel>
              {STEPS.map((s) => (
                <Step key={s.id}>
                  <StepLabel>{s.title}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Paso {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={((currentStep + 1) / STEPS.length) * 100}
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>
        {/* STEP 0 — TREATMENT */}
        {currentStep === 0 && (
          isCatalogEmpty ? (
            <Alert severity="info">No hay tratamientos en el catálogo general.</Alert>
          ) : isAllOffered ? (
            hasArchivedOnly ? (
              <Alert severity="info">
                Tenés ofertas archivadas para todos los tratamientos disponibles.
                Reactivá una desde tu catálogo en lugar de crear una nueva.
              </Alert>
            ) : (
              <Alert severity="success">
                Ya estás ofreciendo todos los tratamientos disponibles.
              </Alert>
            )
          ) : (
            <Controller
              control={control}
              name="treatmentId"
              rules={{ required: 'Selecciona un tratamiento' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Tratamiento"
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? 'Tratamientos que aún no ofreces.'}
                >
                  {availableTreatments.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name} ({t.area})
                      {hasArchivedForSlot(t.id) && (
                        <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                          · tienes una archivada
                        </Box>
                      )}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )
        )}

        {/* STEP 1 — RULES */}
        {currentStep === 1 && (
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              <Controller
                control={control}
                name="maxCompletedAttentions"
                rules={{ required: 'Requerido', min: { value: 1, message: 'Mínimo 1' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Cupo de atenciones"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? 'Nº máximo de atenciones a completar.'}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
              <Controller
                control={control}
                name="durationInMinutes"
                rules={{ required: 'Requerido', min: { value: 15, message: 'Mínimo 15 min' } }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Duración (min)"
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? 'Duración estimada por turno.'}
                    inputProps={{ min: 15, step: 15 }}
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Período de la oferta *
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <Controller
                  control={control}
                  name="offerStartDate"
                  rules={{ required: 'Selecciona la fecha de inicio' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Fecha inicio"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: TODAY() }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="offerEndDate"
                  rules={{ required: 'Selecciona la fecha de fin' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Fecha fin"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: maxDate(TODAY(), formValues.offerStartDate || TODAY()),
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>
            </Box>
          </Stack>
        )}

        {/* STEP 2 — SLOTS */}
        {currentStep === 2 && (
          <AvailabilitySlotsField control={control} errors={errors} />
        )}

        {/* STEP 3 — SUMMARY + REQUIREMENTS */}
        {currentStep === 3 && (
          <Stack spacing={2.5}>
            <Controller
              control={control}
              name="requirements"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Indicaciones para el paciente (opcional)"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Ej: Traer cepillo propio, no requiere ayuno…"
                  helperText="Se mostrarán al paciente antes de reservar."
                />
              )}
            />
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: 'primary.light',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" gutterBottom>
                Resumen
              </Typography>
              <Stack spacing={0.75}>
                <Typography variant="body2">
                  <strong>Tratamiento:</strong> {selectedTreatmentName || '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Duración:</strong> {formValues.durationInMinutes} min
                </Typography>
                <Typography variant="body2">
                  <strong>Cupo:</strong> {formValues.maxCompletedAttentions} atenciones
                </Typography>
                <Typography variant="body2">
                  <strong>Período:</strong> {formValues.offerStartDate} — {formValues.offerEndDate}
                </Typography>
                <Typography variant="body2">
                  <strong>Horarios:</strong> {formValues.availabilitySlots.length} bloque(s)
                </Typography>
              </Stack>
            </Paper>
            {overlappingNwd.length > 0 && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  {overlappingNwd.length === 1
                    ? '1 día no laborable dentro del período:'
                    : `${overlappingNwd.length} días no laborables dentro del período:`}
                </Typography>
                {overlappingNwd.map((nwd) => (
                  <Typography key={nwd.date} variant="body2">
                    {format(parseISO(nwd.date), "EEEE d 'de' MMM", { locale: es })} — {nwd.name}
                  </Typography>
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Esos días no estarán disponibles para turnos.
                </Typography>
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: (t) => alpha(t.palette.background.default, 0.5),
          gap: 1.5,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={handleBack}
          disabled={currentStep === 0 || submitting}
          variant="outlined"
          startIcon={<ChevronLeft />}
          fullWidth={isMobile}
        >
          Anterior
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={<ChevronRight />}
            disabled={isCatalogEmpty || isAllOffered}
            fullWidth={isMobile}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit(submitOffer)}
            variant="contained"
            color="success"
            startIcon={<Check />}
            disabled={submitting}
            fullWidth={isMobile}
          >
            {submitting ? 'Creando…' : 'Crear oferta'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

