import { Box, Typography, Tooltip, useTheme } from '@mui/material';
import { Done, DoneAll, Schedule, ErrorOutline } from '@mui/icons-material';
import type { OptimisticMessage } from '../types/chat.types';
import { formatMessageTime } from '../utils/chatTimeFormat';

interface MessageBubbleProps {
  message: OptimisticMessage;
  isMine: boolean;
  showSenderName: boolean;
  onRetry?: (tempId: number) => void;
}

export default function MessageBubble({
  message,
  isMine,
  showSenderName,
  onRetry,
}: MessageBubbleProps) {
  const theme = useTheme();
  const sentLabel = formatMessageTime(message.sentAt);

  const mineBg = theme.palette.primary.main;
  const mineFg = theme.palette.primary.contrastText;
  const otherBg =
    theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.grey[100];
  const otherFg = theme.palette.text.primary;
  const otherBorder = theme.palette.divider;

  const failed = message.status === 'failed';
  const sending = message.status === 'sending';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        mb: 0.75,
        px: 1,
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: '85%', sm: '70%', md: '60%' },
          backgroundColor: isMine ? mineBg : otherBg,
          color: isMine ? mineFg : otherFg,
          border: isMine ? 'none' : `1px solid ${otherBorder}`,
          px: 1.5,
          py: 1,
        }}
      >
        {showSenderName && !isMine && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              mb: 0.25,
            }}
          >
            {message.senderName}
          </Typography>
        )}

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

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
            mt: 0.5,
            opacity: 0.85,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontSize: '0.7rem', color: 'inherit' }}
          >
            {sentLabel}
          </Typography>

          {isMine && sending && (
            <Tooltip title="Enviando…">
              <Schedule sx={{ fontSize: 14, color: 'inherit' }} />
            </Tooltip>
          )}

          {isMine && !sending && !failed && !message.readAt && (
            <Tooltip title="Enviado">
              <Done sx={{ fontSize: 14, color: 'inherit' }} />
            </Tooltip>
          )}

          {isMine && !sending && !failed && message.readAt && (
            <Tooltip title={`Leído ${formatMessageTime(message.readAt)}`}>
              <DoneAll sx={{ fontSize: 14, color: 'inherit' }} />
            </Tooltip>
          )}

          {isMine && failed && (
            <Tooltip title="No se pudo enviar. Click para reintentar.">
              <Box
                component="button"
                type="button"
                onClick={() => onRetry?.(message.id)}
                sx={{
                  background: 'none',
                  border: 'none',
                  p: 0,
                  m: 0,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  color: theme.palette.error.main,
                }}
                aria-label="Reintentar envío"
              >
                <ErrorOutline sx={{ fontSize: 14 }} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}
