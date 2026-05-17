import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type {
  KnowledgeBaseDocumentKind,
  KnowledgeBaseDocumentResponseDTO,
} from '../../../../../types/aiAgent.types';
import DocumentStatusChip from '../common/DocumentStatusChip';
import DocumentRowActions from './DocumentRowActions';
import { formatBytes } from '../../utils/kbFileValidation';

interface DocumentsTableProps {
  documents: KnowledgeBaseDocumentResponseDTO[];
  totalElements: number;
  page: number;
  pageSize: number;
  mutatingId: number | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (doc: KnowledgeBaseDocumentResponseDTO) => void;
  onDownload: (doc: KnowledgeBaseDocumentResponseDTO) => void;
  onRefreshStatus: (doc: KnowledgeBaseDocumentResponseDTO) => void;
  onDelete: (doc: KnowledgeBaseDocumentResponseDTO) => void;
}

const kindLabel = (kind: KnowledgeBaseDocumentKind): string =>
  kind === 'FAQ_TEXT' ? 'FAQ' : 'Archivo';

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  try {
    return format(parseISO(value), "dd MMM yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return value;
  }
};

export default function DocumentsTable({
  documents,
  totalElements,
  page,
  pageSize,
  mutatingId,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDownload,
  onRefreshStatus,
  onDelete,
}: DocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No hay documentos para mostrar con los filtros actuales.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell sx={{ width: 90 }}>Tipo</TableCell>
              <TableCell sx={{ width: 140 }}>Estado</TableCell>
              <TableCell sx={{ width: 110 }}>Tamaño</TableCell>
              <TableCell sx={{ width: 200 }}>Última indexación</TableCell>
              <TableCell sx={{ width: 200, textAlign: 'right' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => {
              const isBusy = mutatingId === doc.id;
              return (
                <TableRow key={doc.id} hover>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <Stack direction="column">
                      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                        {doc.title}
                      </Typography>
                      {doc.originalFileName && (
                        <Typography variant="caption" color="text.secondary">
                          {doc.originalFileName}
                        </Typography>
                      )}
                      {doc.errorMessage && (
                        <Tooltip title={doc.errorMessage}>
                          <Typography variant="caption" color="error" noWrap>
                            {doc.errorMessage}
                          </Typography>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={kindLabel(doc.kind)}
                      size="small"
                      variant="outlined"
                      color={doc.kind === 'FAQ_TEXT' ? 'secondary' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <DocumentStatusChip status={doc.status} />
                  </TableCell>
                  <TableCell>{formatBytes(doc.sizeBytes ?? undefined)}</TableCell>
                  <TableCell>{formatDate(doc.lastIndexedAt)}</TableCell>
                  <TableCell align="right">
                    <DocumentRowActions
                      document={doc}
                      busy={isBusy}
                      onEdit={onEdit}
                      onDownload={onDownload}
                      onRefreshStatus={onRefreshStatus}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage="Por página:"
      />
    </>
  );
}
