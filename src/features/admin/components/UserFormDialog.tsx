import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import {
  BLOOD_TYPES,
  type AdminCreatePatientRequestDTO,
  type AdminCreatePractitionerRequestDTO,
  type AdminCreateSupervisorRequestDTO,
  type AdminUserDTO,
  type BloodType,
  type UpdateUserProfileRequestDTO,
} from '../../../types/admin.types';
import {
  createPatient,
  createPractitioner,
  createSupervisor,
  updateUserProfile,
} from '../../../services/api/adminService';
import {
  collectErrors,
  validateBirthDate,
  validateBloodType,
  validateConfirmPassword,
  validateDni,
  validateEmail,
  validateEmployeeId,
  validateMaxLength,
  validateName,
  validatePassword,
  validatePhone,
  validateSpecialty,
  validateStudentId,
  validateStudyYear,
} from '../utils/validation';
import { getMaxBirthDate } from '../../../utils/birthDateValidation';

export type UserFormMode =
  | 'create-patient'
  | 'create-practitioner'
  | 'create-supervisor'
  | 'edit';

interface UserFormDialogProps {
  open: boolean;
  mode: UserFormMode;
  user?: AdminUserDTO | null;
  onClose: () => void;
  onSuccess: (user: AdminUserDTO, mode: UserFormMode) => void;
}

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  birthDate: string;
  studentId: string;
  studyYear: number;
  specialty: string;
  employeeId: string;
  healthInsurance: string;
  bloodType: BloodType | '';
}

const EMPTY_STATE: FormState = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  dni: '',
  phone: '',
  birthDate: '',
  studentId: '',
  studyYear: 1,
  specialty: '',
  employeeId: '',
  healthInsurance: '',
  bloodType: '',
};

const DIALOG_TITLES: Record<UserFormMode, string> = {
  'create-patient': 'Crear Paciente',
  'create-practitioner': 'Crear Practicante',
  'create-supervisor': 'Crear Docente',
  edit: 'Editar Perfil',
};

const SUBMIT_LABELS: Record<UserFormMode, string> = {
  'create-patient': 'Crear Paciente',
  'create-practitioner': 'Crear Practicante',
  'create-supervisor': 'Crear Docente',
  edit: 'Guardar Cambios',
};

