import { useEffect, useRef } from 'react';
import chatService from '../../../services/api/chatService';
import type { ChatSessionResponseDTO } from '../types/chat.types';

interface UseInboxPollingOptions {
  cursor: string | null;
  intervalMs?: number;
  maxBackoffMs?: number;
  enabled?: boolean;
  onUpdates: (sessions: ChatSessionResponseDTO[], advanceTo: string) => void;
}

/**
 * Polls the inbox with `?since=cursor`.
 * Advances cursor to the latest `lastMessageAt` seen (or keeps current if empty).
 * Caller is expected to dedupe by session.id.
 */
export function useInboxPolling({
  cursor,
  intervalMs = 5000,
  maxBackoffMs = 30000,
  enabled = true,
  onUpdates,
}: UseInboxPollingOptions) {
  const cursorRef = useRef(cursor);
  const onUpdatesRef = useRef(onUpdates);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);
  useEffect(() => {
    onUpdatesRef.current = onUpdates;
  }, [onUpdates]);

  useEffect(() => {
    if (!enabled) return;
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
        const updated = await chatService.getMyChatSessions(since);
        if (stopped) return;
        backoff = 0;
        let next = since;
        for (const s of updated) {
          if (s.lastMessageAt && s.lastMessageAt > next) {
            next = s.lastMessageAt;
          }
        }
        onUpdatesRef.current(updated, next);
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
  }, [enabled, intervalMs, maxBackoffMs]);
}
