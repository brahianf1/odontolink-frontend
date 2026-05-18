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
  confidence?: number | null;
  basedOnKnowledgeBase: boolean;
  emergencyDetected: boolean;
  piiBlocked: boolean;
  detectedPiiTypes: DetectedPiiType[];
  fallbackTriggered: boolean;
  latencyMs?: number;
  retrievedDocumentIds?: string[];
}

export type ChatbotMessageRole = 'user' | 'bot' | 'system';

export type ChatbotMessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatbotMessageFlags {
  confidence?: number | null;
  basedOnKnowledgeBase?: boolean;
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
}

export type ChatbotSessionMode = 'anonymous' | 'authenticated';

export interface ChatbotSessionStored {
  sessionId: string;
  anonymousToken?: string;
  startedAt: string;
  mode: ChatbotSessionMode;
  userId?: number;
}
