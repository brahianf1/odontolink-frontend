import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EmergencyKeywordResponseDTO } from '../../../../../types/aiAgent.types';

interface EmergencyKeywordsTableProps {
  keywords: EmergencyKeywordResponseDTO[];
  mutatingId: number | null;
  recentId?: number | null;
  onEdit: (keyword: EmergencyKeywordResponseDTO) => void;
  onDelete: (keyword: EmergencyKeywordResponseDTO) => void;
  onToggleActive: (keyword: EmergencyKeywordResponseDTO, active: boolean) => void;
}

const safeFormat = (iso: string): string => {
  try {
    return format(new Date(iso), "d 'de' MMM yyyy, HH:mm", { locale: es });
  } catch {
    return iso;
  }
};

export default function EmergencyKeywordsTable({
  keywords,
  mutatingId,
  recentId,
  onEdit,
  onDelete,
  onToggleActive,
}: EmergencyKeywordsTableProps) {
  const theme = useTheme();

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 90 }}>Activo</TableCell>
            <TableCell>Término</TableCell>
            <TableCell sx={{ width: 220 }}>Actualizado</TableCell>
            <TableCell sx={{ width: 120, textAlign: 'right' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keywords.map((k) => {
            const isBusy = mutatingId === k.id;
            const isRecent = recentId === k.id;
            const dim = !k.active;
            return (
              <TableRow
                key={k.id}
                hover
                sx={{
                  backgroundColor: isRecent
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  transition: 'background-color 1.6s ease-out',
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Switch
                      checked={k.active}
                      disabled={isBusy}
                      onChange={(e) => onToggleActive(k, e.target.checked)}
                      size="small"
                    />
                    {isBusy && <CircularProgress size={14} />}
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, opacity: dim ? 0.55 : 1 }}>
                  {k.term}
                </TableCell>
                <TableCell sx={{ opacity: dim ? 0.55 : 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {safeFormat(k.updatedAt)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <span>
                      <IconButton size="small" onClick={() => onEdit(k)} disabled={isBusy}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(k)}
                        disabled={isBusy}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {keywords.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No hay palabras configuradas.
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
}
