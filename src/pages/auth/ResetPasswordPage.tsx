import { useEffect, useState } from 'react';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../../features/profile/schemas/profile.schemas';
import { resetPassword } from '../../services/api/profileService';
import { useAuthStore } from '../../store/authStore';
import {
  PasswordField,
  PasswordStrengthMeter,
} from '../../features/profile';
import {
  extractFieldErrors,
  formatRetryMessage,
  getErrorMessage,
  getRetryAfterSeconds,
  getValidationDetails,
  isErrorDiscriminator,
  isStatusCode,
} from '../../features/profile/utils/apiErrors';

const FIELD_NAMES: Record<string, keyof ResetPasswordFormValues> = {
  newPassword: 'newPassword',
  confirmNewPassword: 'confirmNewPassword',
};

const DEFAULT_VALUES: ResetPasswordFormValues = {
  newPassword: '',
  confirmNewPassword: '',
};

export default function ResetPasswordPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [submitting, setSubmitting] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const newPasswordValue = useWatch({ control, name: 'newPassword' });

  useEffect(() => {
    if (!success) return;
    if (isAuthenticated) logout();
    const timer = window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [success, isAuthenticated, logout, navigate]);

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await resetPassword({ token, newPassword: values.newPassword });
      setSuccess(true);
    } catch (err) {
      if (isErrorDiscriminator(err, 'Invalid Password Reset Token')) {
        setTokenInvalid(true);
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
            'Demasiados intentos. Intentá nuevamente más tarde.'
          )
        );
        return;
      }
      setFormError(getErrorMessage(err, 'No se pudo restablecer la contraseña.'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!token) {
      return (
        <InvalidTokenPanel
          title="Enlace inválido"
          message="El enlace de restablecimiento no contiene un token válido. Solicitá uno nuevo desde la pantalla de recuperación."
        />
      );
    }

    if (tokenInvalid) {
      return (
        <InvalidTokenPanel
          title="Enlace expirado o inválido"
          message="Este enlace ya fue utilizado, expiró o no es válido. Pedí un nuevo enlace para continuar."
        />
      );
    }

    if (success) {
      return (
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <SuccessIcon sx={{ fontSize: 56, color: 'success.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Contraseña restablecida
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ya podés iniciar sesión con tu nueva contraseña. Te llevamos al login en
            unos segundos.
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            startIcon={<ArrowBackIcon />}
          >
            Ir al login
          </Button>
        </Stack>
      );
    }

    return (
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
            Nueva contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Elegí una contraseña que tenga al menos 8 caracteres. Por seguridad, vas
            a tener que iniciar sesión nuevamente.
          </Typography>
        </Box>

        {formError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        ) : null}

        <Stack spacing={2.5}>
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}
            startIcon={
              submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <LockResetIcon />
              )
            }
          >
            Restablecer contraseña
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/login"
              color="primary"
              variant="body2"
              sx={{
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                fontWeight: 600,
              }}
            >
              Volver al inicio de sesión
            </Link>
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ boxShadow: theme.shadows[8], borderRadius: 3, width: '100%' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>{renderContent()}</CardContent>
        </Card>
      </Box>
    </Container>
  );
}

function InvalidTokenPanel({ title, message }: { title: string; message: string }) {
  return (
    <Stack spacing={2.5} alignItems="center" textAlign="center">
      <ErrorIcon sx={{ fontSize: 56, color: 'error.main' }} />
      <Typography variant="h5" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
        <Button
          component={RouterLink}
          to="/forgot-password"
          variant="contained"
          startIcon={<LockResetIcon />}
        >
          Solicitar nuevo enlace
        </Button>
        <Button component={RouterLink} to="/login" variant="text">
          Ir al login
        </Button>
      </Stack>
    </Stack>
  );
}
