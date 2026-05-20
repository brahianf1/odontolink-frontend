import StatusChip, { type StatusTone } from '../../../components/common/StatusChip';
import type { AttentionStatus } from '../../../types/attention.types';

const CONFIG: Record<AttentionStatus, { label: string; tone: StatusTone }> = {
  IN_PROGRESS: { label: 'En curso', tone: 'primary' },
  COMPLETED: { label: 'Completada', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'error' },
};

interface AttentionStatusChipProps {
  status: AttentionStatus;
  size?: 'small' | 'medium';
}

export default function AttentionStatusChip({ status, size = 'small' }: AttentionStatusChipProps) {
  const cfg = CONFIG[status];
  return <StatusChip label={cfg.label} tone={cfg.tone} size={size} />;
}
