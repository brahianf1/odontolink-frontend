import { useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close, MedicalServices } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import type {
  AvailabilitySlotDTO,
  OfferedTreatmentResponseDTO,
  UpdateOfferedTreatmentRequestDTO,
} from '../../../../types/practitioner.types';
import { findSlotConflicts } from '../../utils/slotValidation';
import AvailabilitySlotsField from './AvailabilitySlotsField';

interface OfferEditDialogProps {
  open: boolean;
  offer: OfferedTreatmentResponseDTO | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateOfferedTreatmentRequestDTO) => Promise<boolean>;
}

type FormValues = {
  requirements: string;
  durationInMinutes: number;
  availabilitySlots: AvailabilitySlotDTO[];
  offerStartDate: string;
  offerEndDate: string;
  maxCompletedAttentions: number;
};

const toFormValues = (offer: OfferedTreatmentResponseDTO | null): FormValues => ({
  requirements: offer?.requirements ?? '',
  durationInMinutes: offer?.durationInMinutes ?? 30,
  availabilitySlots: offer?.availabilitySlots ?? [],
  offerStartDate: offer?.offerStartDate ?? '',
  offerEndDate: offer?.offerEndDate ?? '',
  maxCompletedAttentions: offer?.maxCompletedAttentions ?? 10,
});

export default function OfferEditDialog({
  open,
  offer,
  submitting,
  onClose,
  onSubmit,
}: OfferEditDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: toFormValues(offer),
    mode: 'onChange',
  });

  useEffect(() => {
    reset(toFormValues(offer));
  }, [offer, reset]);

  const submit = async (values: FormValues) => {
    if (!offer) return;

    if (values.offerStartDate && values.offerEndDate &&
        new Date(values.offerStartDate) > new Date(values.offerEndDate)) {
      setError('offerEndDate', { message: 'La fecha de fin debe ser posterior al inicio' });
      return;
    }

    if (values.availabilitySlots.length === 0) {
      setError('availabilitySlots', { message: 'Agrega al menos un horario' });
      return;
    }

    const conflicts = findSlotConflicts(values.availabilitySlots);
    if (conflicts.length > 0) {
      setError('availabilitySlots', {
        message: 'Hay horarios inválidos o solapados — revisa los marcados en rojo',
      });
      return;
    }

    clearErrors();

    const payload: UpdateOfferedTreatmentRequestDTO = {
      requirements: values.requirements?.trim() || undefined,
      durationInMinutes: Number(values.durationInMinutes),
      availabilitySlots: values.availabilitySlots,
      offerStartDate: values.offerStartDate,
      offerEndDate: values.offerEndDate,
      maxCompletedAttentions: Number(values.maxCompletedAttentions),
    };

    const ok = await onSubmit(offer.id, payload);
    if (ok) onClose();
  };

  const startDate = watch('offerStartDate');

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 } },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          pt: 2.5,
          px: { xs: 2, sm: 3 },
          bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MedicalServices sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Editar oferta
            </Typography>
            {offer && (
              <Typography variant="caption" color="text.secondary">
                {offer.treatment.name}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={submitting} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
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
                  helperText={fieldState.error?.message ?? 'Atenciones máximas a completar.'}
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
                    inputProps={{ min: startDate }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>
          </Box>

          <Controller
            control={control}
            name="requirements"
            render={({ field }) => (
              <TextField
                {...field}
                label="Indicaciones para el paciente"
                fullWidth
                multiline
                rows={3}
                placeholder="Ej: Traer cepillo propio, no requiere ayuno…"
              />
            )}
          />

          <AvailabilitySlotsField control={control} errors={errors} />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: (t) => alpha(t.palette.background.default, 0.5),
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          gap: 1.5,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}
      >
        <Button onClick={onClose} variant="outlined" disabled={submitting} fullWidth={isMobile}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(submit)}
          variant="contained"
          disabled={submitting}
          fullWidth={isMobile}
        >
          {submitting ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
