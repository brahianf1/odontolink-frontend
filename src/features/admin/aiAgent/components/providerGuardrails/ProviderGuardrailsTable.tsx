import {
  Chip,
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
import { EditOutlined as EditIcon } from '@mui/icons-material';
import type { ProviderGuardrailResponseDTO } from '../../../../../types/aiAgent.types';
import { providerGuardrailTypeMeta } from '../../utils/providerGuardrailTypes';

interface ProviderGuardrailsTableProps {
  items: ProviderGuardrailResponseDTO[];
  mutatingId: number | null;
  recentId?: number | null;
  onEdit: (item: ProviderGuardrailResponseDTO) => void;
  onToggle: (item: ProviderGuardrailResponseDTO, attached: boolean) => void;
}

export default function ProviderGuardrailsTable({
  items,
  mutatingId,
  recentId,
  onEdit,
  onToggle,
}: ProviderGuardrailsTableProps) {
  const theme = useTheme();

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Filtro</TableCell>
            <TableCell sx={{ width: 160 }}>Tipo</TableCell>
            <TableCell sx={{ width: 110 }}>Prioridad</TableCell>
            <TableCell sx={{ width: 90 }}>Activo</TableCell>
            <TableCell sx={{ width: 70, textAlign: 'right' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const isBusy = mutatingId === item.id;
            const isRecent = recentId === item.id;
            const dim = !item.attached;
            const meta = providerGuardrailTypeMeta(item.type);
            return (
              <TableRow
                key={item.id}
                hover
                sx={{
                  backgroundColor: isRecent
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  transition: 'background-color 1.6s ease-out',
                }}
              >
                <TableCell sx={{ opacity: dim ? 0.55 : 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.displayName ?? '(sin nombre)'}
                  </Typography>
                  {item.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ opacity: dim ? 0.55 : 1 }}>
                  <Tooltip title={meta.description} arrow>
                    <Chip
                      label={meta.label}
                      color={meta.color}
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ opacity: dim ? 0.55 : 1 }}>{item.priority}</TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Switch
                      checked={item.attached}
                      disabled={isBusy}
                      onChange={(e) => onToggle(item, e.target.checked)}
                      size="small"
                    />
                    {isBusy && <CircularProgress size={14} />}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar prioridad">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(item)}
                        disabled={isBusy}
                      >
                        <EditIcon fontSize="small" />
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
