import { useEffect, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AssignmentInd as AssignmentIcon,
  Bloodtype as BloodIcon,
  HealthAndSafety as HealthIcon,
  School as SchoolIcon,
  WorkOutline as WorkIcon,
} from '@mui/icons-material';
import {
  patientDetailsSchema,
  supervisorDetailsSchema,
  type PatientDetailsFormValues,
  type SupervisorDetailsFormValues,
} from '../schemas/profile.schemas';
import {
  updatePatientDetails,
  updateSupervisorDetails,
} from '../../../services/api/profileService';
import {
  BLOOD_TYPES,
  type BloodType,
  type MyDetailsDTO,
  type PatientDetailsDTO,
  type PractitionerDetailsDTO,
  type SupervisorDetailsDTO,
  type UpdatePatientDetailsRequestDTO,
  type UpdateSupervisorDetailsRequestDTO,
} from '../../../types/profile.types';
import {
  formatRetryMessage,
  getErrorMessage,
  getRetryAfterSeconds,
  isStatusCode,
} from '../utils/apiErrors';

interface RoleSpecificFormProps {
  details: MyDetailsDTO;
  onUpdated: () => Promise<unknown> | void;
}

export function RoleSpecificForm({ details, onUpdated }: RoleSpecificFormProps) {
  switch (details.role) {
    case 'ROLE_PATIENT':
      return <PatientDetailsForm details={details} onUpdated={onUpdated} />;
    case 'ROLE_PRACTITIONER':
      return <PractitionerDetailsView details={details} />;
    case 'ROLE_SUPERVISOR':
      return <SupervisorDetailsForm details={details} onUpdated={onUpdated} />;
    case 'ROLE_ADMIN':
      return null;
    default:
      return null;
  }
}

function PatientDetailsForm({
  details,
  onUpdated,
}: {
  details: PatientDetailsDTO;
  onUpdated: () => Promise<unknown> | void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const defaults: PatientDetailsFormValues = {
    healthInsurance: details.healthInsurance ?? '',
    bloodType: (details.bloodType ?? '') as PatientDetailsFormValues['bloodType'],
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = useForm<PatientDetailsFormValues>({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues: defaults,
    mode: 'onBlur',
  });

  useEffect(() => {
    reset({
      healthInsurance: details.healthInsurance ?? '',
      bloodType: (details.bloodType ?? '') as PatientDetailsFormValues['bloodType'],
    });
  }, [details, reset]);

  const onSubmit: SubmitHandler<PatientDetailsFormValues> = async (values) => {
    const payload: UpdatePatientDetailsRequestDTO = {};
    if (dirtyFields.healthInsurance) {
      const trimmed = values.healthInsurance.trim();
      payload.healthInsurance = trimmed === '' ? null : trimmed;
    }
    if (dirtyFields.bloodType) {
      payload.bloodType = values.bloodType === '' ? null : (values.bloodType as BloodType);
    }
    if (Object.keys(payload).length === 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await updatePatientDetails(payload);
      await onUpdated();
      setSuccess(true);
    } catch (err) {
      if (isStatusCode(err, 429)) {
        setFormError(
          formatRetryMessage(
            getRetryAfterSeconds(err),
            'Demasiados intentos. Intentá nuevamente en unos minutos.'
          )
        );
      } else {
        setFormError(getErrorMessage(err, 'No se pudieron guardar los datos médicos.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Datos médicos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Información que ayuda al equipo clínico a tomar mejores decisiones.
          </Typography>
        </Box>

        {formError ? <Alert severity="error">{formError}</Alert> : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="healthInsurance"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Obra social"
                fullWidth
                disabled={submitting}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ||
                  'Opcional. Dejá el campo vacío para limpiarlo.'
                }
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HealthIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name="bloodType"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Grupo sanguíneo"
                fullWidth
                disabled={submitting}
                error={!!fieldState.error}
                helperText={fieldState.error?.message || 'Opcional'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BloodIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">Sin especificar</MenuItem>
                {BLOOD_TYPES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            type="button"
            variant="text"
            disabled={submitting || !isDirty}
            onClick={() => {
              reset(defaults);
              setFormError(null);
            }}
          >
            Descartar cambios
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isDirty || Object.keys(errors).length > 0}
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            Guardar cambios
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Datos médicos actualizados.
        </Alert>
      </Snackbar>
    </Box>
  );
}

function SupervisorDetailsForm({
  details,
  onUpdated,
}: {
  details: SupervisorDetailsDTO;
  onUpdated: () => Promise<unknown> | void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const defaults: SupervisorDetailsFormValues = {
    specialty: details.specialty ?? '',
  };

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, errors },
  } = useForm<SupervisorDetailsFormValues>({
    resolver: zodResolver(supervisorDetailsSchema),
    defaultValues: defaults,
    mode: 'onBlur',
  });

  useEffect(() => {
    reset({ specialty: details.specialty ?? '' });
  }, [details, reset]);

  const onSubmit: SubmitHandler<SupervisorDetailsFormValues> = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload: UpdateSupervisorDetailsRequestDTO = {
        specialty: values.specialty.trim(),
      };
      await updateSupervisorDetails(payload);
      await onUpdated();
      setSuccess(true);
    } catch (err) {
      if (isStatusCode(err, 422)) {
        setError('specialty', {
          type: 'server',
          message: getErrorMessage(err, 'La especialidad no puede quedar vacía.'),
        });
        return;
      }
      if (isStatusCode(err, 429)) {
        setFormError(
          formatRetryMessage(
            getRetryAfterSeconds(err),
            'Demasiados intentos. Intentá nuevamente en unos minutos.'
          )
        );
        return;
      }
      setFormError(getErrorMessage(err, 'No se pudieron guardar los datos docentes.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Datos docentes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Información profesional asociada a tu rol de supervisor.
          </Typography>
        </Box>

        {formError ? <Alert severity="error">{formError}</Alert> : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="specialty"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Especialidad"
                fullWidth
                required
                disabled={submitting}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <TextField
            label="Legajo docente"
            fullWidth
            value={details.employeeId ?? ''}
            disabled
            helperText="Identificador asignado por la institución. No editable."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AssignmentIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            type="button"
            variant="text"
            disabled={submitting || !isDirty}
            onClick={() => {
              reset(defaults);
              setFormError(null);
            }}
          >
            Descartar cambios
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isDirty || Object.keys(errors).length > 0}
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            Guardar cambios
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Datos docentes actualizados.
        </Alert>
      </Snackbar>
    </Box>
  );
}

function PractitionerDetailsView({ details }: { details: PractitionerDetailsDTO }) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" fontWeight={700}>
          Datos académicos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tu identidad académica es gestionada por la facultad.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Legajo / Matrícula"
          fullWidth
          value={details.studentId ?? ''}
          disabled
          helperText="Asignado por la institución. No editable."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AssignmentIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Año de cursado"
          fullWidth
          value={details.studyYear ? `${details.studyYear}° Año` : ''}
          disabled
          helperText="Asignado por la institución. No editable."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SchoolIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Alert severity="info" variant="outlined">
        Para modificar tu legajo o año académico, contactá a un supervisor o
        administrador del sistema.
      </Alert>
    </Stack>
  );
}
