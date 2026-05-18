import { useCallback, useRef, useState } from 'react';
import { sendMessage as sendMessageApi } from '../../../services/api/chatbotService';
import type {
  ChatbotMessage,
  ChatbotMessageFlags,
  ChatbotMessageResponseDTO,
  ChatbotSessionStored,
} from '../../../types/chatbot.types';
import { mapChatbotError, type ChatbotMappedError } from '../utils/chatbotApiErrors';

interface UseChatbotMessagesOptions {
  session: ChatbotSessionStored | null;
  onSessionEstablished: (data: {
    sessionId: string;
    anonymousToken?: string | null;
  }) => void;
  onSessionExpired: () => void;
  onAccessRevoked: (reason: 'authentication' | 'access') => void;
  onError: (mapped: ChatbotMappedError) => void;
}

interface UseChatbotMessagesResult {
  messages: ChatbotMessage[];
  sending: boolean;
  rateLimitedUntilMs: number | null;
  sendMessage: (text: string) => Promise<void>;
  reset: () => void;
}

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const TYPING_PLACEHOLDER_ID_PREFIX = 'typing-';

const flagsFromResponse = (res: ChatbotMessageResponseDTO): ChatbotMessageFlags => ({
  confidence: res.confidence ?? null,
  basedOnKnowledgeBase: res.basedOnKnowledgeBase,
  emergencyDetected: res.emergencyDetected,
  piiBlocked: res.piiBlocked,
  detectedPiiTypes: res.detectedPiiTypes,
  fallbackTriggered: res.fallbackTriggered,
});

export function useChatbotMessages({
  session,
  onSessionEstablished,
  onSessionExpired,
  onAccessRevoked,
  onError,
}: UseChatbotMessagesOptions): UseChatbotMessagesResult {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [rateLimitedUntilMs, setRateLimitedUntilMs] = useState<number | null>(null);
  const sessionRef = useRef<ChatbotSessionStored | null>(session);
  sessionRef.current = session;

  const removeTypingPlaceholder = useCallback((typingId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== typingId));
  }, []);

  const performSend = useCallback(
    async (text: string, isRetry: boolean): Promise<void> => {
      const userMessage: ChatbotMessage = {
        id: createId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      const typingId = `${TYPING_PLACEHOLDER_ID_PREFIX}${createId()}`;
      const typingPlaceholder: ChatbotMessage = {
        id: typingId,
        role: 'system',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, typingPlaceholder]);

      try {
        const currentSession = sessionRef.current;
        const response = await sendMessageApi({
          message: text,
          sessionId: currentSession?.sessionId,
          anonymousToken: currentSession?.anonymousToken,
        });

        removeTypingPlaceholder(typingId);
        onSessionEstablished({
          sessionId: response.sessionId,
          anonymousToken: response.anonymousToken,
        });

        const botMessage: ChatbotMessage = {
          id: createId(),
          role: 'bot',
          content: response.reply,
          timestamp: new Date().toISOString(),
          flags: flagsFromResponse(response),
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        removeTypingPlaceholder(typingId);
        const mapped = mapChatbotError(err, 'No se pudo enviar el mensaje.');

        if (mapped.flags.isSessionExpired && !isRetry) {
          // Drop the optimistic user message we just appended; the retry adds a fresh one.
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          onSessionExpired();
          sessionRef.current = null;
          await performSend(text, true);
          return;
        }

        if (mapped.flags.isRateLimited) {
          const seconds = mapped.retryAfter ?? 60;
          setRateLimitedUntilMs(Date.now() + seconds * 1000);
        }

        if (mapped.flags.isAnonymousForbidden) {
          onAccessRevoked('authentication');
        } else if (mapped.flags.isDisabled || mapped.flags.isAccessDenied) {
          onAccessRevoked('access');
        }

        if (mapped.flags.isProviderDown || mapped.flags.isNotPublished) {
          const fallbackMessage: ChatbotMessage = {
            id: createId(),
            role: 'bot',
            content: mapped.message,
            timestamp: new Date().toISOString(),
            flags: {
              fallbackTriggered: true,
            },
          };
          setMessages((prev) => [...prev, fallbackMessage]);
        } else if (!mapped.flags.isAnonymousForbidden && !mapped.flags.isDisabled && !mapped.flags.isAccessDenied) {
          onError(mapped);
        }
      }
    },
    [onAccessRevoked, onError, onSessionEstablished, onSessionExpired, removeTypingPlaceholder]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || trimmed.length > 2000) return;
      if (sending) return;
      if (rateLimitedUntilMs !== null && Date.now() < rateLimitedUntilMs) return;

      setSending(true);
      try {
        await performSend(trimmed, false);
      } finally {
        setSending(false);
      }
    },
    [performSend, rateLimitedUntilMs, sending]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setRateLimitedUntilMs(null);
  }, []);

  return { messages, sending, rateLimitedUntilMs, sendMessage, reset };
}
