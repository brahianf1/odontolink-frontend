import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AttentionResponseDTO } from '../../../../types/attention.types';
import { AttentionStatusChip } from '../../../attentions';

interface AttentionListTableProps {
  attentions: AttentionResponseDTO[];
  onOpenDetail: (attention: AttentionResponseDTO) => void;
}

/**
 * Compact table view of the practitioner's attentions, mirroring the
 * card grid one row at a time. Same single CTA semantics: every action
 * lives on the dedicated detail page.
 */
export default function AttentionListTable({
  attentions,
  onOpenDetail,
}: AttentionListTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell sx={{ fontWeight: 700 }}>Atención</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tratamiento</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Inicio</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Turnos
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Pendientes
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attentions.map((attention) => {
            const pending =
              attention.appointments?.filter((a) => a.status === 'SCHEDULED').length ?? 0;
            return (
              <TableRow
                key={attention.id}
                hover
                onClick={() => onOpenDetail(attention)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    #{attention.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {attention.patientName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {attention.treatmentName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(parseISO(attention.startDate), 'dd MMM yyyy', { locale: es })}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{attention.appointments?.length ?? 0}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    color={pending > 0 ? 'warning.main' : 'text.primary'}
                    fontWeight={pending > 0 ? 600 : 400}
                  >
                    {pending}
                  </Typography>
                </TableCell>
                <TableCell>
                  <AttentionStatusChip status={attention.status} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver detalle">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(attention);
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          {attentions.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay atenciones en esta vista.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
