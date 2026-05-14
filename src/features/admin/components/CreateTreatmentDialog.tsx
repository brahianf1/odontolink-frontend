import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Autocomplete,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { createMasterTreatment } from '../../../services/api/treatmentService';
import type {
  CreateTreatmentRequestDTO,
  TreatmentResponseDTO,
} from '../../../types/practitioner.types';
import {
  collectErrors,
  validateTreatmentArea,
  validateTreatmentDescription,
  validateTreatmentName,
} from '../utils/validation';

interface CreateTreatmentDialogProps {
  open: boolean;
  existingAreas: string[];
  onClose: () => void;
  onSuccess: (treatment: TreatmentResponseDTO) => void;
}

interface FormState {
  name: string;
  description: string;
  area: string;
}

const EMPTY_STATE: FormState = { name: '', description: '', area: '' };

export default function CreateTreatmentDialog({
  open,
  existingAreas,
  onClose,
  onSuccess,
}: CreateTreatmentDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_STATE);
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
    setSubmitError(null);
  };

  const validate = (): Record<string, string> =>
    collectErrors({
      name: validateTreatmentName(form.name),
      description: validateTreatmentDescription(form.description),
      area: validateTreatmentArea(form.area),
    });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateTreatmentRequestDTO = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        area: form.area.trim() || undefined,
      };
      const created = await createMasterTreatment(payload);
      onSuccess(created);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'No se pudo crear el tratamiento. Intenta nuevamente.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const descriptionLength = form.description.length;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Nuevo tratamiento
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Agregar una entrada al catálogo maestro institucional.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <TextField
              fullWidth
              required
              autoFocus
              label="Nombre"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name || `${form.name.length}/100`}
              disabled={submitting}
              inputProps={{ maxLength: 100 }}
            />

            <Autocomplete
              freeSolo
              options={existingAreas}
              value={form.area}
              onChange={(_event, newValue) => handleChange('area', newValue ?? '')}
              onInputChange={(_event, newValue) => handleChange('area', newValue)}
              disabled={submitting}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Área"
                  placeholder="Ej.: Ortodoncia"
                  error={!!errors.area}
                  helperText={
                    errors.area ||
                    'Opcional. Elegí un área existente o escribí una nueva.'
                  }
                  inputProps={{ ...params.inputProps, maxLength: 50 }}
                />
              )}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              label="Descripción"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={!!errors.description}
              helperText={
                errors.description ||
                `Opcional. Visible para pacientes y practicantes. ${descriptionLength}/500`
              }
              disabled={submitting}
              inputProps={{ maxLength: 500 }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Crear tratamiento
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
