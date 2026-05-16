import { Box, Typography } from '@mui/material';
import { ChatLayout } from '../../features/chat';

export default function ChatPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={700}>
          Mensajes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conversaciones con tus pacientes.
        </Typography>
      </Box>
      <ChatLayout viewerRole="PRACTITIONER" basePath="/practitioner/chat" />
    </Box>
  );
}
