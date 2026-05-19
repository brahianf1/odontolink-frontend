import { Avatar, Box, Typography, useTheme } from '@mui/material';
import { SupportAgent as AgentIcon } from '@mui/icons-material';
import ChatbotMarkdownContent from './ChatbotMarkdownContent';

interface ChatbotWelcomeScreenProps {
  displayName?: string;
  welcomeMessage?: string;
}

const formatNowHHmm = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function ChatbotWelcomeScreen({
  displayName,
  welcomeMessage,
}: ChatbotWelcomeScreenProps) {
  const theme = useTheme();
  const name = displayName?.trim() || 'Asistente virtual';
  const botBg =
    theme.palette.mode === 'dark'
      ? theme.palette.background.default
      : theme.palette.grey[100];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pt: 3,
        pb: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 3,
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            mb: 1,
            boxShadow: 2,
          }}
        >
          <AgentIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Asistente virtual
        </Typography>
      </Box>
      {welcomeMessage && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            px: 1,
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: '90%', sm: '85%' },
              backgroundColor: botBg,
              color: 'text.primary',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '16px 16px 16px 4px',
              px: 1.5,
              py: 1,
            }}
          >
            <ChatbotMarkdownContent content={welcomeMessage} />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.5,
                fontSize: '0.7rem',
                color: 'text.secondary',
                textAlign: 'right',
              }}
            >
              {formatNowHHmm()}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
