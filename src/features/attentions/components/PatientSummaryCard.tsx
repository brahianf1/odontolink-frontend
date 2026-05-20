import { Card, CardContent, Divider, Stack, Typography, Box } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import type { AttentionResponseDTO } from '../../../types/attention.types';
import SectionHeader from './SectionHeader';

interface PatientSummaryCardProps {
  attention: AttentionResponseDTO;
}

export default function PatientSummaryCard({ attention }: PatientSummaryCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          icon={<PersonIcon />}
          title="Paciente"
          caption="Datos identificatorios del paciente atendido"
        />
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Nombre
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {attention.patientName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              ID interno
            </Typography>
            <Typography variant="body2">#{attention.patientId}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
