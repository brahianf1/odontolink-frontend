import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import type { OptimisticMessage } from '../types/chat.types';
import MessageBubble from './MessageBubble';
import DayDivider from './DayDivider';
import { isSameDay } from '../utils/chatTimeFormat';
import NewMessagePill from './NewMessagePill';

const NEAR_BOTTOM_PX = 120;
const NEAR_TOP_PX = 80;

interface MessageListProps {
  messages: OptimisticMessage[];
  viewerUserId: number | undefined;
  hasMore: boolean;
  loadingMore: boolean;
  initialLoading: boolean;
  error: string | null;
  onLoadMore: () => void;
  onIncomingWhileFocused?: () => void;
  onRetrySend?: (tempId: number) => void;
}

export interface MessageListHandle {
  scrollToBottom: (smooth?: boolean) => void;
  isNearBottom: () => boolean;
}

interface RenderItem {
  type: 'message' | 'divider';
  key: string;
  message?: OptimisticMessage;
  date?: string;
  showSenderName?: boolean;
}

function buildItems(messages: OptimisticMessage[]): RenderItem[] {
  const items: RenderItem[] = [];
  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;
    if (!prev || !isSameDay(prev.sentAt, current.sentAt)) {
      items.push({
        type: 'divider',
        key: `divider-${current.sentAt}-${current.id}`,
        date: current.sentAt,
      });
    }
    const showName =
      !prev ||
      prev.senderId !== current.senderId ||
      !isSameDay(prev.sentAt, current.sentAt);
    items.push({
      type: 'message',
      key: `m-${current.id}`,
      message: current,
      showSenderName: showName,
    });
  }
  return items;
}

const MessageList = forwardRef<MessageListHandle, MessageListProps>(
  function MessageList(
    {
      messages,
      viewerUserId,
      hasMore,
      loadingMore,
      initialLoading,
      error,
      onLoadMore,
      onIncomingWhileFocused,
      onRetrySend,
    },
    ref
  ) {
    const theme = useTheme();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const prevHeightRef = useRef<number | null>(null);
    const prevFirstIdRef = useRef<number | null>(null);
    const prevLastIdRef = useRef<number | null>(null);
    const prevMessageCountRef = useRef<number>(0);
    const isNearBottomRef = useRef<boolean>(true);
    const [pendingIncoming, setPendingIncoming] = useState<number>(0);

    const items = useMemo(() => buildItems(messages), [messages]);

    const isNearBottom = useCallback((): boolean => {
      const el = containerRef.current;
      if (!el) return true;
      return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
    }, []);

    const scrollToBottom = useCallback((smooth = false) => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      isNearBottomRef.current = true;
      setPendingIncoming(0);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom,
        isNearBottom,
      }),
      [scrollToBottom, isNearBottom]
    );

    // Track scroll state and trigger loadMore at top.
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const onScroll = () => {
        const near =
          el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
        isNearBottomRef.current = near;
        if (near && pendingIncoming > 0) {
          setPendingIncoming(0);
        }
        if (el.scrollTop <= NEAR_TOP_PX && hasMore && !loadingMore) {
          prevHeightRef.current = el.scrollHeight;
          onLoadMore();
        }
      };
      el.addEventListener('scroll', onScroll, { passive: true });
      return () => el.removeEventListener('scroll', onScroll);
    }, [hasMore, loadingMore, onLoadMore, pendingIncoming]);

    // Initial scroll to bottom after first batch lands.
    useLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const firstId = messages[0]?.id ?? null;
      const lastId = messages[messages.length - 1]?.id ?? null;
      const prevCount = prevMessageCountRef.current;

      if (prevCount === 0 && messages.length > 0) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
        isNearBottomRef.current = true;
        prevHeightRef.current = null;
      } else if (
        prevHeightRef.current != null &&
        prevFirstIdRef.current !== firstId
      ) {
        // Prepend happened (older page loaded). Preserve visible offset.
        const delta = el.scrollHeight - prevHeightRef.current;
        el.scrollTop = el.scrollTop + delta;
        prevHeightRef.current = null;
      } else if (
        prevLastIdRef.current !== lastId &&
        messages.length > prevCount
      ) {
        // Append happened (new message at the bottom).
        const newest = messages[messages.length - 1];
        const mineNewest =
          newest && viewerUserId !== undefined && newest.senderId === viewerUserId;
        if (mineNewest || isNearBottomRef.current) {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
          isNearBottomRef.current = true;
        } else {
          const incomingAdded = messages.length - prevCount;
          setPendingIncoming((prev) => prev + incomingAdded);
        }
        if (
          !mineNewest &&
          isNearBottomRef.current &&
          document.visibilityState === 'visible'
        ) {
          onIncomingWhileFocused?.();
        }
      }

      prevFirstIdRef.current = firstId;
      prevLastIdRef.current = lastId;
      prevMessageCountRef.current = messages.length;
    }, [messages, viewerUserId, onIncomingWhileFocused]);

    return (
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: { xs: 1, sm: 2 },
            py: 1.5,
          }}
        >
          {initialLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <CircularProgress size={28} />
            </Box>
          )}

          {!initialLoading && error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {!initialLoading && !error && hasMore && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 1,
              }}
            >
              {loadingMore ? (
                <CircularProgress size={20} />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Sube para cargar mensajes anteriores
                </Typography>
              )}
            </Box>
          )}

          {!initialLoading &&
            !error &&
            messages.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Aún no hay mensajes. Inicia la conversación.
                </Typography>
              </Box>
            )}

          {!initialLoading &&
            !error &&
            items.map((item) => {
              if (item.type === 'divider') {
                return <DayDivider key={item.key} isoDate={item.date!} />;
              }
              const m = item.message!;
              const isMine =
                viewerUserId !== undefined && m.senderId === viewerUserId;
              return (
                <MessageBubble
                  key={item.key}
                  message={m}
                  isMine={isMine}
                  showSenderName={!isMine && (item.showSenderName ?? false)}
                  onRetry={onRetrySend}
                />
              );
            })}
        </Box>

        <NewMessagePill
          visible={pendingIncoming > 0}
          count={pendingIncoming}
          onClick={() => scrollToBottom(true)}
        />
      </Box>
    );
  }
);

export default MessageList;
