import { useState } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { LockReset as LockResetIcon } from '@mui/icons-material';
import {
  changeMyPasswordSchema,
  type ChangePasswordFormValues,
} from '../schemas/profile.schemas';
import { changeMyPassword } from '../../../services/api/profileService';
import { useAuthStore } from '../../../store/authStore';
import { PasswordField } from './PasswordField';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import {
  extractFieldErrors,
  formatRetryMessage,
  getErrorMessage,
  getRetryAfterSeconds,
  getValidationDetails,
  isErrorDiscriminator,
  isStatusCode,
} from '../utils/apiErrors';

const FIELD_NAMES: Record<string, keyof ChangePasswordFormValues> = {
  currentPassword: 'currentPassword',
  newPassword: 'newPassword',
  confirmNewPassword: 'confirmNewPassword',
};

const DEFAULT_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

export function SecurityForm() {
  const loginStore = useAuthStore((state) => state.login);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changeMyPasswordSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const newPasswordValue = useWatch({ control, name: 'newPassword' });

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const jwt = await changeMyPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      loginStore(jwt);
      reset(DEFAULT_VALUES);
      setSuccess(true);
    } catch (err) {
      if (isErrorDiscriminator(err, 'Incorrect Current Password')) {
        setError('currentPassword', {
          type: 'server',
          message: getErrorMessage(err, 'La contraseña actual es incorrecta.'),
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
      if (isStatusCode(err, 422)) {
        setFormError(
          getErrorMessage(err, 'No se pudo cambiar la contraseña.')
        );
        return;
      }
      if (isStatusCode(err, 429)) {
        setFormError(
          formatRetryMessage(
            getRetryAfterSeconds(err),
            'Demasiados intentos. Intentá nuevamente más tarde.'
          )
        );
        return;
      }
      setFormError(getErrorMessage(err, 'No se pudo cambiar la contraseña.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Cambiar contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresá tu contraseña actual y elegí una nueva con al menos 8 caracteres.
          </Typography>
        </Box>

        {formError ? <Alert severity="error">{formError}</Alert> : null}

        <Controller
          name="currentPassword"
          control={control}
          render={({ field, fieldState }) => (
            <PasswordField
              {...field}
              label="Contraseña actual"
              fullWidth
              required
              disabled={submitting}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              autoComplete="current-password"
            />
          )}
        />

        <Box>
          <Controller
            name="newPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                {...field}
                label="Nueva contraseña"
                fullWidth
                required
                disabled={submitting}
                error={!!fieldState.error}
                helperText={fieldState.error?.message || 'Mínimo 8 caracteres'}
                autoComplete="new-password"
                inputProps={{ maxLength: 128 }}
              />
            )}
          />
          <PasswordStrengthMeter value={newPasswordValue ?? ''} />
        </Box>

        <Controller
          name="confirmNewPassword"
          control={control}
          render={({ field, fieldState }) => (
            <PasswordField
              {...field}
              label="Confirmar nueva contraseña"
              fullWidth
              required
              disabled={submitting}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              autoComplete="new-password"
              inputProps={{ maxLength: 128 }}
            />
          )}
        />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            type="button"
            variant="text"
            disabled={submitting || !isDirty}
            onClick={() => {
              reset(DEFAULT_VALUES);
              setFormError(null);
            }}
          >
            Limpiar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isDirty || Object.keys(errors).length > 0}
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <LockResetIcon />
              )
            }
          >
            Actualizar contraseña
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={success}
        autoHideDuration={5000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Contraseña actualizada. Tus sesiones anteriores fueron invalidadas.
        </Alert>
      </Snackbar>
    </Box>
  );
}
