import { Chip } from '@mui/material';
import type { AttentionStatus } from '../../../types/attention.types';

interface AttentionStatusChipProps {
  status: AttentionStatus;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<
  AttentionStatus,
  { label: string; color: 'success' | 'warning' | 'default' | 'error' }
> = {
  IN_PROGRESS: { label: 'En curso', color: 'warning' },
  COMPLETED: { label: 'Finalizada', color: 'success' },
  CANCELLED: { label: 'Cancelada', color: 'error' },
};

export default function AttentionStatusChip({ status, size = 'small' }: AttentionStatusChipProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}
