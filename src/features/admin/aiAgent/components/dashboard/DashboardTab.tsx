import { Alert, Box, CircularProgress, Grid, Skeleton, Stack } from '@mui/material';
import { useAiAgentConfiguration } from '../../hooks/useAiAgentConfiguration';
import { useAiAgentHealth } from '../../hooks/useAiAgentHealth';
import { useAiAgentPreview } from '../../hooks/useAiAgentPreview';
import HealthSummaryCard from './HealthSummaryCard';
import InstructionPreviewCard from './InstructionPreviewCard';
import ProviderSyncCard from './ProviderSyncCard';
import NotConfiguredCallout from './NotConfiguredCallout';

export default function DashboardTab() {
  const {
    configuration,
    loading: loadingConfig,
    error: errorConfig,
    isUnconfigured,
  } = useAiAgentConfiguration();
  const isConfigured = !isUnconfigured && configuration !== null;
  const {
    health,
    loading: loadingHealth,
    error: errorHealth,
    refresh: refreshHealth,
  } = useAiAgentHealth();
  const {
    preview,
    loading: loadingPreview,
    error: errorPreview,
    refresh: refreshPreview,
  } = useAiAgentPreview(isConfigured);

  if (loadingConfig) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={180} />
        <Skeleton variant="rectangular" height={280} />
      </Stack>
    );
  }

  if (errorConfig) {
    return <Alert severity="error">{errorConfig}</Alert>;
  }

  if (isUnconfigured) {
    return <NotConfiguredCallout />;
  }

  if (!configuration) return null;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        {loadingHealth && !health ? (
          <Skeleton variant="rectangular" height={240} />
        ) : errorHealth ? (
          <Alert severity="error">{errorHealth}</Alert>
        ) : health ? (
          <HealthSummaryCard health={health} loading={loadingHealth} onRefresh={refreshHealth} />
        ) : null}
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ProviderSyncCard configuration={configuration} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {loadingPreview && !preview ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorPreview ? (
          <Alert severity="error">{errorPreview}</Alert>
        ) : preview ? (
          <InstructionPreviewCard
            preview={preview}
            loading={loadingPreview}
            onRefresh={refreshPreview}
          />
        ) : null}
      </Grid>
    </Grid>
  );
}
