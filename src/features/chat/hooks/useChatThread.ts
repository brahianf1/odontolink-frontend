import { useCallback, useEffect, useReducer } from 'react';
import chatService from '../../../services/api/chatService';
import type {
  ChatMessageResponseDTO,
  ChatReadReceiptDTO,
  OptimisticMessage,
} from '../types/chat.types';
import { mapChatError } from '../utils/chatApiErrors';

interface ThreadState {
  messages: OptimisticMessage[];
  page: number;
  hasMore: boolean;
  initialLoading: boolean;
  loadingMore: boolean;
  error: string | null;
  cursor: string | null;
}

type ThreadAction =
  | { type: 'RESET' }
  | { type: 'INITIAL_START' }
  | {
      type: 'INITIAL_SUCCESS';
      messages: ChatMessageResponseDTO[];
      cursor: string;
      hasMore: boolean;
    }
  | { type: 'INITIAL_ERROR'; error: string }
  | { type: 'LOAD_MORE_START' }
  | {
      type: 'LOAD_MORE_SUCCESS';
      messages: ChatMessageResponseDTO[];
      nextPage: number;
      hasMore: boolean;
    }
  | { type: 'LOAD_MORE_ERROR' }
  | {
      type: 'POLL_APPLY';
      messages: ChatMessageResponseDTO[];
      receipts: ChatReadReceiptDTO[];
      cursor: string;
    }
  | { type: 'SEND_OPTIMISTIC'; tempMessage: OptimisticMessage }
  | {
      type: 'SEND_SUCCESS';
      tempId: number;
      serverMessage: ChatMessageResponseDTO;
    }
  | { type: 'SEND_FAIL'; tempId: number }
  | { type: 'RETRY_SEND'; tempId: number };

const initial: ThreadState = {
  messages: [],
  page: 0,
  hasMore: false,
  initialLoading: false,
  loadingMore: false,
  error: null,
  cursor: null,
};

function byAsc(a: OptimisticMessage, b: OptimisticMessage): number {
  const t = a.sentAt.localeCompare(b.sentAt);
  if (t !== 0) return t;
  return a.id - b.id;
}

function toSent(m: ChatMessageResponseDTO): OptimisticMessage {
  return { ...m, status: 'sent' };
}

function pickLater(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a.localeCompare(b) >= 0 ? a : b;
}

function mergeMessage(
  a: OptimisticMessage,
  b: OptimisticMessage
): OptimisticMessage {
  const readAt = pickLater(a.readAt, b.readAt);
  const status: OptimisticMessage['status'] =
    a.status === 'sent' || b.status === 'sent'
      ? 'sent'
      : a.status === 'sending' || b.status === 'sending'
      ? 'sending'
      : 'failed';
  return { ...a, ...b, readAt, status };
}

function dedupeById(items: OptimisticMessage[]): OptimisticMessage[] {
  const map = new Map<number, OptimisticMessage>();
  for (const m of items) {
    const existing = map.get(m.id);
    map.set(m.id, existing ? mergeMessage(existing, m) : m);
  }
  return Array.from(map.values());
}

function applyReceipts(
  messages: OptimisticMessage[],
  receipts: ChatReadReceiptDTO[]
): OptimisticMessage[] {
  if (receipts.length === 0) return messages;
  const byId = new Map(receipts.map((r) => [r.messageId, r.readAt]));
  let mutated = false;
  const next = messages.map((m) => {
    const readAt = byId.get(m.id);
    if (readAt && readAt !== m.readAt) {
      mutated = true;
      return { ...m, readAt };
    }
    return m;
  });
  return mutated ? next : messages;
}

