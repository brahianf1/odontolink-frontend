import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle as OkIcon,
  ErrorOutline as WarnIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { AiAgentHealthResponseDTO } from '../../../../../types/aiAgent.types';
import LifecycleChip from '../common/LifecycleChip';
import ProviderStatusBadge from '../common/ProviderStatusBadge';
import { parseRequirements, requirementLabel } from '../../utils/missingRequirements';

interface HealthSummaryCardProps {
  health: AiAgentHealthResponseDTO;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function HealthSummaryCard({ health, loading, onRefresh }: HealthSummaryCardProps) {
  const requirements = parseRequirements(health.missingRequirements);
  const hasRequirements = requirements.length > 0;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Estado del agente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen del ciclo de vida y requisitos para publicar.
            </Typography>
          </Box>
          {onRefresh && (
            <Tooltip title="Refrescar estado">
              <span>
                <IconButton onClick={onRefresh} disabled={loading} size="small">
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <LifecycleChip lifecycle={health.lifecycle} size="medium" />
          <ProviderStatusBadge
            providerReachable={health.providerReachable}
            providerErrorDetail={health.providerErrorDetail}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Requisitos para publicar
        </Typography>

        {hasRequirements ? (
          <List dense disablePadding>
            {requirements.map((req, idx) => (
              <ListItem key={idx} disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                  <WarnIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={requirementLabel(req)} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <OkIcon color="success" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Todos los requisitos están cumplidos.
            </Typography>
          </Stack>
        )}

        {!health.providerReachable && health.providerErrorDetail && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {health.providerErrorDetail}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
