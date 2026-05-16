import { useEffect, useRef } from 'react';
import chatService from '../../../services/api/chatService';
import type {
  ChatMessageResponseDTO,
  ChatReadReceiptDTO,
} from '../types/chat.types';

interface UseChatPollingOptions {
  sessionId: number | null;
  cursor: string | null;
  intervalMs?: number;
  maxBackoffMs?: number;
  enabled?: boolean;
  onPollSuccess: (data: {
    messages: ChatMessageResponseDTO[];
    readReceipts: ChatReadReceiptDTO[];
    serverTime: string;
  }) => void;
}

/**
 * Polls the message thread with the latest serverTime cursor.
 * - Skips ticks while the document is hidden; resumes on visibility.
 * - Backs off exponentially on consecutive failures, capped at maxBackoffMs.
 * - Resets backoff on the next successful tick.
 */
export function useChatPolling({
  sessionId,
  cursor,
  intervalMs = 4000,
  maxBackoffMs = 30000,
  enabled = true,
  onPollSuccess,
}: UseChatPollingOptions) {
  const cursorRef = useRef(cursor);
  const onSuccessRef = useRef(onPollSuccess);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);
  useEffect(() => {
    onSuccessRef.current = onPollSuccess;
  }, [onPollSuccess]);

  useEffect(() => {
    if (!enabled || sessionId == null) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let backoff = 0;

    const schedule = (delay: number) => {
      if (stopped) return;
      timer = setTimeout(tick, delay);
    };

    const tick = async () => {
      timer = null;
      if (stopped) return;
      if (document.visibilityState !== 'visible') {
        schedule(intervalMs);
        return;
      }
      const since = cursorRef.current;
      if (!since) {
        schedule(intervalMs);
        return;
      }
      try {
        const res = await chatService.pollMessages(sessionId, since);
        if (stopped) return;
        backoff = 0;
        onSuccessRef.current({
          messages: res.messages,
          readReceipts: res.readReceipts,
          serverTime: res.serverTime,
        });
        schedule(intervalMs);
      } catch {
        if (stopped) return;
        backoff = Math.min(
          backoff > 0 ? backoff * 2 : intervalMs * 2,
          maxBackoffMs
        );
        schedule(backoff);
      }
    };

    const onVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        timer == null &&
        !stopped
      ) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    schedule(intervalMs);

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, sessionId, intervalMs, maxBackoffMs]);
}
