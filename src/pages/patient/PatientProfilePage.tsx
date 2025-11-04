import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

export default function PatientProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: '',
    address: '',
    healthInsurance: '',
    emergencyContact: '',
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement profile update API call when available
      // await patientService.updateProfile(formData);
      
      // Simulated delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccess('Perfil actualizado correctamente');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Mi Perfil
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Actualiza tu información personal y de contacto.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              fontSize: '2.5rem',
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paciente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
              mb: 3,
            }}
          >
            <TextField
              label="Nombre"
              value={user?.firstName || ''}
              disabled
              helperText="No se puede modificar"
            />
            <TextField
              label="Apellido"
              value={user?.lastName || ''}
              disabled
              helperText="No se puede modificar"
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
            <TextField
              label="Teléfono"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="+54 9 11 1234-5678"
            />
            <TextField
              label="Dirección"
              value={formData.address}
              onChange={handleChange('address')}
              placeholder="Calle, Número, Ciudad"
              fullWidth
            />
            <TextField
              label="Obra Social"
              value={formData.healthInsurance}
              onChange={handleChange('healthInsurance')}
              placeholder="OSDE, Swiss Medical, etc."
            />
            <TextField
              label="Contacto de Emergencia"
              value={formData.emergencyContact}
              onChange={handleChange('emergencyContact')}
              placeholder="Nombre y teléfono"
              fullWidth
              sx={{ gridColumn: { md: 'span 2' } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setFormData({
                  email: user?.email || '',
                  phone: '',
                  address: '',
                  healthInsurance: '',
                  emergencyContact: '',
                });
                setError(null);
                setSuccess(null);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
