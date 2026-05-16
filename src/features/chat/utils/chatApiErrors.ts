export type ChatErrorCode =
  | 'CHAT_BLOCKED'
  | 'CHAT_NOT_PARTICIPANT'
  | 'CHAT_NOT_PRACTITIONER_OF_SESSION'
  | 'CHAT_PARTICIPANT_MISMATCH'
  | 'CHAT_ALREADY_BLOCKED'
  | 'CHAT_NOT_BLOCKED'
  | 'CHAT_NO_PRIOR_RELATIONSHIP';

interface ChatApiErrorPayload {
  errorCode?: string;
  message?: string;
}

interface ApiErrorShape {
  status?: number;
  message?: string;
  data?: ChatApiErrorPayload | unknown;
}

const isApiError = (err: unknown): err is ApiErrorShape =>
  typeof err === 'object' &&
  err !== null &&
  ('status' in err || 'message' in err);

const extractErrorCode = (err: ApiErrorShape): string | undefined => {
  const data = err.data as ChatApiErrorPayload | undefined;
  return data?.errorCode;
};

const extractBackendMessage = (err: ApiErrorShape): string | undefined => {
  const data = err.data as ChatApiErrorPayload | undefined;
  return data?.message || err.message;
};

const FRIENDLY: Record<ChatErrorCode, string> = {
  CHAT_BLOCKED:
    'Esta conversación está bloqueada. No se pueden enviar mensajes nuevos.',
  CHAT_NOT_PARTICIPANT:
    'No tienes acceso a esta conversación.',
  CHAT_NOT_PRACTITIONER_OF_SESSION:
    'No eres el practicante de esta sesión.',
  CHAT_PARTICIPANT_MISMATCH:
    'Los datos de la conversación no coinciden con tu cuenta.',
  CHAT_ALREADY_BLOCKED: 'La conversación ya estaba bloqueada.',
  CHAT_NOT_BLOCKED: 'La conversación no está bloqueada.',
  CHAT_NO_PRIOR_RELATIONSHIP:
    'No tienes una relación clínica previa con este usuario.',
};

export interface ChatMappedError {
  message: string;
  code?: ChatErrorCode;
  status?: number;
  isBlocked: boolean;
  notParticipant: boolean;
  noPriorRelationship: boolean;
  alreadyBlocked: boolean;
  notBlocked: boolean;
}

export const mapChatError = (
  err: unknown,
  fallback: string
): ChatMappedError => {
  if (!isApiError(err)) {
    return {
      message: fallback,
      isBlocked: false,
      notParticipant: false,
      noPriorRelationship: false,
      alreadyBlocked: false,
      notBlocked: false,
    };
  }

  const rawCode = extractErrorCode(err);
  const code = (rawCode as ChatErrorCode | undefined) ?? undefined;
  const friendly = code ? FRIENDLY[code] : undefined;
  const message = friendly || extractBackendMessage(err) || fallback;

  return {
    message,
    code,
    status: err.status,
    isBlocked: code === 'CHAT_BLOCKED',
    notParticipant: code === 'CHAT_NOT_PARTICIPANT',
    noPriorRelationship: code === 'CHAT_NO_PRIOR_RELATIONSHIP',
    alreadyBlocked: code === 'CHAT_ALREADY_BLOCKED',
    notBlocked: code === 'CHAT_NOT_BLOCKED',
  };
};
