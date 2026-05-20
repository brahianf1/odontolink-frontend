import StatusChip, { type StatusTone } from '../../../components/common/StatusChip';
import type { AppointmentStatus } from '../../../types/appointment.types';

interface AppointmentStatusChipProps {
  status: AppointmentStatus;
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; tone: StatusTone }> = {
  SCHEDULED: { label: 'Programado', tone: 'info' },
  COMPLETED: { label: 'Completado', tone: 'success' },
  CANCELLED: { label: 'Cancelado', tone: 'error' },
  NO_SHOW: { label: 'No se presentó', tone: 'warning' },
};

export default function AppointmentStatusChip({ status }: AppointmentStatusChipProps) {
  const config = STATUS_CONFIG[status];
  return <StatusChip label={config.label} tone={config.tone} />;
}
