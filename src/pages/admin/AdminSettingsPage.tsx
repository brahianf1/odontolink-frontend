import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Skeleton,
  Grid,
  InputAdornment,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Restore as RestoreIcon,
  Apartment as ApartmentIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Groups as GroupsIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useInstitutionalSettings } from '../../features/admin/hooks/useInstitutionalSettings';
import {
  collectErrors,
  validateEmail,
  validateInstitutionName,
  validateMaxConcurrentAppointments,
  validateMaxLength,
} from '../../features/admin/utils/validation';
import type { UpdateInstitutionalSettingsRequestDTO } from '../../types/admin.types';

interface FormState {
  institutionName: string;
  openingHours: string;
  usagePolicies: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  maxConcurrentAppointmentsPerAttention: number;
}

const buildFormState = (
  settings?: {
    institutionName?: string;
    openingHours?: string;
    usagePolicies?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    maxConcurrentAppointmentsPerAttention?: number;
  } | null
): FormState => ({
  institutionName: settings?.institutionName ?? '',
  openingHours: settings?.openingHours ?? '',
  usagePolicies: settings?.usagePolicies ?? '',
  contactEmail: settings?.contactEmail ?? '',
  contactPhone: settings?.contactPhone ?? '',
  contactAddress: settings?.contactAddress ?? '',
  maxConcurrentAppointmentsPerAttention:
    settings?.maxConcurrentAppointmentsPerAttention ?? 1,
});

