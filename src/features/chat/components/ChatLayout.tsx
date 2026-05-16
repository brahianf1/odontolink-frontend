import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Box,
  Paper,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import chatService from '../../../services/api/chatService';
import type {
  ChatSessionResponseDTO,
  ChatViewerRole,
  OptimisticMessage,
} from '../types/chat.types';
import { mapChatError } from '../utils/chatApiErrors';
import { useChatSessions } from '../hooks/useChatSessions';
import { useChatThread } from '../hooks/useChatThread';
import { useChatPolling } from '../hooks/useChatPolling';
import { useInboxPolling } from '../hooks/useInboxPolling';
import ChatSessionList from './ChatSessionList';
import ChatThreadView from './ChatThreadView';
import NoSessionSelected from './NoSessionSelected';
import BlockChatDialog from './BlockChatDialog';
import type { MessageListHandle } from './MessageList';

interface ChatLayoutProps {
  viewerRole: ChatViewerRole;
  basePath: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const SIDEBAR_WIDTH = 340;

export default function ChatLayout({ viewerRole, basePath }: ChatLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const params = useParams<{ sessionId?: string }>();
  const viewerUserId = useAuthStore((state) => state.user?.userId);

  const parsedSessionId = useMemo(() => {
    if (!params.sessionId) return null;
    const n = Number(params.sessionId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.sessionId]);

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    upsertSessions,
    upsertSession,
    clearUnread,
    bumpOnSend,
  } = useChatSessions();

  const thread = useChatThread({ sessionId: parsedSessionId });
  const messageListRef = useRef<MessageListHandle | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [unblockSubmitting, setUnblockSubmitting] = useState(false);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState['severity'] = 'info') => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const selectedSession = useMemo<ChatSessionResponseDTO | null>(() => {
    if (parsedSessionId == null) return null;
    return sessions.find((s) => s.id === parsedSessionId) ?? null;
  }, [parsedSessionId, sessions]);

  // If the URL has a sessionId but it's not in the inbox after load,
  // redirect to the list and notify.
  const notFoundReportedRef = useRef<number | null>(null);
  useEffect(() => {
    if (parsedSessionId == null) {
      notFoundReportedRef.current = null;
      return;
    }
    if (sessionsLoading) return;
    if (selectedSession) {
      notFoundReportedRef.current = null;
      return;
    }
    if (notFoundReportedRef.current === parsedSessionId) return;
    notFoundReportedRef.current = parsedSessionId;
    showSnackbar('No tienes acceso a esa conversación.', 'warning');
    navigate(basePath, { replace: true });
  }, [
    parsedSessionId,
    selectedSession,
    sessionsLoading,
    navigate,
    basePath,
    showSnackbar,
  ]);

  // Mark-as-read coordination.
  const markInFlightRef = useRef<number | null>(null);
  const markedSessionsRef = useRef<Set<number>>(new Set());

  const markAsRead = useCallback(
    async (sessionId: number) => {
      if (markInFlightRef.current === sessionId) return;
      markInFlightRef.current = sessionId;
      try {
        await chatService.markMessagesAsRead(sessionId);
        clearUnread(sessionId);
      } catch (err) {
        const mapped = mapChatError(err, '');
        if (mapped.notParticipant) {
          showSnackbar('No tienes acceso a esa conversación.', 'warning');
          navigate(basePath, { replace: true });
        }
      } finally {
        if (markInFlightRef.current === sessionId) {
          markInFlightRef.current = null;
        }
      }
    },
    [clearUnread, navigate, basePath, showSnackbar]
  );

  // Auto mark-as-read when opening a session with unread messages.
  useEffect(() => {
    if (!selectedSession) return;
    if (selectedSession.unreadCount <= 0) return;
    if (markedSessionsRef.current.has(selectedSession.id)) return;
    markedSessionsRef.current.add(selectedSession.id);
    void markAsRead(selectedSession.id);
  }, [selectedSession, markAsRead]);

  // Reset "already marked" guard when session changes so a future re-entry
  // with new unread messages will re-fire.
  useEffect(() => {
    const marked = markedSessionsRef.current;
    return () => {
      if (parsedSessionId != null) {
        marked.delete(parsedSessionId);
      }
    };
  }, [parsedSessionId]);

