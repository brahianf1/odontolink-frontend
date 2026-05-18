import { Box, Chip, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import {
  CheckCircleOutline as KbIcon,
  CloudOff as DegradedIcon,
} from '@mui/icons-material';
import type { ChatbotMessage } from '../../../types/chatbot.types';
import { confidenceMeta } from '../utils/confidenceLabel';
import ChatbotEmergencyBanner from './ChatbotEmergencyBanner';
import ChatbotPiiBanner from './ChatbotPiiBanner';

interface ChatbotMessageBubbleProps {
  message: ChatbotMessage;
}

const formatTimestamp = (iso: string): string => {
  try {
    const date = new Date(iso);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
};

export default function ChatbotMessageBubble({ message }: ChatbotMessageBubbleProps) {
  const theme = useTheme();
  const isMine = message.role === 'user';
  const flags = message.flags;
  const isEmergency = flags?.emergencyDetected === true;
  const isPiiBlocked = flags?.piiBlocked === true;
  const isFallback = flags?.fallbackTriggered === true;
  const showConfidence =
    !isMine &&
    !isEmergency &&
    !isPiiBlocked &&
    typeof flags?.confidence === 'number';
  const showKbChip = !isMine && flags?.basedOnKnowledgeBase === true && !isFallback;

  const mineBg = theme.palette.primary.main;
  const mineFg = theme.palette.primary.contrastText;
  const botBg =
    theme.palette.mode === 'dark'
      ? theme.palette.background.default
      : theme.palette.grey[100];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMine ? 'flex-end' : 'flex-start',
        px: 1,
        mb: 0.75,
      }}
    >
      {isEmergency && (
        <Box sx={{ maxWidth: { xs: '85%', sm: '80%' }, width: '100%' }}>
          <ChatbotEmergencyBanner />
        </Box>
      )}
      {isPiiBlocked && (
        <Box sx={{ maxWidth: { xs: '85%', sm: '80%' }, width: '100%' }}>
          <ChatbotPiiBanner detectedTypes={flags?.detectedPiiTypes} />
        </Box>
      )}
      <Box
        sx={{
          maxWidth: { xs: '85%', sm: '80%' },
          backgroundColor: isMine ? mineBg : botBg,
          color: isMine ? mineFg : 'text.primary',
          border: isMine ? 'none' : `1px solid ${theme.palette.divider}`,
          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          px: 1.5,
          py: 1,
          opacity: isFallback ? 0.7 : 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.45,
          }}
        >
          {message.content}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mt: 0.5, justifyContent: 'flex-end', opacity: 0.85 }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'inherit' }}>
            {formatTimestamp(message.timestamp)}
          </Typography>
        </Stack>
      </Box>
      {(showConfidence || showKbChip || isFallback) && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 0.5, maxWidth: { xs: '85%', sm: '80%' } }}
        >
          {showConfidence && (
            <Chip
              size="small"
              variant="outlined"
              color={confidenceMeta(flags!.confidence as number).color}
              label={`Confianza ${flags!.confidence}%`}
            />
          )}
          {showKbChip && (
            <Chip
              size="small"
              variant="outlined"
              color="success"
              icon={<KbIcon sx={{ fontSize: 14 }} />}
              label="Información oficial"
            />
          )}
          {isFallback && (
            <Tooltip title="Servicio temporalmente degradado" arrow>
              <Chip
                size="small"
                variant="outlined"
                color="warning"
                icon={<DegradedIcon sx={{ fontSize: 14 }} />}
                label="Modo degradado"
              />
            </Tooltip>
          )}
        </Stack>
      )}
    </Box>
  );
}
