import { Chip } from '@mui/material';
import type { AppointmentStatus } from '../../../types/appointment.types';

interface AppointmentStatusChipProps {
  status: AppointmentStatus;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: 'success' | 'warning' | 'default' | 'error' | 'info' }
> = {
  SCHEDULED: { label: 'Programado', color: 'info' },
  COMPLETED: { label: 'Completado', color: 'success' },
  CANCELLED: { label: 'Cancelado', color: 'error' },
  NO_SHOW: { label: 'No se presentó', color: 'warning' },
};

export default function AppointmentStatusChip({ status }: AppointmentStatusChipProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}
