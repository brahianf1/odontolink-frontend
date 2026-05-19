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
import type { PolicyRuleResponseDTO } from '../../../../../types/aiAgent.types';

interface PolicyRulesTableProps {
  policyRules: PolicyRuleResponseDTO[];
  mutatingId: number | null;
  recentId?: number | null;
  onEdit: (rule: PolicyRuleResponseDTO) => void;
  onDelete: (rule: PolicyRuleResponseDTO) => void;
  onToggleActive: (rule: PolicyRuleResponseDTO, active: boolean) => void;
}

export default function PolicyRulesTable({
  policyRules,
  mutatingId,
  recentId,
  onEdit,
  onDelete,
  onToggleActive,
}: PolicyRulesTableProps) {
  const theme = useTheme();

  if (policyRules.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Aún no hay reglas configuradas. Creá la primera para empezar a restringir el
          comportamiento del agente.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 90 }}>Activa</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Texto</TableCell>
            <TableCell sx={{ width: 120, textAlign: 'right' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {policyRules.map((rule) => {
            const isBusy = mutatingId === rule.id;
            const isRecent = recentId === rule.id;
            const dimContent = !rule.active;
            return (
              <TableRow
                key={rule.id}
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
                      checked={rule.active}
                      disabled={isBusy}
                      onChange={(e) => onToggleActive(rule, e.target.checked)}
                      size="small"
                    />
                    {isBusy && <CircularProgress size={14} />}
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, opacity: dimContent ? 0.55 : 1 }}>
                  {rule.label}
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
                    title={rule.text}
                  >
                    {rule.text}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(rule)}
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
                        onClick={() => onDelete(rule)}
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
