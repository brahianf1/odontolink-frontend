import { useCallback, useEffect, useState } from 'react';
import chatService from '../../../services/api/chatService';
import type { ChatSessionResponseDTO } from '../types/chat.types';
import { mapChatError } from '../utils/chatApiErrors';

interface UseChatSessionsResult {
  sessions: ChatSessionResponseDTO[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  upsertSessions: (incoming: ChatSessionResponseDTO[]) => void;
  upsertSession: (session: ChatSessionResponseDTO) => void;
  clearUnread: (sessionId: number) => void;
  bumpOnSend: (
    sessionId: number,
    preview: string,
    at: string
  ) => void;
}

function sortByActivity(
  items: ChatSessionResponseDTO[]
): ChatSessionResponseDTO[] {
  return [...items].sort((a, b) => {
    const aTime = a.lastMessageAt ?? a.createdAt;
    const bTime = b.lastMessageAt ?? b.createdAt;
    return bTime.localeCompare(aTime);
  });
}

export function useChatSessions(): UseChatSessionsResult {
  const [sessions, setSessions] = useState<ChatSessionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await chatService.getMyChatSessions();
      setSessions(sortByActivity(data));
    } catch (err) {
      const mapped = mapChatError(
        err,
        'No pudimos cargar tus conversaciones.'
      );
      setError(mapped.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertSessions = useCallback(
    (incoming: ChatSessionResponseDTO[]) => {
      if (incoming.length === 0) return;
      setSessions((prev) => {
        const map = new Map(prev.map((s) => [s.id, s]));
        for (const s of incoming) {
          map.set(s.id, s);
        }
        return sortByActivity(Array.from(map.values()));
      });
    },
    []
  );

  const upsertSession = useCallback((session: ChatSessionResponseDTO) => {
    setSessions((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      map.set(session.id, session);
      return sortByActivity(Array.from(map.values()));
    });
  }, []);

  const clearUnread = useCallback((sessionId: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId && s.unreadCount > 0
          ? { ...s, unreadCount: 0 }
          : s
      )
    );
  }, []);

  const bumpOnSend = useCallback(
    (sessionId: number, preview: string, at: string) => {
      setSessions((prev) =>
        sortByActivity(
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, lastMessageAt: at, lastMessagePreview: preview }
              : s
          )
        )
      );
    },
    []
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    sessions,
    loading,
    error,
    reload,
    upsertSessions,
    upsertSession,
    clearUnread,
    bumpOnSend,
  };
}
