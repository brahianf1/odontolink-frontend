export type AiAgentLifecycle = 'UNCONFIGURED' | 'DRAFT' | 'PUBLISHED';

export type RetrievalMethod = 'REWRITE' | 'STEP_BACK' | 'SUB_QUERIES' | 'NONE';

export type KnowledgeBaseDocumentKind = 'FAQ_TEXT' | 'UPLOADED_FILE';

export type KnowledgeBaseDocumentStatus =
  | 'PENDING_UPLOAD'
  | 'UPLOADED'
  | 'REGISTERED'
  | 'INDEXING'
  | 'INDEXED'
  | 'FAILED';

export type AiAdminAuditEventType =
  | 'AGENT_PUBLISH'
  | 'AGENT_PUBLISH_FAILED'
  | 'AGENT_ROLLBACK'
  | 'GOVERNANCE_POLICY_UPDATED';

export type AccessMode = 'PUBLIC' | 'PRIVATE' | 'DISABLED';

export type PiiPolicy = 'BLOCK' | 'ANONYMIZE';

export type AllowedRole =
  | 'ROLE_PATIENT'
  | 'ROLE_PRACTITIONER'
  | 'ROLE_SUPERVISOR'
  | 'ROLE_ADMIN';

export type AiAgentErrorCode =
  | 'AI_PROVIDER_UNAVAILABLE'
  | 'AI_PROVIDER_BAD_REQUEST'
  | 'AI_AGENT_CONFIG_INVALID'
  | 'AI_AGENT_NOT_CONFIGURED'
  | 'AI_AGENT_NOT_PUBLISHED'
  | 'AI_KB_DOCUMENT_NOT_FOUND'
  | 'AI_KB_FILE_EMPTY'
  | 'AI_KB_FILE_TOO_LARGE'
  | 'AI_KB_UNSUPPORTED_TYPE'
  | 'AI_KB_INDEXING_FAILED'
  | 'AI_AGENT_INVOCATION_URL_UNAVAILABLE';

export interface AiAgentConfigurationResponseDTO {
  displayName: string;
  systemPromptCore: string;
  welcomeMessage?: string | null;
  temperature: number;
  topP: number;
  maxTokens?: number | null;
  k?: number | null;
  retrievalMethod: RetrievalMethod;
  lifecycle: AiAgentLifecycle;
  finalInstructionPreview?: string | null;
  providerAgentId?: string | null;
  providerSyncedAt?: string | null;
  lastSyncError?: string | null;
  updatedAt?: string | null;
  accessMode: AccessMode;
  allowedRoles?: AllowedRole[] | null;
  piiPolicy: PiiPolicy;
  conversationBufferSize: number;
  rateLimitAnonymousPerHour: number;
  rateLimitAuthenticatedPerHour: number;
  agentInvocationUrl?: string | null;
  emergencyBannerText: string;
  provideCitations?: boolean | null;
}

export interface UpdateAiAgentConfigurationRequestDTO {
  displayName: string;
  systemPromptCore: string;
  welcomeMessage?: string | null;
  temperature: number;
  topP: number;
  maxTokens?: number | null;
  k?: number | null;
  retrievalMethod: RetrievalMethod;
  accessMode: AccessMode;
  allowedRoles?: AllowedRole[];
  piiPolicy: PiiPolicy;
  conversationBufferSize: number;
  rateLimitAnonymousPerHour: number;
  rateLimitAuthenticatedPerHour: number;
  emergencyBannerText: string;
  provideCitations: boolean;
}

export interface AiAgentHealthResponseDTO {
  lifecycle: AiAgentLifecycle;
  missingRequirements?: string[];
  providerReachable: boolean;
  providerErrorDetail?: string | null;
}

export interface AiAgentInstructionPreviewResponseDTO {
  composedInstruction: string;
  activeGuardrailLabels: string[];
}

