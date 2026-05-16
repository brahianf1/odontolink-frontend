import { Box, Typography, useTheme } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';

export default function NoSessionSelected() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        textAlign: 'center',
        height: '100%',
        px: 3,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <ChatBubbleOutline
        sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.45 }}
      />
      <Typography variant="h6" color="text.secondary">
        Selecciona una conversación
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        Elige un chat de la lista para ver los mensajes y continuar la
        conversación.
      </Typography>
    </Box>
  );
}
