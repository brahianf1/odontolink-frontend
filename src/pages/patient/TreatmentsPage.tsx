import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import patientService from '../../services/api/patientService';
import type { OfferedTreatmentResponseDTO } from '../../types/practitioner.types';
import AppointmentBookingDialog from '../../components/patient/AppointmentBookingDialog';

export default function TreatmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<OfferedTreatmentResponseDTO[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<OfferedTreatmentResponseDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState<OfferedTreatmentResponseDTO | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    loadTreatments();
  }, []);

  useEffect(() => {
    filterTreatments();
  }, [searchQuery, treatments]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAvailableTreatments();
      setTreatments(data);
      setFilteredTreatments(data);
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Error al cargar los tratamientos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const filterTreatments = () => {
    if (!searchQuery.trim()) {
      setFilteredTreatments(treatments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = treatments.filter(
      (treatment) =>
        treatment.treatment.name.toLowerCase().includes(query) ||
        treatment.treatment.description?.toLowerCase().includes(query) ||
        treatment.treatment.area?.toLowerCase().includes(query) ||
        treatment.practitionerName.toLowerCase().includes(query)
    );
    setFilteredTreatments(filtered);
  };

  const handleBookTreatment = (treatment: OfferedTreatmentResponseDTO) => {
    setSelectedTreatment(treatment);
    setBookingDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    setBookingDialogOpen(false);
    setSelectedTreatment(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
          }}
        >
          Catálogo de Tratamientos
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Explora los tratamientos disponibles y reserva tu turno con un practicante.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar por tratamiento, área, o practicante..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Results */}
      {filteredTreatments.length === 0 ? (
        <Alert severity="info">
          {searchQuery
            ? 'No se encontraron tratamientos que coincidan con tu búsqueda.'
            : 'No hay tratamientos disponibles en este momento.'}
        </Alert>
      ) : (
        <>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            Mostrando {filteredTreatments.length} tratamiento(s)
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
            }}
          >
            {filteredTreatments.map((treatment) => (
              <Card 
                key={treatment.id} 
                elevation={0}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5 } }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }}
                  >
                    {treatment.treatment.name}
                  </Typography>
                  {treatment.treatment.area && (
                    <Chip
                      label={treatment.treatment.area}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      }}
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    {treatment.treatment.description || 'Sin descripción disponible'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    >
                      {treatment.practitionerName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    >
                      Duración: {treatment.durationInMinutes} minutos
                    </Typography>
                  </Box>
                  {treatment.requirements && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block', 
                        mt: 2,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      }}
                    >
                      <strong>Requisitos:</strong> {treatment.requirements}
                    </Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      mt: 1,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    }}
                  >
                    {treatment.availabilitySlots.length} horario(s) disponible(s)
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleBookTreatment(treatment)}
                    sx={{
                      py: { xs: 1, sm: 1.2 },
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      fontWeight: 600,
                    }}
                  >
                    Reservar Turno
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Booking Dialog */}
      {selectedTreatment && (
        <AppointmentBookingDialog
          open={bookingDialogOpen}
          treatment={selectedTreatment}
          onClose={() => setBookingDialogOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </Box>
  );
}