function reducer(state: ThreadState, action: ThreadAction): ThreadState {
  switch (action.type) {
    case 'RESET':
      return initial;
    case 'INITIAL_START':
      return { ...initial, initialLoading: true };
    case 'INITIAL_SUCCESS': {
      const ascSorted = dedupeById(action.messages.map(toSent)).sort(byAsc);
      return {
        messages: ascSorted,
        page: 0,
        hasMore: action.hasMore,
        initialLoading: false,
        loadingMore: false,
        error: null,
        cursor: action.cursor,
      };
    }
    case 'INITIAL_ERROR':
      return { ...initial, initialLoading: false, error: action.error };
    case 'LOAD_MORE_START':
      return { ...state, loadingMore: true };
    case 'LOAD_MORE_SUCCESS': {
      const older = action.messages.map(toSent);
      const merged = dedupeById([...older, ...state.messages]).sort(byAsc);
      return {
        ...state,
        messages: merged,
        page: action.nextPage,
        hasMore: action.hasMore,
        loadingMore: false,
      };
    }
    case 'LOAD_MORE_ERROR':
      return { ...state, loadingMore: false };
    case 'POLL_APPLY': {
      const incoming = action.messages.map(toSent);
      const merged = dedupeById([...state.messages, ...incoming]).sort(byAsc);
      const withReceipts = applyReceipts(merged, action.receipts);
      return { ...state, messages: withReceipts, cursor: action.cursor };
    }
    case 'SEND_OPTIMISTIC':
      return {
        ...state,
        messages: [...state.messages, action.tempMessage].sort(byAsc),
      };
    case 'SEND_SUCCESS': {
      const withoutTemp = state.messages.filter(
        (m) => m.id !== action.tempId
      );
      const merged = dedupeById([
        ...withoutTemp,
        { ...action.serverMessage, status: 'sent' as const },
      ]).sort(byAsc);
      return { ...state, messages: merged };
    }
    case 'SEND_FAIL':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.tempId ? { ...m, status: 'failed' } : m
        ),
      };
    case 'RETRY_SEND':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.tempId ? { ...m, status: 'sending' } : m
        ),
      };
    default:
      return state;
  }
}

interface UseChatThreadOptions {
  sessionId: number | null;
  pageSize?: number;
}

export interface UseChatThreadResult extends ThreadState {
  reset: () => void;
  loadMore: () => Promise<void>;
  applyPoll: (data: {
    messages: ChatMessageResponseDTO[];
    readReceipts: ChatReadReceiptDTO[];
    serverTime: string;
  }) => void;
  startSend: (tempMessage: OptimisticMessage) => void;
  confirmSend: (tempId: number, serverMessage: ChatMessageResponseDTO) => void;
  failSend: (tempId: number) => void;
  retrySend: (tempId: number) => void;
}

export function useChatThread({
  sessionId,
  pageSize = 50,
}: UseChatThreadOptions): UseChatThreadResult {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    if (sessionId == null) {
      dispatch({ type: 'RESET' });
      return;
    }
    let cancelled = false;
    dispatch({ type: 'INITIAL_START' });
    (async () => {
      try {
        const res = await chatService.getMessagesPage(sessionId, 0, pageSize);
        if (cancelled) return;
        dispatch({
          type: 'INITIAL_SUCCESS',
          messages: res.messages,
          cursor: res.serverTime,
          hasMore: res.hasNext,
        });
      } catch (err) {
        if (cancelled) return;
        const mapped = mapChatError(err, 'No pudimos cargar los mensajes.');
        dispatch({ type: 'INITIAL_ERROR', error: mapped.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, pageSize]);

  const loadMore = useCallback(async () => {
    if (sessionId == null || !state.hasMore || state.loadingMore) return;
    dispatch({ type: 'LOAD_MORE_START' });
    try {
      const nextPage = state.page + 1;
      const res = await chatService.getMessagesPage(
        sessionId,
        nextPage,
        pageSize
      );
      dispatch({
        type: 'LOAD_MORE_SUCCESS',
        messages: res.messages,
        nextPage,
        hasMore: res.hasNext,
      });
    } catch {
      dispatch({ type: 'LOAD_MORE_ERROR' });
    }
  }, [sessionId, state.hasMore, state.loadingMore, state.page, pageSize]);

  const applyPoll = useCallback(
    (data: {
      messages: ChatMessageResponseDTO[];
      readReceipts: ChatReadReceiptDTO[];
      serverTime: string;
    }) => {
      dispatch({
        type: 'POLL_APPLY',
        messages: data.messages,
        receipts: data.readReceipts,
        cursor: data.serverTime,
      });
    },
    []
  );

  const startSend = useCallback((tempMessage: OptimisticMessage) => {
    dispatch({ type: 'SEND_OPTIMISTIC', tempMessage });
  }, []);

  const confirmSend = useCallback(
    (tempId: number, serverMessage: ChatMessageResponseDTO) => {
      dispatch({ type: 'SEND_SUCCESS', tempId, serverMessage });
    },
    []
  );

  const failSend = useCallback((tempId: number) => {
    dispatch({ type: 'SEND_FAIL', tempId });
  }, []);

  const retrySend = useCallback((tempId: number) => {
    dispatch({ type: 'RETRY_SEND', tempId });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    reset,
    loadMore,
    applyPoll,
    startSend,
    confirmSend,
    failSend,
    retrySend,
  };
}