export interface PolicyRuleRequestDTO {
  label: string;
  text: string;
  active?: boolean;
}

export interface PolicyRuleResponseDTO {
  id: number;
  label: string;
  text: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAiGovernancePolicyRequestDTO {
  requireGuardrails: boolean;
  minActiveGuardrails: number;
  requireSystemPrompt: boolean;
  requireWelcomeMessage: boolean;
  requireIndexedDocuments: boolean;
  allowOverride: boolean;
}

export interface AiGovernancePolicyResponseDTO {
  requireGuardrails: boolean;
  minActiveGuardrails: number;
  requireSystemPrompt: boolean;
  requireWelcomeMessage: boolean;
  requireIndexedDocuments: boolean;
  allowOverride: boolean;
  updatedAt?: string | null;
}

export interface AddFaqDocumentRequestDTO {
  title: string;
  content: string;
}

export interface UpdateKnowledgeBaseDocumentRequestDTO {
  title: string;
  content?: string;
}

export interface KnowledgeBaseDocumentResponseDTO {
  id: number;
  title: string;
  kind: KnowledgeBaseDocumentKind;
  inlineContent?: string | null;
  originalFileName?: string | null;
  sizeBytes?: number | null;
  contentType?: string | null;
  providerDataSourceId?: string | null;
  status: KnowledgeBaseDocumentStatus;
  lastIndexingJobId?: string | null;
  lastIndexedAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IndexingJobStatusResponseDTO {
  jobId: string;
  status: string;
  updatedAt?: string | null;
  errorMessage?: string | null;
}

export interface AiAgentConfigurationVersionResponseDTO {
  versionNumber: number;
  displayName: string;
  systemPromptCore: string;
  welcomeMessage?: string | null;
  temperature: number;
  topP: number;
  maxTokens?: number | null;
  k?: number | null;
  retrievalMethod: RetrievalMethod;
  composedInstruction?: string | null;
  guardrailsLabelsSnapshot?: string | null;
  publishedByUserId?: number | null;
  publishedWithOverride?: boolean | null;
  missingRequirementsAtPublish?: string | null;
  publishedAt: string;
}

export interface AiAdminAuditEventResponseDTO {
  id: number;
  type: AiAdminAuditEventType;
  actorUserId?: number | null;
  relatedVersionNumber?: number | null;
  withOverride?: boolean | null;
  details?: string | null;
  occurredAt: string;
}

export interface KbDocumentsQuery {
  status?: KnowledgeBaseDocumentStatus;
  page?: number;
  size?: number;
}

export interface VersionsQuery {
  page?: number;
  size?: number;
}

export interface AuditEventsQuery {
  type?: AiAdminAuditEventType;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export type ParsedRequirement =
  | { kind: 'SYSTEM_PROMPT' }
  | { kind: 'WELCOME_MESSAGE' }
  | { kind: 'INDEXED_DOCUMENTS' }
  | { kind: 'MIN_ACTIVE_GUARDRAILS'; required: number; current: number }
  | { kind: 'ALLOWED_ROLES_FOR_PRIVATE' }
  | { kind: 'UNKNOWN'; raw: string };

export interface EmergencyKeywordResponseDTO {
  id: number;
  term: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmergencyKeywordRequestDTO {
  term: string;
  active?: boolean;
}

export interface UpdateEmergencyKeywordRequestDTO {
  term: string;
  active?: boolean;
}

export type ProviderGuardrailType =
  | 'JAILBREAK'
  | 'SENSITIVE_DATA'
  | 'CONTENT_MODERATION'
  | 'OTHER';

export interface ProviderGuardrailResponseDTO {
  id: number;
  providerGuardrailUuid: string;
  type: ProviderGuardrailType;
  displayName: string | null;
  description: string | null;
  attached: boolean;
  priority: number;
  defaultResponse: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProviderGuardrailAttachmentRequestDTO {
  attached: boolean;
  priority: number;
}
