import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AttentionResponseDTO } from '../../../../types/attention.types';
import type { OfferedTreatmentResponseDTO } from '../../../../types/practitioner.types';
import { AttentionStatusChip } from '../../../attentions';

interface AttentionCardProps {
  attention: AttentionResponseDTO;
  treatmentOffer?: OfferedTreatmentResponseDTO;
  onOpenDetail: (attention: AttentionResponseDTO) => void;
}

/**
 * Summary card rendered in the attention list. All write operations live
 * on the dedicated detail page (`/practitioner/attentions/:id`), so this
 * card only surfaces metadata and a single CTA that navigates there. The
 * quota progress bar still lives here because it is a list-level concern
 * (the practitioner compares cases against the same offer's quota).
 */
export default function AttentionCard({
  attention,
  treatmentOffer,
  onOpenDetail,
}: AttentionCardProps) {
  const pendingAppointments =
    attention.appointments?.filter((a) => a.status === 'SCHEDULED').length ?? 0;

  const max = treatmentOffer?.maxCompletedAttentions ?? 0;
  const completed = treatmentOffer?.currentCompletedAttentions ?? 0;
  const showQuota = max > 0 && treatmentOffer != null;
  const quotaPct = showQuota ? Math.min((completed / max) * 100, 100) : 0;
  const quotaFull = showQuota && completed >= max;

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" fontWeight={700}>
              Atención #{attention.id}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {attention.patientName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {attention.treatmentName}
            </Typography>
          </Box>
          <AttentionStatusChip status={attention.status} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              INICIO
            </Typography>
            <Typography variant="body2">
              {format(parseISO(attention.startDate), 'dd MMM yyyy', { locale: es })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              TURNOS
            </Typography>
            <Typography variant="body2">{attention.appointments?.length ?? 0}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              PENDIENTES
            </Typography>
            <Typography
              variant="body2"
              color={pendingAppointments > 0 ? 'warning.main' : 'text.primary'}
              fontWeight={pendingAppointments > 0 ? 600 : 400}
            >
              {pendingAppointments}
            </Typography>
          </Box>
        </Box>

        {showQuota && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: (t) =>
                alpha(quotaFull ? t.palette.info.main : t.palette.primary.main, 0.05),
              border: '1px solid',
              borderColor: (t) =>
                alpha(quotaFull ? t.palette.info.main : t.palette.primary.main, 0.15),
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                CUPO DE LA OFERTA
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                color={quotaFull ? 'info.dark' : 'primary.dark'}
              >
                {completed} de {max}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={quotaPct}
              color={quotaFull ? 'info' : 'primary'}
              sx={{ height: 4, borderRadius: 999 }}
            />
          </Box>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            endIcon={<ChevronRight />}
            onClick={() => onOpenDetail(attention)}
            fullWidth
          >
            Ver detalle
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
