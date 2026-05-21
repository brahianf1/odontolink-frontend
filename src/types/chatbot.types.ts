export type ChatbotAccessMode = 'PUBLIC' | 'PRIVATE' | 'DISABLED';

export type ChatbotDenyReason =
  | 'AGENT_NOT_PUBLISHED'
  | 'AGENT_DISABLED'
  | 'AUTHENTICATION_REQUIRED'
  | 'ROLE_NOT_ALLOWED';

export type DetectedPiiType =
  | 'DNI'
  | 'CUIT'
  | 'CBU'
  | 'CREDIT_CARD'
  | 'EMAIL'
  | 'PHONE_AR';

export type ConfidenceCategory =
  | 'OFFICIAL'
  | 'PARTIAL'
  | 'GENERAL'
  | 'OUT_OF_SCOPE';

export type ChatbotErrorCode =
  | 'AI_AGENT_DISABLED'
  | 'AI_AGENT_ACCESS_DENIED'
  | 'AI_AGENT_ANONYMOUS_FORBIDDEN'
  | 'AI_RATE_LIMIT_EXCEEDED'
  | 'AI_MESSAGE_TOO_LONG'
  | 'AI_AGENT_NOT_PUBLISHED'
  | 'AI_PROVIDER_UNAVAILABLE'
  | 'AI_AGENT_INVOCATION_URL_UNAVAILABLE';

export interface ChatbotPublicInfoResponseDTO {
  accessGranted: boolean;
  accessMode?: ChatbotAccessMode;
  displayName?: string;
  welcomeMessage?: string;
  denyReason?: ChatbotDenyReason;
}

export interface ChatbotMessageRequestDTO {
  message: string;
  sessionId?: string;
  anonymousToken?: string;
}

export interface ChatbotMessageResponseDTO {
  sessionId: string;
  anonymousToken?: string | null;
  reply: string;
  confidenceCategory: ConfidenceCategory | null;
  confidenceCategoryLabel: string | null;
  confidenceCategoryMessage: string | null;
  /** Score interno (0-100). NO mostrar al paciente; reservado para admin/QA. */
  confidenceScore: number | null;
  emergencyDetected: boolean;
  piiBlocked: boolean;
  detectedPiiTypes: DetectedPiiType[];
  fallbackTriggered: boolean;
  latencyMs?: number;
}

export type ChatbotMessageRole = 'user' | 'bot' | 'system';

export type ChatbotMessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatbotMessageFlags {
  confidenceCategory?: ConfidenceCategory | null;
  confidenceCategoryLabel?: string | null;
  confidenceCategoryMessage?: string | null;
  confidenceScore?: number | null;
  emergencyDetected?: boolean;
  piiBlocked?: boolean;
  detectedPiiTypes?: DetectedPiiType[];
  fallbackTriggered?: boolean;
}

export interface ChatbotMessage {
  id: string;
  role: ChatbotMessageRole;
  content: string;
  timestamp: string;
  flags?: ChatbotMessageFlags;
  status?: ChatbotMessageStatus;
  /** Mensaje de error a mostrar inline cuando status === 'failed'. */
  error?: string;
}

export type ChatbotSessionMode = 'anonymous' | 'authenticated';

export interface ChatbotSessionStored {
  sessionId: string;
  anonymousToken?: string;
  startedAt: string;
  mode: ChatbotSessionMode;
  userId?: number;
}
