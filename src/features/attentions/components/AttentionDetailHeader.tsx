import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AttentionResponseDTO } from '../../../types/attention.types';
import AttentionStatusChip from './AttentionStatusChip';

interface AttentionDetailHeaderProps {
  attention: AttentionResponseDTO;
  actions?: ReactNode;
}

const formatDate = (value: string): string => {
  try {
    return format(parseISO(value), "dd 'de' MMM yyyy", { locale: es });
  } catch {
    return value;
  }
};

/**
 * Stable header for an attention detail page. Renders the title, status
 * chip and start date, and exposes an `actions` slot the consumer fills
 * with role-specific buttons (Refrescar, Finalizar, Cancelar, etc.).
 */
export default function AttentionDetailHeader({ attention, actions }: AttentionDetailHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Atención #{attention.id}
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <AttentionStatusChip status={attention.status} />
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Inicio: {formatDate(attention.startDate)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      {actions && (
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {actions}
        </Stack>
      )}
    </Box>
  );
}
