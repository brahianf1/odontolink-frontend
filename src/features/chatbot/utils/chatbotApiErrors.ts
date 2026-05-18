import type { ApiError } from '../../../services/api/apiClient';
import type { ChatbotErrorCode } from '../../../types/chatbot.types';

export interface ChatbotMappedError {
  message: string;
  code?: ChatbotErrorCode;
  status?: number;
  retryAfter?: number;
  flags: {
    isAnonymousForbidden: boolean;
    isDisabled: boolean;
    isAccessDenied: boolean;
    isRateLimited: boolean;
    isMessageTooLong: boolean;
    isSessionExpired: boolean;
    isProviderDown: boolean;
    isNotPublished: boolean;
  };
}

const isApiErrorShape = (err: unknown): err is ApiError =>
  typeof err === 'object' &&
  err !== null &&
  ('status' in err || 'message' in err || 'data' in err);

const extractErrorCode = (err: ApiError): string | undefined => {
  const data = err.data as { errorCode?: string } | undefined;
  if (data?.errorCode) return data.errorCode;
  return err.error;
};

const FRIENDLY: Record<ChatbotErrorCode, string> = {
  AI_AGENT_DISABLED:
    'El asistente fue desactivado por la administración. Volvé a intentarlo más tarde.',
  AI_AGENT_ACCESS_DENIED:
    'No tenés permiso para usar el asistente con tu rol actual.',
  AI_AGENT_ANONYMOUS_FORBIDDEN:
    'Necesitás iniciar sesión para usar el asistente.',
  AI_RATE_LIMIT_EXCEEDED:
    'Alcanzaste el límite de mensajes por hora. Esperá unos minutos antes de seguir.',
  AI_MESSAGE_TOO_LONG:
    'El mensaje es demasiado largo. Reducilo y volvé a intentarlo.',
  AI_AGENT_NOT_PUBLISHED:
    'El asistente está en mantenimiento. Intentalo nuevamente en unos minutos.',
  AI_PROVIDER_UNAVAILABLE:
    'El asistente no está disponible en este momento. Reintentá en unos minutos.',
  AI_AGENT_INVOCATION_URL_UNAVAILABLE:
    'El asistente no está disponible en este momento. Reintentá en unos minutos.',
};

const emptyFlags = (): ChatbotMappedError['flags'] => ({
  isAnonymousForbidden: false,
  isDisabled: false,
  isAccessDenied: false,
  isRateLimited: false,
  isMessageTooLong: false,
  isSessionExpired: false,
  isProviderDown: false,
  isNotPublished: false,
});

const isTimeoutLike = (err: ApiError): boolean => {
  if (err.status !== undefined) return false;
  const msg = typeof err.message === 'string' ? err.message.toLowerCase() : '';
  return msg.includes('timeout') || msg.includes('network');
};

export const mapChatbotError = (err: unknown, fallback: string): ChatbotMappedError => {
  if (!isApiErrorShape(err)) {
    return { message: fallback, flags: emptyFlags() };
  }

  if (isTimeoutLike(err)) {
    const flags = emptyFlags();
    flags.isProviderDown = true;
    return {
      message:
        'El asistente está tardando más de lo esperado. Puede ser un arranque en frío del proveedor; reintentá en unos segundos.',
      status: err.status,
      flags,
    };
  }

  const code = extractErrorCode(err) as ChatbotErrorCode | undefined;
  const friendly = code ? FRIENDLY[code] : undefined;
  const backendMessage =
    typeof err.message === 'string' && err.message.length > 0 ? err.message : undefined;
  const message = friendly || backendMessage || fallback;
  const status = err.status;
  const flags = emptyFlags();

  if (code === 'AI_AGENT_ANONYMOUS_FORBIDDEN' || status === 401) {
    flags.isAnonymousForbidden = true;
  }
  if (code === 'AI_AGENT_DISABLED') flags.isDisabled = true;
  if (code === 'AI_AGENT_ACCESS_DENIED') flags.isAccessDenied = true;
  if (code === 'AI_RATE_LIMIT_EXCEEDED' || status === 429) flags.isRateLimited = true;
  if (code === 'AI_MESSAGE_TOO_LONG') flags.isMessageTooLong = true;
  if (status === 404) flags.isSessionExpired = true;
  if (code === 'AI_PROVIDER_UNAVAILABLE' || code === 'AI_AGENT_INVOCATION_URL_UNAVAILABLE') {
    flags.isProviderDown = true;
  }
  if (code === 'AI_AGENT_NOT_PUBLISHED') flags.isNotPublished = true;

  return {
    message,
    code,
    status,
    retryAfter: err.retryAfter,
    flags,
  };
};
