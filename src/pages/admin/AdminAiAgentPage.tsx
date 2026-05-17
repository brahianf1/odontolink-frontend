import { Box, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AiAgentProvider, AiAgentTabs } from '../../features/admin/aiAgent';
import PublishButton from '../../features/admin/aiAgent/components/PublishButton';
import UnconfiguredBanner from '../../features/admin/aiAgent/components/UnconfiguredBanner';

export default function AdminAiAgentPage() {
  return (
    <AiAgentProvider>
      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Administración del Agente IA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configuración, guardrails, base de conocimiento, gobernanza y publicación del chatbot.
            </Typography>
          </Box>
          <PublishButton />
        </Stack>
        <UnconfiguredBanner />
        <AiAgentTabs />
        <Box sx={{ pt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </AiAgentProvider>
  );
}
