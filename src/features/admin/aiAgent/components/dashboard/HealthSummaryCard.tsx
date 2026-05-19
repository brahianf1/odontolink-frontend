import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
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
import {
  computeLocalRequirements,
  mergeRequirements,
} from '../../utils/localRequirements';
import { useAiAgentContext } from '../AiAgentContext';

interface HealthSummaryCardProps {
  health: AiAgentHealthResponseDTO;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function HealthSummaryCard({ health, loading, onRefresh }: HealthSummaryCardProps) {
  const { configuration, governance } = useAiAgentContext();
  const requirements = mergeRequirements(
    parseRequirements(health.missingRequirements),
    computeLocalRequirements(configuration, governance)
  );
  const hasRequirements = requirements.length > 0;

  return (
    <Card variant="outlined" aria-busy={loading || undefined}>
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
            <Tooltip title={loading ? 'Refrescando…' : 'Refrescar estado'}>
              <span>
                <IconButton
                  onClick={onRefresh}
                  disabled={loading}
                  size="small"
                  aria-label="Refrescar estado del agente"
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>

        {loading ? (
          <Box aria-live="polite">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Skeleton variant="rounded" width={100} height={32} />
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Skeleton variant="circular" width={20} height={20} />
                <Typography variant="body2" sx={{ width: 140 }}>
                  <Skeleton variant="text" />
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle2"
              fontWeight={700}
              gutterBottom
              sx={{ width: 180 }}
            >
              <Skeleton variant="text" />
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={20} height={20} />
              <Typography variant="body2" sx={{ width: 240 }}>
                <Skeleton variant="text" />
              </Typography>
            </Stack>
          </Box>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
