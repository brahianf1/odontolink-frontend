import { useEffect, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  HomeOutlined as HomeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import {
  personalInfoSchema,
  type PersonalInfoFormValues,
} from '../schemas/profile.schemas';
import { getMaxBirthDate } from '../../../utils/birthDateValidation';
import { updateMyProfile } from '../../../services/api/profileService';
import { useAuthStore } from '../../../store/authStore';
import type {
  MyProfileDTO,
  UpdateMyProfileRequestDTO,
} from '../../../types/profile.types';
import {
  extractFieldErrors,
  formatRetryMessage,
  getErrorMessage,
  getRetryAfterSeconds,
  getValidationDetails,
  isStatusCode,
} from '../utils/apiErrors';

interface PersonalInfoFormProps {
  profile: MyProfileDTO;
  onProfileUpdated: (profile: MyProfileDTO) => void;
}

const FIELD_NAMES: Record<string, keyof PersonalInfoFormValues> = {
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  birthDate: 'birthDate',
  address: 'address',
};

const buildDefaults = (profile: MyProfileDTO): PersonalInfoFormValues => ({
  email: profile.email ?? '',
  firstName: profile.firstName ?? '',
  lastName: profile.lastName ?? '',
  phone: profile.phone ?? '',
  birthDate: profile.birthDate ?? '',
  address: profile.address ?? '',
});

const buildPayload = (values: PersonalInfoFormValues): UpdateMyProfileRequestDTO => ({
  email: values.email.trim(),
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  phone: values.phone.trim() === '' ? null : values.phone.trim(),
  birthDate: values.birthDate === '' ? null : values.birthDate,
  address: values.address.trim() === '' ? null : values.address.trim(),
});

export function PersonalInfoForm({
  profile,
  onProfileUpdated,
}: PersonalInfoFormProps) {
  const updateUser = useAuthStore((state) => state.updateUser);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: buildDefaults(profile),
    mode: 'onBlur',
  });

  useEffect(() => {
    reset(buildDefaults(profile));
  }, [profile, reset]);

  const onSubmit: SubmitHandler<PersonalInfoFormValues> = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await updateMyProfile(buildPayload(values));
      updateUser({
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        profilePictureUrl: updated.profilePictureUrl ?? null,
      });
      onProfileUpdated(updated);
      reset(buildDefaults(updated));
      setSuccess(true);
    } catch (err) {
      if (isStatusCode(err, 409)) {
        setError('email', {
          type: 'server',
          message:
            getErrorMessage(err, 'Este correo ya pertenece a otra cuenta.') ||
            'Este correo ya pertenece a otra cuenta.',
        });
        return;
      }
      if (isStatusCode(err, 400)) {
        const fieldErrors = extractFieldErrors(getValidationDetails(err));
        let mapped = false;
        for (const [field, message] of Object.entries(fieldErrors)) {
          const target = FIELD_NAMES[field];
          if (target) {
            setError(target, { type: 'server', message });
            mapped = true;
          }
        }
        if (!mapped) {
          setFormError(getErrorMessage(err, 'Los datos enviados no son válidos.'));
        }
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
      setFormError(getErrorMessage(err, 'No se pudo actualizar tu perfil.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          Datos personales
        </Typography>

        {formError ? <Alert severity="error">{formError}</Alert> : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                required
                disabled={submitting}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Apellido"
                fullWidth
                required
                disabled={submitting}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>

        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="email"
              label="Correo electrónico"
              fullWidth
              required
              disabled={submitting}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              inputProps={{ maxLength: 100 }}
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Teléfono"
                fullWidth
                disabled={submitting}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message || 'Opcional. Solo números, espacios y + ( ) -'
                }
                inputProps={{ maxLength: 20, inputMode: 'tel' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name="birthDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="date"
                label="Fecha de nacimiento"
                fullWidth
                disabled={submitting}
                error={!!fieldState.error}
                helperText={fieldState.error?.message || 'Opcional'}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: getMaxBirthDate() }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>

        <Controller
          name="address"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Dirección"
              fullWidth
              disabled={submitting}
              error={!!fieldState.error}
              helperText={fieldState.error?.message || 'Opcional'}
              inputProps={{ maxLength: 255 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            type="button"
            variant="text"
            disabled={submitting || !isDirty}
            onClick={() => {
              reset(buildDefaults(profile));
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
          Perfil actualizado correctamente.
        </Alert>
      </Snackbar>
    </Box>
  );
}
