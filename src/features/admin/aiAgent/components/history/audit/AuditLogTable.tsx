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
import type { AiAdminAuditEventResponseDTO } from '../../../../../../types/aiAgent.types';
import AuditTypeChip from '../../common/AuditTypeChip';

interface AuditLogTableProps {
  events: AiAdminAuditEventResponseDTO[];
  totalElements: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  try {
    return format(parseISO(value), "dd MMM yyyy HH:mm:ss", { locale: es });
  } catch {
    return value;
  }
};

export default function AuditLogTable({
  events,
  totalElements,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AuditLogTableProps) {
  if (events.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No se encontraron eventos de auditoría con los filtros actuales.
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
              <TableCell sx={{ width: 200 }}>Fecha</TableCell>
              <TableCell sx={{ width: 200 }}>Tipo</TableCell>
              <TableCell sx={{ width: 90 }}>Versión</TableCell>
              <TableCell sx={{ width: 100 }}>Usuario</TableCell>
              <TableCell sx={{ width: 100 }}>Override</TableCell>
              <TableCell>Detalle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell>{formatDate(e.occurredAt)}</TableCell>
                <TableCell>
                  <AuditTypeChip type={e.type} />
                </TableCell>
                <TableCell>
                  {e.relatedVersionNumber != null ? `v${e.relatedVersionNumber}` : '—'}
                </TableCell>
                <TableCell>{e.actorUserId != null ? `#${e.actorUserId}` : '—'}</TableCell>
                <TableCell>
                  {e.withOverride === true ? (
                    <Chip label="Sí" color="warning" size="small" />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 360 }}>
                  {e.details ? (
                    <Tooltip title={e.details}>
                      <Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {e.details}
                        </Typography>
                      </Stack>
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
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
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Por página:"
      />
    </>
  );
}
