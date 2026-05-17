import { CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import {
  Download as DownloadIcon,
  EditOutlined as EditIcon,
  Refresh as RefreshIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import type { KnowledgeBaseDocumentResponseDTO } from '../../../../../types/aiAgent.types';

interface DocumentRowActionsProps {
  document: KnowledgeBaseDocumentResponseDTO;
  busy: boolean;
  onEdit: (doc: KnowledgeBaseDocumentResponseDTO) => void;
  onDownload: (doc: KnowledgeBaseDocumentResponseDTO) => void;
  onRefreshStatus: (doc: KnowledgeBaseDocumentResponseDTO) => void;
  onDelete: (doc: KnowledgeBaseDocumentResponseDTO) => void;
}

export default function DocumentRowActions({
  document,
  busy,
  onEdit,
  onDownload,
  onRefreshStatus,
  onDelete,
}: DocumentRowActionsProps) {
  return (
    <Stack direction="row" spacing={0} alignItems="center" justifyContent="flex-end">
      {busy && <CircularProgress size={14} sx={{ mr: 1 }} />}
      <Tooltip title="Refrescar estado">
        <span>
          <IconButton size="small" onClick={() => onRefreshStatus(document)} disabled={busy}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Descargar">
        <span>
          <IconButton size="small" onClick={() => onDownload(document)} disabled={busy}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Editar">
        <span>
          <IconButton size="small" onClick={() => onEdit(document)} disabled={busy}>
            <EditIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Eliminar">
        <span>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(document)}
            disabled={busy}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
