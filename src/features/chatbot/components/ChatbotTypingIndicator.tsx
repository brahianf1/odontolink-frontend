import { Avatar, Box, Stack, Typography } from '@mui/material';
import { SupportAgent as AgentIcon } from '@mui/icons-material';

interface ChatbotTypingIndicatorProps {
  displayName?: string;
}

const KEYFRAMES = `
  @keyframes chatbot-typing-bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-3px); opacity: 1; }
  }
`;

export default function ChatbotTypingIndicator({
  displayName,
}: ChatbotTypingIndicatorProps) {
  const name = displayName?.trim() || 'El asistente';

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'flex-start', px: 1, mb: 0.75 }}
      role="status"
      aria-label={`${name} está escribiendo`}
    >
      <style>{KEYFRAMES}</style>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1.25,
          py: 0.75,
          borderRadius: '16px 16px 16px 4px',
          backgroundColor: (t) =>
            t.palette.mode === 'dark' ? t.palette.background.default : t.palette.grey[100],
          border: 1,
          borderColor: 'divider',
          maxWidth: { xs: '85%', sm: '80%' },
        }}
      >
        <Avatar
          sx={{
            width: 22,
            height: 22,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <AgentIcon sx={{ fontSize: 14 }} />
        </Avatar>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: '0.75rem', lineHeight: 1 }}
        >
          {name} está escribiendo
        </Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 0.25 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: (t) =>
                  t.palette.mode === 'dark' ? t.palette.grey[400] : t.palette.grey[600],
                animation: 'chatbot-typing-bounce 1.2s infinite ease-in-out',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
