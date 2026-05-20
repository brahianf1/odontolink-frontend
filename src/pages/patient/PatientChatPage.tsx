import { Box, Typography } from '@mui/material';
import { ChatLayout } from '../../features/chat';

export default function PatientChatPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        flex: 1,
        minHeight: 0,
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={700}>
          Mensajes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conversaciones con tus practicantes.
        </Typography>
      </Box>
      <ChatLayout viewerRole="PATIENT" basePath="/patient/chat" />
    </Box>
  );
}
