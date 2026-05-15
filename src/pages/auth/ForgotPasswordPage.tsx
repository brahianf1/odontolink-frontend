import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  MarkEmailReadOutlined as SentIcon,
} from '@mui/icons-material';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../../features/profile/schemas/profile.schemas';
import { forgotPassword } from '../../services/api/profileService';
import { getErrorMessage } from '../../features/profile/utils/apiErrors';

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [networkError, setNetworkError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (values) => {
    setSubmitting(true);
    setNetworkError(null);
    try {
      await forgotPassword({ email: values.email.trim() });
      setSentEmail(values.email.trim());
      setSent(true);
    } catch (err) {
      setNetworkError(
        getErrorMessage(
          err,
          'No pudimos procesar tu solicitud en este momento. Intentá nuevamente más tarde.'
        )
      );
    } finally {
      setSubmitting(false);
    }
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
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            {sent ? (
              <Stack spacing={2.5} alignItems="center" textAlign="center">
                <SentIcon sx={{ fontSize: 56, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  Revisá tu correo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Si <strong>{sentEmail}</strong> se encuentra registrado, te enviamos
                  un enlace para restablecer tu contraseña. Revisá también la carpeta
                  de correo no deseado.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  El enlace caduca a los 30 minutos. Si no te llega, podés solicitar
                  uno nuevo desde esta misma pantalla.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                  >
                    Volver al login
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      setSent(false);
                      setSentEmail('');
                    }}
                  >
                    Usar otro correo
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="primary"
                    gutterBottom
                  >
                    Recuperar contraseña
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ingresá el correo asociado a tu cuenta y te enviaremos las
                    instrucciones para crear una nueva contraseña.
                  </Typography>
                </Box>

                {networkError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {networkError}
                  </Alert>
                ) : null}

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
                      autoComplete="email"
                      disabled={submitting}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, mb: 2 }}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : undefined
                  }
                >
                  Enviar enlace
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
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
