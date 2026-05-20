import { Card, CardContent, Divider, Stack, Typography, Box } from '@mui/material';
import { MedicalServices as MedicalServicesIcon } from '@mui/icons-material';
import type { AttentionResponseDTO } from '../../../types/attention.types';
import SectionHeader from './SectionHeader';

interface TreatmentSummaryCardProps {
  attention: AttentionResponseDTO;
}

export default function TreatmentSummaryCard({ attention }: TreatmentSummaryCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          icon={<MedicalServicesIcon />}
          title="Tratamiento"
          caption="Servicio clínico asignado a esta atención"
        />
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tratamiento
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {attention.treatmentName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Practicante a cargo
            </Typography>
            <Typography variant="body2">{attention.practitionerName}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
