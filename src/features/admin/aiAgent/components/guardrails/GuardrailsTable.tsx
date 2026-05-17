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
import type { GuardrailResponseDTO } from '../../../../../types/aiAgent.types';

interface GuardrailsTableProps {
  guardrails: GuardrailResponseDTO[];
  mutatingId: number | null;
  recentId?: number | null;
  onEdit: (g: GuardrailResponseDTO) => void;
  onDelete: (g: GuardrailResponseDTO) => void;
  onToggleActive: (g: GuardrailResponseDTO, active: boolean) => void;
}

export default function GuardrailsTable({
  guardrails,
  mutatingId,
  recentId,
  onEdit,
  onDelete,
  onToggleActive,
}: GuardrailsTableProps) {
  const theme = useTheme();

  if (guardrails.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Aún no hay guardrails. Creá el primero para empezar a restringir el comportamiento del
          agente.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 90 }}>Activo</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Texto</TableCell>
            <TableCell sx={{ width: 120, textAlign: 'right' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {guardrails.map((g) => {
            const isBusy = mutatingId === g.id;
            const isRecent = recentId === g.id;
            const dimContent = !g.active;
            return (
              <TableRow
                key={g.id}
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
                      checked={g.active}
                      disabled={isBusy}
                      onChange={(e) => onToggleActive(g, e.target.checked)}
                      size="small"
                    />
                    {isBusy && <CircularProgress size={14} />}
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, opacity: dimContent ? 0.55 : 1 }}>
                  {g.label}
                </TableCell>
                <TableCell sx={{ maxWidth: 360, opacity: dimContent ? 0.55 : 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    title={g.text}
                  >
                    {g.text}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(g)}
                        disabled={isBusy}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(g)}
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
    </TableContainer>
  );
}
