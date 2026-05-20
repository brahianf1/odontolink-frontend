import StatusChip, { type StatusTone } from '../../../components/common/StatusChip';
import type { AppointmentStatus } from '../types/schedule.types';
import { STATUS_CONFIG } from '../types/schedule.types';

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'small' | 'medium';
}

const MUI_TO_TONE: Record<string, StatusTone> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
  default: 'neutral',
};

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const tone = MUI_TO_TONE[config.color] ?? 'neutral';
  return <StatusChip label={config.label} tone={tone} size={size} />;
}
