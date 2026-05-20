import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import type { AttentionResponseDTO } from '../../../../types/attention.types';
import { AttentionStatusChip } from '../../../attentions';

interface PatientAttentionsListProps {
  attentions: AttentionResponseDTO[];
}

/**
 * Compact list of a single patient's attentions. Reused by the card
 * expand area and the table-view dialog so the rendering stays consistent
 * across both surfaces. Every row navigates to the canonical attention
 * detail page.
 */
export default function PatientAttentionsList({ attentions }: PatientAttentionsListProps) {
  const navigate = useNavigate();

  if (attentions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        Este paciente todavía no tiene atenciones registradas.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {attentions.map((attention) => (
        <Paper
          key={attention.id}
          elevation={0}
          variant="outlined"
          sx={{ p: 2, borderRadius: 2 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="overline" color="text.secondary" fontWeight={700}>
                Atención #{attention.id}
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.25 }}>
                {attention.treatmentName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Inicio:{' '}
                {format(parseISO(attention.startDate), "dd 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </Typography>
            </Box>
            <Stack
              direction={{ xs: 'row', sm: 'column' }}
              spacing={1}
              alignItems={{ xs: 'center', sm: 'flex-end' }}
            >
              <AttentionStatusChip status={attention.status} />
              <Button
                size="small"
                variant="outlined"
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate(`/practitioner/attentions/${attention.id}`)}
              >
                Ver detalle
              </Button>
            </Stack>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
