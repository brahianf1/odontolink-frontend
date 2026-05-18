import { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress, Paper, Typography, type AlertColor } from '@mui/material';
import ChatbotHeader from './ChatbotHeader';
import ChatbotDenyState from './ChatbotDenyState';
import ChatbotMessageList from './ChatbotMessageList';
import ChatbotComposer from './ChatbotComposer';
import ChatbotConfirmResetDialog from './ChatbotConfirmResetDialog';
import ChatbotErrorSnackbar from './ChatbotErrorSnackbar';
import ChatbotRateLimitOverlay from './ChatbotRateLimitOverlay';
import { useChatbotSession } from '../hooks/useChatbotSession';
import { useChatbotMessages } from '../hooks/useChatbotMessages';
import { useRateLimitCountdown } from '../hooks/useRateLimitCountdown';
import { closeSession as closeSessionApi } from '../../../services/api/chatbotService';
import type {
  ChatbotDenyReason,
  ChatbotPublicInfoResponseDTO,
} from '../../../types/chatbot.types';

interface ChatbotPanelProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  info: ChatbotPublicInfoResponseDTO | null;
  onClose: () => void;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export default function ChatbotPanel({
  open,
  loading,
  error,
  info,
  onClose,
}: ChatbotPanelProps) {
  const { session, saveSession, clearSession } = useChatbotSession();
  const [denyOverride, setDenyOverride] = useState<ChatbotDenyReason | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'error',
  });

  const showSnackbar = useCallback((message: string, severity: AlertColor = 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleSessionEstablished = useCallback(
    (data: { sessionId: string; anonymousToken?: string | null }) => {
      saveSession(data);
    },
    [saveSession]
  );

  const handleSessionExpired = useCallback(() => {
    clearSession();
    showSnackbar('La conversación expiró, empezamos de cero.', 'info');
  }, [clearSession, showSnackbar]);

  const handleAccessRevoked = useCallback(
    (reason: 'authentication' | 'access') => {
      const newReason: ChatbotDenyReason =
        reason === 'authentication' ? 'AUTHENTICATION_REQUIRED' : 'AGENT_DISABLED';
      setDenyOverride(newReason);
    },
    []
  );

  const { messages, sending, rateLimitedUntilMs, sendMessage, reset } = useChatbotMessages({
    session,
    onSessionEstablished: handleSessionEstablished,
    onSessionExpired: handleSessionExpired,
    onAccessRevoked: handleAccessRevoked,
    onError: (mapped) => showSnackbar(mapped.message, 'error'),
  });
  const countdownSeconds = useRateLimitCountdown(rateLimitedUntilMs);
  const isRateLimited = countdownSeconds > 0;

  // Reset denyOverride if info comes back fresh granting access.
  useEffect(() => {
    if (info?.accessGranted && denyOverride !== null) {
      setDenyOverride(null);
    }
  }, [info, denyOverride]);

  const handleNewConversation = useCallback(() => {
    if (messages.length === 0 && !session) return;
    setConfirmResetOpen(true);
  }, [messages.length, session]);

  const handleConfirmReset = useCallback(async () => {
    setResetting(true);
    try {
      if (session) {
        try {
          await closeSessionApi(session.sessionId, session.anonymousToken);
        } catch {
          // Best-effort: backend errors here don't block local reset.
        }
      }
      clearSession();
      reset();
      setDenyOverride(null);
      setConfirmResetOpen(false);
      showSnackbar('Listo, empezamos una nueva conversación.', 'success');
    } finally {
      setResetting(false);
    }
  }, [clearSession, reset, session, showSnackbar]);

  const renderBody = () => {
    if (loading && !info) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <CircularProgress size={32} />
        </Box>
      );
    }

    if (error && !info) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No se pudo cargar el asistente. Intentá reabrirlo en unos minutos.
          </Typography>
        </Box>
      );
    }

    const effectiveDenyReason: ChatbotDenyReason | null =
      denyOverride ??
      (info && !info.accessGranted && info.denyReason ? info.denyReason : null);

    if (effectiveDenyReason) {
      return <ChatbotDenyState reason={effectiveDenyReason} />;
    }

    if (info?.accessGranted) {
      return (
        <>
          <ChatbotMessageList messages={messages} welcomeMessage={info.welcomeMessage} />
          {isRateLimited ? (
            <ChatbotRateLimitOverlay secondsLeft={countdownSeconds} />
          ) : (
            <ChatbotComposer disabled={sending} onSend={sendMessage} />
          )}
        </>
      );
    }

    return null;
  };

  const headerShowsNewConversation =
    info?.accessGranted && (messages.length > 0 || session !== null);

  return (
    <Paper
      elevation={open ? 6 : 0}
      role="dialog"
      aria-label="Asistente virtual"
      aria-hidden={!open}
      sx={{
        position: 'fixed',
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: (theme) => theme.zIndex.modal,
        bottom: { xs: 0, sm: 96 },
        right: { xs: 0, sm: 24 },
        left: { xs: 0, sm: 'auto' },
        top: { xs: 0, sm: 'auto' },
        width: { xs: '100%', sm: 380 },
        height: { xs: '100%', sm: 600 },
        maxHeight: { xs: '100%', sm: '80vh' },
        borderRadius: { xs: 0, sm: 2 },
        border: { xs: 0, sm: 1 },
        borderColor: { sm: 'divider' },
      }}
    >
      <ChatbotHeader
        displayName={info?.displayName}
        onClose={onClose}
        onNewConversation={
          headerShowsNewConversation ? handleNewConversation : undefined
        }
        newConversationDisabled={resetting || sending}
      />
      {renderBody()}
      <ChatbotConfirmResetDialog
        open={confirmResetOpen}
        submitting={resetting}
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={handleConfirmReset}
      />
      <ChatbotErrorSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Paper>
  );
}