const formatTimestamp = (value?: string | null): string => {
  if (!value) return '—';
  try {
    return format(parseISO(value), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return value;
  }
};

export default function AdminSettingsPage() {
  const { settings, loading, saving, error, save, reload } = useInstitutionalSettings();
  const [form, setForm] = useState<FormState>(buildFormState(null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    open: boolean;
    severity: 'success' | 'error';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  useEffect(() => {
    setForm(buildFormState(settings));
    setErrors({});
  }, [settings]);

  const isDirty = useMemo(() => {
    if (!settings) return false;
    const baseline = buildFormState(settings);
    return (
      baseline.institutionName !== form.institutionName ||
      baseline.openingHours !== form.openingHours ||
      baseline.usagePolicies !== form.usagePolicies ||
      baseline.contactEmail !== form.contactEmail ||
      baseline.contactPhone !== form.contactPhone ||
      baseline.contactAddress !== form.contactAddress ||
      baseline.maxConcurrentAppointmentsPerAttention !==
        form.maxConcurrentAppointmentsPerAttention
    );
  }, [form, settings]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const validate = (): Record<string, string> => {
    return collectErrors({
      institutionName: validateInstitutionName(form.institutionName),
      openingHours: validateMaxLength(form.openingHours, 1000, 'Los horarios de atención'),
      usagePolicies: validateMaxLength(form.usagePolicies, 5000, 'Las políticas de uso'),
      contactEmail: form.contactEmail ? validateEmail(form.contactEmail) : null,
      contactPhone: validateMaxLength(form.contactPhone, 50, 'El teléfono de contacto'),
      contactAddress: validateMaxLength(form.contactAddress, 250, 'La dirección'),
      maxConcurrentAppointmentsPerAttention: validateMaxConcurrentAppointments(
        form.maxConcurrentAppointmentsPerAttention
      ),
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    const payload: UpdateInstitutionalSettingsRequestDTO = {
      institutionName: form.institutionName.trim(),
      openingHours: form.openingHours.trim() || undefined,
      usagePolicies: form.usagePolicies.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      contactAddress: form.contactAddress.trim() || undefined,
      maxConcurrentAppointmentsPerAttention: form.maxConcurrentAppointmentsPerAttention,
    };
    try {
      await save(payload);
      setFeedback({
        open: true,
        severity: 'success',
        message: 'Configuración actualizada correctamente.',
      });
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'No se pudo guardar la configuración. Intenta nuevamente.';
      setFeedback({ open: true, severity: 'error', message });
    }
  };

  const handleReset = () => {
    setForm(buildFormState(settings));
    setErrors({});
  };

  const renderSkeleton = () => (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={56} />
          ))}
          <Skeleton variant="rectangular" height={120} />
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Configuración Institucional
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Parámetros generales y políticas que rigen el funcionamiento del sistema.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={() => void reload()}>
            Reintentar
          </Button>
        }>
          {error}
        </Alert>
      )}

      {loading ? (
        renderSkeleton()
      ) : (
        <Card variant="outlined">
          <CardContent>
            <form onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Identidad institucional
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TextField
                        fullWidth
                        required
                        label="Nombre de la institución"
                        value={form.institutionName}
                        onChange={(e) => handleChange('institutionName', e.target.value)}
                        error={!!errors.institutionName}
                        helperText={errors.institutionName}
                        disabled={saving}
                        inputProps={{ maxLength: 200 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ApartmentIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Turnos por atención"
                        value={form.maxConcurrentAppointmentsPerAttention}
                        onChange={(e) =>
                          handleChange(
                            'maxConcurrentAppointmentsPerAttention',
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        }
                        error={!!errors.maxConcurrentAppointmentsPerAttention}
                        helperText={
                          errors.maxConcurrentAppointmentsPerAttention ||
                          'Máximo de turnos por atención clínica'
                        }
                        disabled={saving}
                        inputProps={{ min: 1, step: 1, inputMode: 'numeric' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <GroupsIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Información de contacto
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="email"
                        label="Email de contacto"
                        value={form.contactEmail}
                        onChange={(e) => handleChange('contactEmail', e.target.value)}
                        error={!!errors.contactEmail}
                        helperText={errors.contactEmail}
                        disabled={saving}
                        inputProps={{ maxLength: 150 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Teléfono de contacto"
                        value={form.contactPhone}
                        onChange={(e) => handleChange('contactPhone', e.target.value)}
                        error={!!errors.contactPhone}
                        helperText={errors.contactPhone}
                        disabled={saving}
                        inputProps={{ maxLength: 50 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Dirección"
                        value={form.contactAddress}
                        onChange={(e) => handleChange('contactAddress', e.target.value)}
                        error={!!errors.contactAddress}
                        helperText={errors.contactAddress}
                        disabled={saving}
                        inputProps={{ maxLength: 250 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Operaciones
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Horarios de atención"
                        value={form.openingHours}
                        onChange={(e) => handleChange('openingHours', e.target.value)}
                        error={!!errors.openingHours}
                        helperText={errors.openingHours || 'Por ejemplo: Lunes a Viernes 8:00 - 18:00'}
                        disabled={saving}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ mt: 1.5, alignSelf: 'flex-start' }}>
                              <ScheduleIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Políticas de uso"
                        value={form.usagePolicies}
                        onChange={(e) => handleChange('usagePolicies', e.target.value)}
                        error={!!errors.usagePolicies}
                        helperText={errors.usagePolicies || 'Reglas, lineamientos y términos institucionales'}
                        disabled={saving}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ mt: 1.5, alignSelf: 'flex-start' }}>
                              <GavelIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Última actualización: {formatTimestamp(settings?.updatedAt)}
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                      variant="outlined"
                      startIcon={<RestoreIcon />}
                      onClick={handleReset}
                      disabled={saving || !isDirty}
                      sx={{ flex: { xs: 1, sm: 'unset' } }}
                    >
                      Descartar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                      }
                      disabled={saving || !isDirty}
                      sx={{ flex: { xs: 1, sm: 'unset' } }}
                    >
                      Guardar Cambios
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={feedback.open}
        autoHideDuration={4500}
        onClose={(_event, reason) => {
          if (reason === 'clickaway') return;
          setFeedback((prev) => ({ ...prev, open: false }));
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={feedback.severity}
          variant="filled"
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
