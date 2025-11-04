import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
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
import { Add, Edit, Delete, Schedule, MedicalServices, Close } from '@mui/icons-material';
import {
  getMyOfferedTreatments,
  getAllTreatments,
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
  const [allTreatments, setAllTreatments] = useState<TreatmentResponseDTO[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
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
      const [offered, all] = await Promise.all([getMyOfferedTreatments(), getAllTreatments()]);
      setOfferedTreatments(offered);
      setAllTreatments(all);
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Error al cargar los tratamientos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (treatment?: OfferedTreatmentResponseDTO) => {
    if (treatment) {
      setEditMode(true);
      setSelectedTreatment(treatment);
      setFormData({
        treatmentId: treatment.treatment.id,
        requirements: treatment.requirements || '',
        durationInMinutes: treatment.durationInMinutes,
        availabilitySlots: treatment.availabilitySlots,
      });
    } else {
      setEditMode(false);
      setSelectedTreatment(null);
      setFormData({
        treatmentId: '',
        requirements: '',
        durationInMinutes: '',
        availabilitySlots: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedTreatment(null);
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

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!formData.treatmentId || !formData.durationInMinutes || formData.availabilitySlots.length === 0) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }

      if (editMode && selectedTreatment) {
        const updateData: UpdateOfferedTreatmentRequestDTO = {
          requirements: formData.requirements || undefined,
          durationInMinutes: Number(formData.durationInMinutes),
          availabilitySlots: formData.availabilitySlots,
        };
        await updateOfferedTreatment(selectedTreatment.id, updateData);
        setSuccess('Tratamiento actualizado exitosamente');
      } else {
        const addData: AddOfferedTreatmentRequestDTO = {
          treatmentId: Number(formData.treatmentId),
          requirements: formData.requirements || undefined,
          durationInMinutes: Number(formData.durationInMinutes),
          availabilitySlots: formData.availabilitySlots,
        };
        await addTreatmentToCatalog(addData);
        setSuccess('Tratamiento agregado exitosamente');
      }

      handleCloseDialog();
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
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
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
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Agregar Mi Primer Tratamiento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {offeredTreatments.map((treatment) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={treatment.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {treatment.treatment.name}
                    </Typography>
                    <Chip label={treatment.treatment.area} size="small" color="primary" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {treatment.treatment.description}
                  </Typography>

                  {treatment.requirements && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Requisitos:
                      </Typography>
                      <Typography variant="body2">{treatment.requirements}</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2">{treatment.durationInMinutes} minutos</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Disponibilidad:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {treatment.availabilitySlots.map((slot, index) => (
                        <Chip
                          key={index}
                          label={`${DAYS_OF_WEEK.find((d) => d.value === slot.dayOfWeek)?.label}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(treatment)}
                    title="Editar"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(treatment.id)}
                    title="Eliminar"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
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
              {editMode ? 'Editar Tratamiento' : 'Agregar Tratamiento'}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="cerrar"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2 }}>
          <Stack spacing={3}>
            {!editMode && (
              <TextField
                select
                label="Tratamiento"
                value={formData.treatmentId}
                onChange={(e) => setFormData({ ...formData, treatmentId: Number(e.target.value) })}
                fullWidth
                required
              >
                {allTreatments
                  .filter((t) => !offeredTreatments.some((ot) => ot.treatment.id === t.id))
                  .map((treatment) => (
                    <MenuItem key={treatment.id} value={treatment.id}>
                      {treatment.name} - {treatment.area}
                    </MenuItem>
                  ))}
              </TextField>
            )}

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
            onClick={handleCloseDialog}
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
            onClick={handleSubmit} 
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
            {editMode ? 'Guardar Cambios' : 'Agregar Tratamiento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