  // Thread polling.
  useChatPolling({
    sessionId: parsedSessionId,
    cursor: thread.cursor,
    enabled: parsedSessionId != null && document.visibilityState !== 'hidden',
    onPollSuccess: (data) => {
      thread.applyPoll(data);
      // Bump the session preview if a new incoming message landed.
      if (data.messages.length > 0 && parsedSessionId != null) {
        const last = data.messages[data.messages.length - 1];
        bumpOnSend(parsedSessionId, last.content.slice(0, 120), last.sentAt);
      }
    },
  });

  // Inbox polling — seed cursor with newest lastMessageAt at load.
  const [inboxCursor, setInboxCursor] = useState<string | null>(null);
  useEffect(() => {
    if (sessionsLoading) return;
    if (inboxCursor) return;
    let newest: string | null = null;
    for (const s of sessions) {
      if (s.lastMessageAt && (!newest || s.lastMessageAt > newest)) {
        newest = s.lastMessageAt;
      }
    }
    setInboxCursor(newest ?? new Date().toISOString());
  }, [sessionsLoading, sessions, inboxCursor]);

  useInboxPolling({
    cursor: inboxCursor,
    enabled: inboxCursor != null,
    onUpdates: (updated, advanceTo) => {
      if (updated.length > 0) upsertSessions(updated);
      if (advanceTo) setInboxCursor(advanceTo);
    },
  });

  // Send handler with optimistic update.
  const tempIdRef = useRef(-1);
  const handleSend = useCallback(
    async (content: string) => {
      if (parsedSessionId == null || viewerUserId === undefined) return;
      const tempId = tempIdRef.current--;
      const now = new Date().toISOString();
      const tempMessage: OptimisticMessage = {
        id: tempId,
        chatSessionId: parsedSessionId,
        senderId: viewerUserId,
        senderName: 'Tú',
        content,
        sentAt: now,
        readAt: null,
        status: 'sending',
      };
      thread.startSend(tempMessage);
      bumpOnSend(parsedSessionId, content.slice(0, 120), now);

      try {
        const serverMessage = await chatService.sendMessage(parsedSessionId, {
          content,
        });
        thread.confirmSend(tempId, serverMessage);
        bumpOnSend(
          parsedSessionId,
          serverMessage.content.slice(0, 120),
          serverMessage.sentAt
        );
      } catch (err) {
        thread.failSend(tempId);
        const mapped = mapChatError(err, 'No pudimos enviar tu mensaje.');
        showSnackbar(mapped.message, 'error');
        if (mapped.isBlocked) {
          // Refresh session to reflect new blocked state.
          try {
            const refreshed = await chatService.getMyChatSessions();
            upsertSessions(refreshed);
          } catch {
            // best-effort
          }
        } else if (mapped.notParticipant) {
          navigate(basePath, { replace: true });
        }
      }
    },
    [
      parsedSessionId,
      viewerUserId,
      thread,
      bumpOnSend,
      showSnackbar,
      upsertSessions,
      navigate,
      basePath,
    ]
  );

  const handleRetrySend = useCallback(
    async (tempId: number) => {
      const failedMessage = thread.messages.find(
        (m) => m.id === tempId && m.status === 'failed'
      );
      if (!failedMessage || parsedSessionId == null) return;
      thread.retrySend(tempId);
      try {
        const serverMessage = await chatService.sendMessage(parsedSessionId, {
          content: failedMessage.content,
        });
        thread.confirmSend(tempId, serverMessage);
        bumpOnSend(
          parsedSessionId,
          serverMessage.content.slice(0, 120),
          serverMessage.sentAt
        );
      } catch (err) {
        thread.failSend(tempId);
        const mapped = mapChatError(err, 'No pudimos reintentar.');
        showSnackbar(mapped.message, 'error');
      }
    },
    [thread, parsedSessionId, bumpOnSend, showSnackbar]
  );

  const handleIncomingWhileFocused = useCallback(() => {
    if (parsedSessionId == null) return;
    if (document.visibilityState !== 'visible') return;
    void markAsRead(parsedSessionId);
  }, [parsedSessionId, markAsRead]);