export default function UserFormDialog({
  open,
  mode,
  user,
  onClose,
  onSuccess,
}: UserFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCreate = mode !== 'edit';

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);
    setShowPassword(false);
    setShowConfirm(false);
    if (mode === 'edit' && user) {
      setForm({
        ...EMPTY_STATE,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        birthDate: user.birthDate ?? '',
      });
    } else {
      setForm(EMPTY_STATE);
    }
  }, [open, mode, user]);

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

  const runValidation = (): Record<string, string> => {
    const baseChecks: Record<string, string | null> = {
      firstName: validateName(form.firstName, 'El nombre'),
      lastName: validateName(form.lastName, 'El apellido'),
      phone: validatePhone(form.phone),
      birthDate: validateBirthDate(form.birthDate),
    };

    if (mode === 'edit') {
      return collectErrors(baseChecks);
    }

    const createChecks: Record<string, string | null> = {
      ...baseChecks,
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      dni: validateDni(form.dni),
    };

    if (mode === 'create-practitioner') {
      createChecks.studentId = validateStudentId(form.studentId);
      createChecks.studyYear = validateStudyYear(form.studyYear);
    }

    if (mode === 'create-supervisor') {
      createChecks.specialty = validateSpecialty(form.specialty);
      createChecks.employeeId = validateEmployeeId(form.employeeId);
    }

    if (mode === 'create-patient') {
      createChecks.healthInsurance = validateMaxLength(
        form.healthInsurance,
        100,
        'La obra social'
      );
      createChecks.bloodType = validateBloodType(form.bloodType);
    }

    return collectErrors(createChecks);
  };

  const buildEditPayload = (): UpdateUserProfileRequestDTO => ({
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phone: form.phone.trim() || undefined,
    birthDate: form.birthDate || undefined,
  });

  const buildPatientPayload = (): AdminCreatePatientRequestDTO => ({
    email: form.email.trim(),
    password: form.password,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    dni: form.dni.trim(),
    phone: form.phone.trim() || undefined,
    birthDate: form.birthDate || undefined,
    healthInsurance: form.healthInsurance.trim() || undefined,
    bloodType: form.bloodType || undefined,
  });

  const buildPractitionerPayload = (): AdminCreatePractitionerRequestDTO => ({
    email: form.email.trim(),
    password: form.password,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    dni: form.dni.trim(),
    phone: form.phone.trim() || undefined,
    birthDate: form.birthDate || undefined,
    studentId: form.studentId.trim(),
    studyYear: form.studyYear,
  });

  const buildSupervisorPayload = (): AdminCreateSupervisorRequestDTO => ({
    email: form.email.trim(),
    password: form.password,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    dni: form.dni.trim(),
    phone: form.phone.trim() || undefined,
    birthDate: form.birthDate || undefined,
    specialty: form.specialty.trim(),
    employeeId: form.employeeId.trim(),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = runValidation();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      let result: AdminUserDTO;
      if (mode === 'edit') {
        if (!user) throw new Error('Usuario no especificado');
        result = await updateUserProfile(user.id, buildEditPayload());
      } else if (mode === 'create-patient') {
        result = await createPatient(buildPatientPayload());
      } else if (mode === 'create-practitioner') {
        result = await createPractitioner(buildPractitionerPayload());
      } else {
        result = await createSupervisor(buildSupervisorPayload());
      }
      onSuccess(result, mode);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'Ocurrió un error al guardar. Intenta nuevamente.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = useMemo(() => DIALOG_TITLES[mode], [mode]);
  const submitLabel = useMemo(() => SUBMIT_LABELS[mode], [mode]);

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {title}
          {mode === 'edit' && user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {user.firstName} {user.lastName} · {user.email}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Información personal
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  required
                  label="Nombre"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={submitting}
                  inputProps={{ maxLength: 100 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  required
                  label="Apellido"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={submitting}
                  inputProps={{ maxLength: 100 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone || 'Opcional. Solo números, espacios y + ( ) -'}
                  disabled={submitting}
                  inputProps={{ maxLength: 20 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de nacimiento"
                  value={form.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  error={!!errors.birthDate}
                  helperText={errors.birthDate}
                  disabled={submitting}
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
              </Stack>

              {isCreate && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    required
                    label="DNI"
                    value={form.dni}
                    onChange={(e) => handleChange('dni', e.target.value.replace(/[^0-9]/g, ''))}
                    error={!!errors.dni}
                    helperText={errors.dni || '7 u 8 dígitos numéricos'}
                    disabled={submitting}
                    inputProps={{ maxLength: 8, inputMode: 'numeric' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              )}
            </Box>

            {isCreate && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Credenciales de acceso
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="Correo electrónico"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                      disabled={submitting}
                      autoComplete="off"
                      inputProps={{ maxLength: 100 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      required
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      error={!!errors.password}
                      helperText={errors.password || 'Mínimo 6 caracteres'}
                      disabled={submitting}
                      autoComplete="new-password"
                      inputProps={{ maxLength: 100 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowPassword((value) => !value)}
                              edge="end"
                              aria-label="mostrar contraseña"
                              disabled={submitting}
                            >
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      required
                      label="Confirmar contraseña"
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      disabled={submitting}
                      autoComplete="new-password"
                      inputProps={{ maxLength: 100 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowConfirm((value) => !value)}
                              edge="end"
                              aria-label="mostrar confirmación"
                              disabled={submitting}
                            >
                              {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Box>
              </>
            )}

            {mode === 'create-practitioner' && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Información académica
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      required
                      label="Legajo / Matrícula"
                      value={form.studentId}
                      onChange={(e) => handleChange('studentId', e.target.value)}
                      error={!!errors.studentId}
                      helperText={errors.studentId}
                      disabled={submitting}
                      inputProps={{ maxLength: 50 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SchoolIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      required
                      select
                      label="Año de cursado"
                      value={form.studyYear}
                      onChange={(e) => handleChange('studyYear', parseInt(e.target.value, 10))}
                      error={!!errors.studyYear}
                      helperText={errors.studyYear}
                      disabled={submitting}
                    >
                      {[1, 2, 3, 4, 5, 6].map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}° Año
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Box>
              </>
            )}

            {mode === 'create-supervisor' && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Información docente
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      required
                      label="Especialidad"
                      value={form.specialty}
                      onChange={(e) => handleChange('specialty', e.target.value)}
                      error={!!errors.specialty}
                      helperText={errors.specialty}
                      disabled={submitting}
                      inputProps={{ maxLength: 100 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HospitalIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      required
                      label="Número de empleado"
                      value={form.employeeId}
                      onChange={(e) => handleChange('employeeId', e.target.value)}
                      error={!!errors.employeeId}
                      helperText={errors.employeeId}
                      disabled={submitting}
                      inputProps={{ maxLength: 50 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Box>
              </>
            )}

            {mode === 'create-patient' && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Información médica
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Obra social"
                      value={form.healthInsurance}
                      onChange={(e) => handleChange('healthInsurance', e.target.value)}
                      error={!!errors.healthInsurance}
                      helperText={errors.healthInsurance || 'Opcional'}
                      disabled={submitting}
                      inputProps={{ maxLength: 100 }}
                    />
                    <TextField
                      fullWidth
                      select
                      label="Grupo sanguíneo"
                      value={form.bloodType}
                      onChange={(e) => handleChange('bloodType', e.target.value as BloodType)}
                      error={!!errors.bloodType}
                      helperText={errors.bloodType || 'Opcional'}
                      disabled={submitting}
                    >
                      <MenuItem value="">Sin especificar</MenuItem>
                      {BLOOD_TYPES.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Box>
              </>
            )}
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
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
