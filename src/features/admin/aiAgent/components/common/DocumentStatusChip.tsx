import { Chip, CircularProgress } from '@mui/material';
import type { KnowledgeBaseDocumentStatus } from '../../../../../types/aiAgent.types';
import { documentStatusMeta, isTransitionalStatus } from '../../utils/documentStatus';

interface DocumentStatusChipProps {
  status: KnowledgeBaseDocumentStatus;
  size?: 'small' | 'medium';
}

export default function DocumentStatusChip({ status, size = 'small' }: DocumentStatusChipProps) {
  const meta = documentStatusMeta(status);
  const transitional = isTransitionalStatus(status);
  return (
    <Chip
      label={meta.label}
      color={meta.color}
      size={size}
      variant="outlined"
      icon={
        transitional ? (
          <CircularProgress
            size={12}
            thickness={5}
            color="inherit"
            aria-label="Procesando"
          />
        ) : undefined
      }
    />
  );
}
