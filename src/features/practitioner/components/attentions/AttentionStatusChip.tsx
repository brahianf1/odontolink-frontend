import { Chip } from '@mui/material';
import type { AttentionStatus } from '../../../../types/attention.types';

const CONFIG: Record<AttentionStatus, { label: string; color: 'primary' | 'success' | 'error' }> = {
  IN_PROGRESS: { label: 'En curso', color: 'primary' },
  COMPLETED: { label: 'Completada', color: 'success' },
  CANCELLED: { label: 'Cancelada', color: 'error' },
};

export default function AttentionStatusChip({ status }: { status: AttentionStatus }) {
  const cfg = CONFIG[status];
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
}