  const handleSelectSession = useCallback(
    (session: ChatSessionResponseDTO) => {
      navigate(`${basePath}/${session.id}`);
    },
    [basePath, navigate]
  );

  const handleBack = useCallback(() => {
    navigate(basePath);
  }, [basePath, navigate]);

  const handleRequestBlock = useCallback(() => {
    setBlockDialogOpen(true);
  }, []);

  const handleConfirmBlock = useCallback(
    async (reason: string | undefined) => {
      if (!selectedSession) return;
      setBlockSubmitting(true);
      try {
        const updated = await chatService.blockChatSession(
          selectedSession.id,
          { reason }
        );
        upsertSession(updated);
        setBlockDialogOpen(false);
        showSnackbar('Conversación bloqueada.', 'success');
      } catch (err) {
        const mapped = mapChatError(err, 'No pudimos bloquear la conversación.');
        showSnackbar(mapped.message, 'error');
        if (mapped.alreadyBlocked) {
          // Refresh to align UI.
          try {
            const refreshed = await chatService.getMyChatSessions();
            upsertSessions(refreshed);
          } catch {
            // best-effort
          }
          setBlockDialogOpen(false);
        }
      } finally {
        setBlockSubmitting(false);
      }
    },
    [selectedSession, upsertSession, upsertSessions, showSnackbar]
  );

  const handleUnblock = useCallback(async () => {
    if (!selectedSession) return;
    setUnblockSubmitting(true);
    try {
      const updated = await chatService.unblockChatSession(selectedSession.id);
      upsertSession(updated);
      showSnackbar('Conversación desbloqueada.', 'success');
    } catch (err) {
      const mapped = mapChatError(
        err,
        'No pudimos desbloquear la conversación.'
      );
      showSnackbar(mapped.message, 'error');
      if (mapped.notBlocked) {
        try {
          const refreshed = await chatService.getMyChatSessions();
          upsertSessions(refreshed);
        } catch {
          // best-effort
        }
      }
    } finally {
      setUnblockSubmitting(false);
    }
  }, [selectedSession, upsertSession, upsertSessions, showSnackbar]);

  const counterpartNameForDialog = useMemo(() => {
    if (!selectedSession) return '';
    return viewerRole === 'PRACTITIONER'
      ? selectedSession.patientName
      : selectedSession.practitionerName;
  }, [selectedSession, viewerRole]);

  const showList = !isMobile || !selectedSession;
  const showThread = !isMobile || !!selectedSession;

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          height: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 140px)' },
          minHeight: 480,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        {showList && (
          <Box
            sx={{
              width: { xs: '100%', md: SIDEBAR_WIDTH },
              flexShrink: 0,
              borderRight: {
                xs: 'none',
                md: `1px solid ${theme.palette.divider}`,
              },
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <ChatSessionList
              sessions={sessions}
              selectedSessionId={parsedSessionId}
              viewerRole={viewerRole}
              loading={sessionsLoading}
              error={sessionsError}
              onSelect={handleSelectSession}
            />
          </Box>
        )}

        {showThread && (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {selectedSession ? (
              <ChatThreadView
                ref={messageListRef}
                session={selectedSession}
                viewerRole={viewerRole}
                viewerUserId={viewerUserId}
                messages={thread.messages}
                initialLoading={thread.initialLoading}
                loadingMore={thread.loadingMore}
                hasMore={thread.hasMore}
                error={thread.error}
                blockSubmitting={blockSubmitting}
                unblockSubmitting={unblockSubmitting}
                showBackButton={isMobile}
                onBack={handleBack}
                onLoadMore={thread.loadMore}
                onSend={handleSend}
                onIncomingWhileFocused={handleIncomingWhileFocused}
                onRetrySend={handleRetrySend}
                onRequestBlock={handleRequestBlock}
                onUnblock={handleUnblock}
              />
            ) : (
              <NoSessionSelected />
            )}
          </Box>
        )}
      </Paper>

      <BlockChatDialog
        open={blockDialogOpen}
        counterpartName={counterpartNameForDialog}
        submitting={blockSubmitting}
        onConfirm={handleConfirmBlock}
        onClose={() => setBlockDialogOpen(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={closeSnackbar}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
