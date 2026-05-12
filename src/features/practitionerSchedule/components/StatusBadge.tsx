import { Chip } from '@mui/material';
import type { AppointmentStatus } from '../types/schedule.types';
import { STATUS_CONFIG } from '../types/schedule.types';

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 600 }}
    />
  );
}
