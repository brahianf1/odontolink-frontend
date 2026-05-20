import { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  Stack,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Badge,
  CalendarToday,
  School,
} from '@mui/icons-material';
import { registerPractitioner } from '../services/api/authService';
import type { RegisterPractitionerRequestDTO } from '../types/auth.types';
import {
  getMaxBirthDate,
  validateBirthDateFull,
} from '../utils/birthDateValidation';

const RegisterPractitionerPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterPractitionerRequestDTO>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    birthDate: '',
    studentId: '',
    studyYear: 1,
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'studyYear' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!/^[0-9]{7,8}$/.test(formData.dni)) {
      setError('El DNI debe contener 7 u 8 dígitos');
      return;
    }

    const birthDateError = validateBirthDateFull(formData.birthDate ?? '');
    if (birthDateError) {
      setError(birthDateError);
      return;
    }

    setLoading(true);

    try {
      await registerPractitioner(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            width: '100%',
          }}
        >
          <Card sx={{ boxShadow: theme.shadows[8], borderRadius: 3, width: '100%', maxWidth: '100%' }}>
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
                ¡Registro Exitoso!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tu cuenta de practicante ha sido creada correctamente. Redirigiendo al inicio de sesión...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          width: '100%',
        }}
      >
        <Card sx={{ boxShadow: theme.shadows[8], borderRadius: 3, width: '100%', maxWidth: '100%' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                Registro de Practicante
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estudiantes de odontología - Completa tus datos académicos
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Personal Information */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                    Información Personal
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Apellido"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="DNI"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="12345678"
                      inputProps={{ maxLength: 8, pattern: '[0-9]*' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Fecha de Nacimiento"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ max: getMaxBirthDate() }}
                      error={Boolean(validateBirthDateFull(formData.birthDate ?? ''))}
                      helperText={
                        validateBirthDateFull(formData.birthDate ?? '') ?? ''
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Box>

                {/* Academic Information */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                    Información Académica
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Legajo/Matrícula"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="LEG-2024-001"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <School color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      select
                      label="Año de Cursado"
                      name="studyYear"
                      value={formData.studyYear}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      {[1, 2, 3, 4, 5, 6].map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}° Año
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Box>

                {/* Contact Information */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                    Información de Contacto
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Correo Electrónico"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="estudiante@utn.edu.ar"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="+54 9 11 1234-5678"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Box>

                {/* Password Section */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                    Seguridad
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Contraseña"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      helperText="Mínimo 6 caracteres"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              disabled={loading}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Confirmar Contraseña"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              disabled={loading}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Crear Cuenta de Practicante'}
                </Button>
              </Stack>
            </form>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  fontWeight={600}
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RegisterPractitionerPage;
