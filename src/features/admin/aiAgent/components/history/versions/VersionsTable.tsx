import {
  Box,
  Button,
  Chip,
  IconButton,
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
import {
  History as RollbackIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AiAgentConfigurationVersionResponseDTO } from '../../../../../../types/aiAgent.types';
import { retrievalMethodMeta } from '../../../utils/retrievalMethods';

interface VersionsTableProps {
  versions: AiAgentConfigurationVersionResponseDTO[];
  totalElements: number;
  page: number;
  pageSize: number;
  rollingBackVersion: number | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (v: AiAgentConfigurationVersionResponseDTO) => void;
  onRollback: (v: AiAgentConfigurationVersionResponseDTO) => void;
}

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  try {
    return format(parseISO(value), "dd MMM yyyy HH:mm", { locale: es });
  } catch {
    return value;
  }
};

export default function VersionsTable({
  versions,
  totalElements,
  page,
  pageSize,
  rollingBackVersion,
  onPageChange,
  onPageSizeChange,
  onView,
  onRollback,
}: VersionsTableProps) {
  if (versions.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Todavía no hay versiones publicadas.
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
              <TableCell sx={{ width: 90 }}>Versión</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell sx={{ width: 160 }}>Método</TableCell>
              <TableCell sx={{ width: 100 }}>Override</TableCell>
              <TableCell sx={{ width: 180 }}>Publicada</TableCell>
              <TableCell sx={{ width: 160, textAlign: 'right' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.map((v) => {
              const isBusy = rollingBackVersion === v.versionNumber;
              return (
                <TableRow key={v.versionNumber} hover>
                  <TableCell sx={{ fontWeight: 700 }}>v{v.versionNumber}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" fontWeight={600} noWrap title={v.displayName}>
                      {v.displayName || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>{retrievalMethodMeta(v.retrievalMethod).label}</TableCell>
                  <TableCell>
                    {v.publishedWithOverride ? (
                      <Chip label="Override" size="small" color="warning" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(v.publishedAt)}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                      alignItems="center"
                    >
                      <Tooltip title="Ver detalle">
                        <span>
                          <IconButton size="small" onClick={() => onView(v)} disabled={isBusy}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Restaurar esta versión">
                        <span>
                          <Button
                            size="small"
                            color="warning"
                            variant="outlined"
                            startIcon={<RollbackIcon fontSize="small" />}
                            onClick={() => onRollback(v)}
                            disabled={isBusy}
                          >
                            Rollback
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
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
