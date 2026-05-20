import StatusChip, { type StatusTone } from '../../../components/common/StatusChip';
import type { AppointmentStatus } from '../../../types/appointment.types';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; tone: StatusTone }> = {
  SCHEDULED: { label: 'Programado', tone: 'info' },
  COMPLETED: { label: 'Completado', tone: 'success' },
  CANCELLED: { label: 'Cancelado', tone: 'error' },
  NO_SHOW: { label: 'No se presentó', tone: 'warning' },
};

interface AppointmentStatusChipProps {
  status: AppointmentStatus;
  size?: 'small' | 'medium';
}

export default function AppointmentStatusChip({ status, size = 'small' }: AppointmentStatusChipProps) {
  const config = STATUS_CONFIG[status];
  return <StatusChip label={config.label} tone={config.tone} size={size} />;
}
