import { Box, useTheme } from '@mui/material';

const KEYFRAMES = `
  @keyframes chatbot-typing-bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-3px); opacity: 1; }
  }
`;

export default function ChatbotTypingIndicator() {
  const theme = useTheme();
  const dotColor =
    theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        px: 1,
        mb: 0.75,
      }}
      role="status"
      aria-label="El asistente está escribiendo"
    >
      <style>{KEYFRAMES}</style>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 1,
          borderRadius: '16px 16px 16px 4px',
          backgroundColor: (t) =>
            t.palette.mode === 'dark' ? t.palette.background.default : t.palette.grey[100],
          border: 1,
          borderColor: 'divider',
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: dotColor,
              animation: 'chatbot-typing-bounce 1.2s infinite ease-in-out',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
