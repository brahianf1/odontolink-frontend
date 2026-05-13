import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  useTheme,
  Grid,
  alpha,
  Stack,
  Divider,
  Paper,
  useMediaQuery,
} from '@mui/material';
import { Add, Delete, MedicalServices, Close } from '@mui/icons-material';
import AddTreatmentDialog from '../../components/practitioner/AddTreatmentDialog';
import TreatmentCard from '../../components/practitioner/TreatmentCard';
import {
  getMyOfferedTreatments,
  getAllTreatments,
  getMyAttentions,
  addTreatmentToCatalog,
  updateOfferedTreatment,
  removeFromCatalog,
} from '../../services/api/practitionerService';
import type {
  OfferedTreatmentResponseDTO,
  TreatmentResponseDTO,
  AddOfferedTreatmentRequestDTO,
  UpdateOfferedTreatmentRequestDTO,
  AvailabilitySlotDTO,
} from '../../types/practitioner.types';
import type { AttentionResponseDTO } from '../../types/attention.types';

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

export default function TreatmentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [offeredTreatments, setOfferedTreatments] = useState<OfferedTreatmentResponseDTO[]>([]);
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [allTreatments, setAllTreatments] = useState<TreatmentResponseDTO[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<OfferedTreatmentResponseDTO | null>(null);
  const [formData, setFormData] = useState<{
    treatmentId: number | '';
    requirements: string;
    durationInMinutes: number | '';
    availabilitySlots: AvailabilitySlotDTO[];
  }>({
    treatmentId: '',
    requirements: '',
    durationInMinutes: '',
    availabilitySlots: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [offered, all, attentionsData] = await Promise.all([
        getMyOfferedTreatments(),
        getAllTreatments(),
        getMyAttentions(),
      ]);
      setOfferedTreatments(offered);
      setAllTreatments(all);
      setAttentions(attentionsData);
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Error al cargar los tratamientos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (treatment: OfferedTreatmentResponseDTO) => {
    setSelectedTreatment(treatment);
    setFormData({
      treatmentId: treatment.treatment.id,
      requirements: treatment.requirements || '',
      durationInMinutes: treatment.durationInMinutes,
      availabilitySlots: treatment.availabilitySlots,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedTreatment(null);
  };

  const handleAddSubmit = async (data: AddOfferedTreatmentRequestDTO) => {
    setError(null);
    setSuccess(null);
    await addTreatmentToCatalog(data);
    setSuccess('Tratamiento agregado exitosamente');
    loadData();
  };

  const handleAddSlot = () => {
    setFormData({
      ...formData,
      availabilitySlots: [
        ...formData.availabilitySlots,
        { dayOfWeek: 'MONDAY' as const, startTime: '09:00:00', endTime: '17:00:00' },
      ],
    });
  };

  const handleRemoveSlot = (index: number) => {
    setFormData({
      ...formData,
      availabilitySlots: formData.availabilitySlots.filter((_, i) => i !== index),
    });
  };

  const handleSlotChange = (index: number, field: keyof AvailabilitySlotDTO, value: string) => {
    const newSlots = [...formData.availabilitySlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setFormData({ ...formData, availabilitySlots: newSlots });
  };

  const handleEditSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!formData.durationInMinutes || formData.availabilitySlots.length === 0) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }

      if (selectedTreatment) {
        const updateData: UpdateOfferedTreatmentRequestDTO = {
          requirements: formData.requirements || undefined,
          durationInMinutes: Number(formData.durationInMinutes),
          availabilitySlots: formData.availabilitySlots,
        };
        await updateOfferedTreatment(selectedTreatment.id, updateData);
        setSuccess('Tratamiento actualizado exitosamente');
      }

      handleCloseEditDialog();
      loadData();
    } catch (err: unknown) {
      console.error('Error saving treatment:', err);
      setError('Error al guardar el tratamiento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await removeFromCatalog(id);
      setSuccess('Tratamiento eliminado exitosamente');
      loadData();
    } catch (err) {
      console.error('Error deleting treatment:', err);
      setError('Error al eliminar el tratamiento');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Mis Tratamientos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra tu catálogo de tratamientos y disponibilidad
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddDialog}>
          Agregar Tratamiento
        </Button>
      </Box>

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

      {offeredTreatments.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes tratamientos agregados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comienza agregando tratamientos a tu catálogo personal
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddDialog}>
              Agregar Mi Primer Tratamiento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {offeredTreatments.map((treatment) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={treatment.id}>
              {(() => {
                const completedPatientsCount = new Set(
                  attentions
                    .filter((attention) => attention.treatmentId === treatment.treatment.id && attention.status === 'COMPLETED')
                    .map((attention) => attention.patientId)
                ).size;

                return (
              <TreatmentCard
                treatment={treatment}
                completedPatientsCount={completedPatientsCount}
                onEdit={handleOpenEditDialog}
                onDelete={handleDelete}
              />
                );
              })()}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Treatment Dialog (Stepper) */}
      <AddTreatmentDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        masterTreatments={allTreatments}
        offeredTreatments={offeredTreatments}
        onSubmit={handleAddSubmit}
      />

      {/* Edit Treatment Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            pt: 2.5,
            px: { xs: 2, sm: 3 },
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MedicalServices sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
            <Typography variant="h6" fontWeight={700} fontSize={{ xs: '1.1rem', sm: '1.25rem' }}>
              Editar Tratamiento
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseEditDialog}
            aria-label="cerrar"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Duración (minutos)"
              type="number"
              value={formData.durationInMinutes}
              onChange={(e) => setFormData({ ...formData, durationInMinutes: Number(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 15, max: 240, step: 15 }}
              helperText="Duración estimada del tratamiento"
            />

            <TextField
              label="Requisitos"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Ej: Traer cepillo dental propio"
            />

            <Divider sx={{ my: 1 }} />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} fontSize={{ xs: '0.95rem', sm: '1rem' }}>
                  Disponibilidad Horaria
                </Typography>
                <Button 
                  startIcon={<Add />} 
                  onClick={handleAddSlot} 
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 1.5, sm: 2 }
                  }}
                >
                  Agregar
                </Button>
              </Box>

              <Stack spacing={2}>
                {formData.availabilitySlots.map((slot, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Horario {index + 1}
                        </Typography>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveSlot(index)}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>

                      <TextField
                        select
                        label="Día de la semana"
                        value={slot.dayOfWeek}
                        onChange={(e) => handleSlotChange(index, 'dayOfWeek', e.target.value)}
                        fullWidth
                        size="small"
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <MenuItem key={day.value} value={day.value}>
                            {day.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2
                      }}>
                        <TextField
                          label="Hora inicio"
                          type="time"
                          value={slot.startTime.substring(0, 5)}
                          onChange={(e) => handleSlotChange(index, 'startTime', e.target.value + ':00')}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            step: 900,
                          }}
                        />
                        <TextField
                          label="Hora fin"
                          type="time"
                          value={slot.endTime.substring(0, 5)}
                          onChange={(e) => handleSlotChange(index, 'endTime', e.target.value + ':00')}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            step: 900,
                          }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              {formData.availabilitySlots.length === 0 && (
                <Alert 
                  severity="info"
                  sx={{ 
                    borderRadius: 2,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}
                >
                  Agrega al menos un horario de disponibilidad
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            gap: 1.5,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
          }}
        >
          <Button 
            onClick={handleCloseEditDialog}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            fullWidth={isMobile}
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
