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
  retryMessage: (messageId: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
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
  confidenceCategory: res.confidenceCategory,
  confidenceCategoryLabel: res.confidenceCategoryLabel,
  confidenceCategoryMessage: res.confidenceCategoryMessage,
  confidenceScore: res.confidenceScore,
  emergencyDetected: res.emergencyDetected,
  piiBlocked: res.piiBlocked,
  detectedPiiTypes: res.detectedPiiTypes,
  fallbackTriggered: res.fallbackTriggered,
});

/**
 * Decide si conviene mostrar el botón inline de "Reintentar" en el mensaje
 * del user. Los errores acotados a flujo (rate limit, deny, message too long)
 * los maneja el resto de la UI (overlay, snackbar, deny state).
 */
const isRetriableError = (mapped: ChatbotMappedError): boolean => {
  if (mapped.flags.isRateLimited) return false;
  if (mapped.flags.isAnonymousForbidden) return false;
  if (mapped.flags.isDisabled) return false;
  if (mapped.flags.isAccessDenied) return false;
  if (mapped.flags.isMessageTooLong) return false;
  if (mapped.flags.isNotPublished) return false;
  return true;
};

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

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const callApi = useCallback(
    async (text: string): Promise<ChatbotMessageResponseDTO> => {
      const currentSession = sessionRef.current;
      return await sendMessageApi({
        message: text,
        sessionId: currentSession?.sessionId,
        anonymousToken: currentSession?.anonymousToken,
      });
    },
    []
  );

  const appendBotMessage = useCallback((response: ChatbotMessageResponseDTO) => {
    const botMessage: ChatbotMessage = {
      id: createId(),
      role: 'bot',
      content: response.reply,
      timestamp: new Date().toISOString(),
      flags: flagsFromResponse(response),
    };
    setMessages((prev) => [...prev, botMessage]);
  }, []);

  const handleErrorSideEffects = useCallback(
    (mapped: ChatbotMappedError) => {
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
          flags: { fallbackTriggered: true },
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    },
    [onAccessRevoked]
  );

  /**
   * Envía el texto al backend y maneja la respuesta. Si la sesión expiró,
   * intenta una sola vez con sesión nueva (transparente). En cualquier
   * fallo, marca el mensaje del user como 'failed' para que la UI pueda
   * mostrar inline retry si corresponde.
   */
  const performSend = useCallback(
    async (text: string, userMessageId: string, isRetry: boolean): Promise<void> => {
      const typingId = `${TYPING_PLACEHOLDER_ID_PREFIX}${createId()}`;
      const typingPlaceholder: ChatbotMessage = {
        id: typingId,
        role: 'system',
        content: '',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, typingPlaceholder]);

      try {
        const response = await callApi(text);
        removeMessage(typingId);
        onSessionEstablished({
          sessionId: response.sessionId,
          anonymousToken: response.anonymousToken,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMessageId
              ? { ...m, status: 'sent', error: undefined }
              : m
          )
        );
        appendBotMessage(response);
      } catch (err) {
        removeMessage(typingId);
        const mapped = mapChatbotError(err, 'No se pudo enviar el mensaje.');

        if (mapped.flags.isSessionExpired && !isRetry) {
          onSessionExpired();
          sessionRef.current = null;
          await performSend(text, userMessageId, true);
          return;
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMessageId
              ? { ...m, status: 'failed', error: mapped.message }
              : m
          )
        );

        handleErrorSideEffects(mapped);

        // Solo notificamos con snackbar errores no retriables (rate limit,
        // deny). Los retriables ya muestran inline retry en la burbuja.
        if (!isRetriableError(mapped)) {
          if (
            !mapped.flags.isAnonymousForbidden &&
            !mapped.flags.isDisabled &&
            !mapped.flags.isAccessDenied
          ) {
            onError(mapped);
          }
        }
      }
    },
    [
      appendBotMessage,
      callApi,
      handleErrorSideEffects,
      onError,
      onSessionEstablished,
      onSessionExpired,
      removeMessage,
    ]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || trimmed.length > 2000) return;
      if (sending) return;
      if (rateLimitedUntilMs !== null && Date.now() < rateLimitedUntilMs) return;

      setSending(true);
      const userMessageId = createId();
      const userMessage: ChatbotMessage = {
        id: userMessageId,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        await performSend(trimmed, userMessageId, false);
      } finally {
        setSending(false);
      }
    },
    [performSend, rateLimitedUntilMs, sending]
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      if (sending) return;
      if (rateLimitedUntilMs !== null && Date.now() < rateLimitedUntilMs) return;

      let textToRetry: string | null = null;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId && m.role === 'user') {
            textToRetry = m.content;
            return { ...m, status: 'sending', error: undefined };
          }
          return m;
        })
      );

      if (textToRetry === null) return;

      setSending(true);
      try {
        await performSend(textToRetry, messageId, false);
      } finally {
        setSending(false);
      }
    },
    [performSend, rateLimitedUntilMs, sending]
  );

  const regenerateLastResponse = useCallback(async () => {
    if (sending) return;
    if (rateLimitedUntilMs !== null && Date.now() < rateLimitedUntilMs) return;

    // Buscar último user message y último bot message (el bot debe ser
    // posterior al user para tener sentido el regenerar).
    let lastUserText: string | null = null;
    let lastUserId: string | null = null;
    let lastBotId: string | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (lastBotId === null && m.role === 'bot') {
        lastBotId = m.id;
        continue;
      }
      if (lastBotId !== null && m.role === 'user') {
        lastUserText = m.content;
        lastUserId = m.id;
        break;
      }
    }
    if (lastBotId === null || lastUserText === null || lastUserId === null) return;

    // Removemos la respuesta vieja del bot y delegamos en performSend para
    // que aparezca typing + nueva respuesta.
    setMessages((prev) => prev.filter((m) => m.id !== lastBotId));
    setSending(true);
    try {
      await performSend(lastUserText, lastUserId, false);
    } finally {
      setSending(false);
    }
  }, [messages, performSend, rateLimitedUntilMs, sending]);

  const reset = useCallback(() => {
    setMessages([]);
    setRateLimitedUntilMs(null);
  }, []);

  return {
    messages,
    sending,
    rateLimitedUntilMs,
    sendMessage,
    retryMessage,
    regenerateLastResponse,
    reset,
  };
}
