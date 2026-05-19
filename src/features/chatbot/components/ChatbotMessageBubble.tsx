import { useCallback, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CheckCircleOutline as KbIcon,
  CloudOff as DegradedIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import type { ChatbotMessage } from '../../../types/chatbot.types';
import { confidenceMeta } from '../utils/confidenceLabel';
import ChatbotEmergencyBanner from './ChatbotEmergencyBanner';
import ChatbotPiiBanner from './ChatbotPiiBanner';
import ChatbotMarkdownContent from './ChatbotMarkdownContent';

interface ChatbotMessageBubbleProps {
  message: ChatbotMessage;
  isLastBotMessage?: boolean;
  canRegenerate?: boolean;
  onRetry?: (messageId: string) => void;
  onRegenerate?: () => void;
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

export default function ChatbotMessageBubble({
  message,
  isLastBotMessage = false,
  canRegenerate = false,
  onRetry,
  onRegenerate,
}: ChatbotMessageBubbleProps) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const isMine = message.role === 'user';
  const isFailed = isMine && message.status === 'failed';
  const isSending = isMine && message.status === 'sending';
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
  const showRegenerate =
    !isMine && isLastBotMessage && !isFallback && canRegenerate && onRegenerate;

  const mineBg = theme.palette.primary.main;
  const mineFg = theme.palette.primary.contrastText;
  const botBg =
    theme.palette.mode === 'dark'
      ? theme.palette.background.default
      : theme.palette.grey[100];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fallback when clipboard API is unavailable or denied.
    }
  }, [message.content]);

  const handleRetry = useCallback(() => {
    if (onRetry) onRetry(message.id);
  }, [message.id, onRetry]);

  return (
      <Box
        id={`chatbot-msg-${message.id}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMine ? 'flex-end' : 'flex-start',
          px: 1,
          mb: 0.75,
          scrollMarginTop: 12,
          // Patrón Intercom/Crisp/Drift: fade + slide-up sutil al aparecer.
          // `both` aplica el frame inicial inmediatamente para evitar flash.
          '@keyframes chatbot-bubble-enter': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          animation: 'chatbot-bubble-enter 320ms cubic-bezier(0.4, 0, 0.2, 1) both',
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
            border: isMine
              ? isFailed
                ? `1px solid ${theme.palette.error.main}`
                : 'none'
              : `1px solid ${theme.palette.divider}`,
            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            px: 1.5,
            py: 1,
            opacity: isFallback || isSending ? 0.7 : 1,
            '&:hover .chatbot-msg-action': { opacity: 1 },
          }}
        >
          {isMine ? (
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
          ) : (
            <ChatbotMarkdownContent content={message.content} />
          )}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            sx={{ mt: 0.5, justifyContent: 'flex-end', opacity: 0.85 }}
          >
            {!isMine && (
              <Tooltip title={copied ? 'Copiado' : 'Copiar'} arrow placement="top">
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  aria-label={copied ? 'Mensaje copiado' : 'Copiar mensaje'}
                  className="chatbot-msg-action"
                  sx={{
                    p: 0.25,
                    color: 'inherit',
                    opacity: { xs: 0.7, sm: 0 },
                    transition: 'opacity 150ms',
                  }}
                >
                  {copied ? (
                    <CheckIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <CopyIcon sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {showRegenerate && (
              <Tooltip title="Regenerar respuesta" arrow placement="top">
                <IconButton
                  size="small"
                  onClick={onRegenerate}
                  aria-label="Regenerar respuesta"
                  className="chatbot-msg-action"
                  sx={{
                    p: 0.25,
                    color: 'inherit',
                    opacity: { xs: 0.7, sm: 0 },
                    transition: 'opacity 150ms',
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'inherit' }}>
              {formatTimestamp(message.timestamp)}
            </Typography>
          </Stack>
        </Box>

        {isFailed && (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ mt: 0.5, maxWidth: { xs: '85%', sm: '80%' } }}
          >
            <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />
            <Typography variant="caption" color="error.main" sx={{ fontSize: '0.72rem' }}>
              {message.error || 'No se pudo enviar.'}
            </Typography>
            {onRetry && (
              <Tooltip title="Reintentar" arrow placement="top">
                <IconButton
                  size="small"
                  onClick={handleRetry}
                  aria-label="Reintentar envío"
                  sx={{ p: 0.25, color: 'error.main' }}
                >
                  <RefreshIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}

        {!isMine && (showConfidence || showKbChip || isFallback) && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              mt: 0.5,
              flexWrap: 'wrap',
              rowGap: 0.5,
              maxWidth: { xs: '85%', sm: '80%' },
            }}
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
