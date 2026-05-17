import { Chip } from '@mui/material';
import type { KnowledgeBaseDocumentStatus } from '../../../../../types/aiAgent.types';
import { documentStatusMeta } from '../../utils/documentStatus';

interface DocumentStatusChipProps {
  status: KnowledgeBaseDocumentStatus;
  size?: 'small' | 'medium';
}

export default function DocumentStatusChip({ status, size = 'small' }: DocumentStatusChipProps) {
  const meta = documentStatusMeta(status);
  return <Chip label={meta.label} color={meta.color} size={size} variant="outlined" />;
}
