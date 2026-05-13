import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Paper,
  Collapse,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, AssignmentTurnedIn as AttentionsIcon } from '@mui/icons-material';
import { getMyAttentions } from '../../services/api/practitionerService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PatientItem {
  id: number;
  name: string;
  attentions: AttentionResponseDTO[];
  attentionsCount: number;
  activeCount: number;
}

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [expandedPatientId, setExpandedPatientId] = useState<number | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const attentions = await getMyAttentions();
      
      // Group by patient
      const patientsMap = new Map<number, PatientItem>();
      
      attentions.forEach((att: AttentionResponseDTO) => {
        const existing = patientsMap.get(att.patientId);
        if (existing) {
          existing.attentionsCount++;
          existing.attentions.push(att);
          if (att.status === 'IN_PROGRESS') existing.activeCount++;
        } else {
          patientsMap.set(att.patientId, {
            id: att.patientId,
            name: att.patientName,
            attentionsCount: 1,
            activeCount: att.status === 'IN_PROGRESS' ? 1 : 0,
            attentions: [att],
          });
        }
      });

      setPatients(
        Array.from(patientsMap.values()).map((patient) => ({
          ...patient,
          attentions: patient.attentions.sort((left, right) => right.id - left.id),
        }))
      );
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Error al cargar los pacientes');
    } finally {
      setLoading(false);
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
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Mis Pacientes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Lista de pacientes asignados
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {patients.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              No tienes pacientes asignados aún
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {patients.map((patient) => (
            <Card
              key={patient.id}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedPatientId((current) => (current === patient.id ? null : patient.id))}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 56, height: 56 }}>
                      {patient.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {patient.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip label={`${patient.attentionsCount} atenciones`} size="small" variant="outlined" />
                        {patient.activeCount > 0 && (
                          <Chip label={`${patient.activeCount} activas`} size="small" color="primary" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={`${patient.attentionsCount} atenciones`}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedPatientId((current) => (current === patient.id ? null : patient.id));
                      }}
                      aria-label="expandir paciente"
                      sx={{
                        transform: expandedPatientId === patient.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={expandedPatientId === patient.id} timeout="auto" unmountOnExit>
                  <Divider sx={{ my: 2.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttentionsIcon fontSize="small" />
                      Atenciones del paciente
                    </Typography>

                    <Stack spacing={1.5}>
                      {patient.attentions.map((attention) => (
                        <Paper
                          key={attention.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.default',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                            <Box>
                              <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                Atención #{attention.id}
                              </Typography>
                              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.25 }}>
                                {attention.treatmentName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Inicio: {format(parseISO(attention.startDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                              </Typography>
                            </Box>
                            <Chip
                              label={attention.status === 'IN_PROGRESS' ? 'En Progreso' : 'Completada'}
                              color={attention.status === 'IN_PROGRESS' ? 'warning' : 'success'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
