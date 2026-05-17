import { MenuItem, TextField } from '@mui/material';
import type { KnowledgeBaseDocumentStatus } from '../../../../../types/aiAgent.types';
import { documentStatusMeta } from '../../utils/documentStatus';

interface KbStatusFilterProps {
  value: KnowledgeBaseDocumentStatus | '';
  onChange: (value: KnowledgeBaseDocumentStatus | '') => void;
  disabled?: boolean;
}

const STATUSES: KnowledgeBaseDocumentStatus[] = [
  'PENDING_UPLOAD',
  'UPLOADED',
  'REGISTERED',
  'INDEXING',
  'INDEXED',
  'FAILED',
];

export default function KbStatusFilter({ value, onChange, disabled }: KbStatusFilterProps) {
  return (
    <TextField
      select
      size="small"
      label="Estado"
      value={value}
      onChange={(e) => onChange(e.target.value as KnowledgeBaseDocumentStatus | '')}
      disabled={disabled}
      sx={{ minWidth: 180 }}
    >
      <MenuItem value="">Todos</MenuItem>
      {STATUSES.map((s) => (
        <MenuItem key={s} value={s}>
          {documentStatusMeta(s).label}
        </MenuItem>
      ))}
    </TextField>
  );
}
