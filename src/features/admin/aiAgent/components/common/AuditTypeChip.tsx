import { Chip } from '@mui/material';
import type { AiAdminAuditEventType } from '../../../../../types/aiAgent.types';
import { auditTypeMeta } from '../../utils/auditTypes';

interface AuditTypeChipProps {
  type: AiAdminAuditEventType;
  size?: 'small' | 'medium';
}

export default function AuditTypeChip({ type, size = 'small' }: AuditTypeChipProps) {
  const meta = auditTypeMeta(type);
  return <Chip label={meta.label} color={meta.color} size={size} variant="filled" />;
}
