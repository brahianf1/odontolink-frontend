import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Alert, CircularProgress, Grid, Avatar, Chip } from '@mui/material';
import { getMyAttentions } from '../../services/api/practitionerService';
import type { AttentionResponseDTO } from '../../types/attention.types';

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Array<{ id: number; name: string; attentionsCount: number; activeCount: number }>>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const attentions = await getMyAttentions();
      
      // Group by patient
      const patientsMap = new Map<number, { id: number; name: string; attentionsCount: number; activeCount: number }>();
      
      attentions.forEach((att: AttentionResponseDTO) => {
        const existing = patientsMap.get(att.patientId);
        if (existing) {
          existing.attentionsCount++;
          if (att.status === 'IN_PROGRESS') existing.activeCount++;
        } else {
          patientsMap.set(att.patientId, {
            id: att.patientId,
            name: att.patientName,
            attentionsCount: 1,
            activeCount: att.status === 'IN_PROGRESS' ? 1 : 0,
          });
        }
      });

      setPatients(Array.from(patientsMap.values()));
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
        <Grid container spacing={3}>
          {patients.map((patient) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={patient.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar>{patient.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {patient.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`${patient.attentionsCount} atenciones`} size="small" />
                    {patient.activeCount > 0 && (
                      <Chip label={`${patient.activeCount} activas`} size="small" color="primary" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
