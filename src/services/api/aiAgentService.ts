import apiClient from './apiClient';
import type { PageResponse } from '../../types/common.types';
import type {
  AddFaqDocumentRequestDTO,
  AiAdminAuditEventResponseDTO,
  AiAgentConfigurationResponseDTO,
  AiAgentConfigurationVersionResponseDTO,
  AiAgentHealthResponseDTO,
  AiAgentInstructionPreviewResponseDTO,
  AiGovernancePolicyResponseDTO,
  AuditEventsQuery,
  CreateEmergencyKeywordRequestDTO,
  EmergencyKeywordResponseDTO,
  PolicyRuleRequestDTO,
  PolicyRuleResponseDTO,
  ProviderGuardrailResponseDTO,
  UpdateProviderGuardrailAttachmentRequestDTO,
  IndexingJobStatusResponseDTO,
  KbDocumentsQuery,
  KnowledgeBaseDocumentResponseDTO,
  UpdateAiAgentConfigurationRequestDTO,
  UpdateAiGovernancePolicyRequestDTO,
  UpdateEmergencyKeywordRequestDTO,
  UpdateKnowledgeBaseDocumentRequestDTO,
  VersionsQuery,
} from '../../types/aiAgent.types';

const BASE = '/api/admin/ai-agent';

// /configuration/health puede tardar más que el timeout default del apiClient
// por cold starts del proveedor de IA. Damos un margen amplio y reintentamos
// una vez ante errores transitorios (network / 5xx / timeout) para no romper
// el flujo del PublishButton ante hipos puntuales.
const HEALTH_TIMEOUT_MS = 30_000;
const HEALTH_RETRY_DELAY_MS = 800;

export const getConfiguration = async (): Promise<AiAgentConfigurationResponseDTO | null> => {
  const res = await apiClient.get<AiAgentConfigurationResponseDTO>(`${BASE}/configuration`, {
    validateStatus: (status) => status === 200 || status === 204,
  });
  return res.status === 204 ? null : res.data;
};

export const saveConfiguration = async (
  payload: UpdateAiAgentConfigurationRequestDTO
): Promise<AiAgentConfigurationResponseDTO> => {
  const res = await apiClient.put<AiAgentConfigurationResponseDTO>(`${BASE}/configuration`, payload);
  return res.data;
};

export const getInstructionPreview = async (): Promise<AiAgentInstructionPreviewResponseDTO> => {
  const res = await apiClient.get<AiAgentInstructionPreviewResponseDTO>(
    `${BASE}/configuration/preview`
  );
  return res.data;
};

export const getHealth = async (): Promise<AiAgentHealthResponseDTO> => {
  const fetchHealth = async (): Promise<AiAgentHealthResponseDTO> => {
    const res = await apiClient.get<AiAgentHealthResponseDTO>(`${BASE}/configuration/health`, {
      timeout: HEALTH_TIMEOUT_MS,
    });
    return res.data;
  };
  try {
    return await fetchHealth();
  } catch (err) {
    const status = (err as { status?: number } | null)?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, HEALTH_RETRY_DELAY_MS));
    return fetchHealth();
  }
};

export const revertToDraft = async (): Promise<AiAgentConfigurationResponseDTO> => {
  const res = await apiClient.post<AiAgentConfigurationResponseDTO>(
    `${BASE}/configuration/revert-to-draft`
  );
  return res.data;
};

export const publish = async (override = false): Promise<AiAgentConfigurationResponseDTO> => {
  const res = await apiClient.post<AiAgentConfigurationResponseDTO>(
    `${BASE}/configuration/publish`,
    null,
    { params: { override } }
  );
  return res.data;
};

export const clearInvocationUrlCache = async (): Promise<AiAgentConfigurationResponseDTO> => {
  const res = await apiClient.post<AiAgentConfigurationResponseDTO>(
    `${BASE}/configuration/clear-invocation-url-cache`
  );
  return res.data;
};

export const listEmergencyKeywords = async (): Promise<EmergencyKeywordResponseDTO[]> => {
  const res = await apiClient.get<EmergencyKeywordResponseDTO[]>(`${BASE}/emergency-keywords`);
  return res.data;
};

export const createEmergencyKeyword = async (
  payload: CreateEmergencyKeywordRequestDTO
): Promise<EmergencyKeywordResponseDTO> => {
  const res = await apiClient.post<EmergencyKeywordResponseDTO>(
    `${BASE}/emergency-keywords`,
    payload
  );
  return res.data;
};

export const updateEmergencyKeyword = async (
  id: number,
  payload: UpdateEmergencyKeywordRequestDTO
): Promise<EmergencyKeywordResponseDTO> => {
  const res = await apiClient.put<EmergencyKeywordResponseDTO>(
    `${BASE}/emergency-keywords/${id}`,
    payload
  );
  return res.data;
};

export const deleteEmergencyKeyword = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/emergency-keywords/${id}`);
};

export const listPolicyRules = async (): Promise<PolicyRuleResponseDTO[]> => {
  const res = await apiClient.get<PolicyRuleResponseDTO[]>(`${BASE}/policy-rules`);
  return res.data;
};

export const getPolicyRule = async (id: number): Promise<PolicyRuleResponseDTO> => {
  const res = await apiClient.get<PolicyRuleResponseDTO>(`${BASE}/policy-rules/${id}`);
  return res.data;
};

export const createPolicyRule = async (
  payload: PolicyRuleRequestDTO
): Promise<PolicyRuleResponseDTO> => {
  const res = await apiClient.post<PolicyRuleResponseDTO>(`${BASE}/policy-rules`, payload);
  return res.data;
};

export const updatePolicyRule = async (
  id: number,
  payload: PolicyRuleRequestDTO
): Promise<PolicyRuleResponseDTO> => {
  const res = await apiClient.put<PolicyRuleResponseDTO>(`${BASE}/policy-rules/${id}`, payload);
  return res.data;
};

export const deletePolicyRule = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/policy-rules/${id}`);
};

export const activatePolicyRule = async (id: number): Promise<PolicyRuleResponseDTO> => {
  const res = await apiClient.post<PolicyRuleResponseDTO>(`${BASE}/policy-rules/${id}/activate`);
  return res.data;
};

export const deactivatePolicyRule = async (id: number): Promise<PolicyRuleResponseDTO> => {
  const res = await apiClient.post<PolicyRuleResponseDTO>(`${BASE}/policy-rules/${id}/deactivate`);
  return res.data;
};

export const listProviderGuardrails = async (): Promise<ProviderGuardrailResponseDTO[]> => {
  const res = await apiClient.get<ProviderGuardrailResponseDTO[]>(`${BASE}/provider-guardrails`);
  return res.data;
};

export const refreshProviderGuardrails = async (): Promise<ProviderGuardrailResponseDTO[]> => {
  const res = await apiClient.post<ProviderGuardrailResponseDTO[]>(
    `${BASE}/provider-guardrails/refresh`
  );
  return res.data;
};

export const updateProviderGuardrailAttachment = async (
  id: number,
  payload: UpdateProviderGuardrailAttachmentRequestDTO
): Promise<ProviderGuardrailResponseDTO> => {
  const res = await apiClient.put<ProviderGuardrailResponseDTO>(
    `${BASE}/provider-guardrails/${id}/attachment`,
    payload
  );
  return res.data;
};

export const getGovernancePolicy = async (): Promise<AiGovernancePolicyResponseDTO> => {
  const res = await apiClient.get<AiGovernancePolicyResponseDTO>(`${BASE}/governance`);
  return res.data;
};

export const updateGovernancePolicy = async (
  payload: UpdateAiGovernancePolicyRequestDTO
): Promise<AiGovernancePolicyResponseDTO> => {
  const res = await apiClient.put<AiGovernancePolicyResponseDTO>(`${BASE}/governance`, payload);
  return res.data;
};

export const listDocuments = async (
  query: KbDocumentsQuery = {}
): Promise<PageResponse<KnowledgeBaseDocumentResponseDTO>> => {
  const res = await apiClient.get<PageResponse<KnowledgeBaseDocumentResponseDTO>>(
    `${BASE}/knowledge-base/documents`,
    {
      params: {
        status: query.status,
        page: query.page,
        size: query.size,
      },
    }
  );
  return res.data;
};

export const getDocument = async (id: number): Promise<KnowledgeBaseDocumentResponseDTO> => {
  const res = await apiClient.get<KnowledgeBaseDocumentResponseDTO>(
    `${BASE}/knowledge-base/documents/${id}`
  );
  return res.data;
};

export const addFileDocument = async (
  title: string,
  file: File
): Promise<KnowledgeBaseDocumentResponseDTO> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  const res = await apiClient.post<KnowledgeBaseDocumentResponseDTO>(
    `${BASE}/knowledge-base/documents/file`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
};

export const addFaqDocument = async (
  payload: AddFaqDocumentRequestDTO
): Promise<KnowledgeBaseDocumentResponseDTO> => {
  const res = await apiClient.post<KnowledgeBaseDocumentResponseDTO>(
    `${BASE}/knowledge-base/documents/faq`,
    payload
  );
  return res.data;
};

export const updateDocument = async (
  id: number,
  payload: UpdateKnowledgeBaseDocumentRequestDTO
): Promise<KnowledgeBaseDocumentResponseDTO> => {
  const res = await apiClient.put<KnowledgeBaseDocumentResponseDTO>(
    `${BASE}/knowledge-base/documents/${id}`,
    payload
  );
  return res.data;
};

export const deleteDocument = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE}/knowledge-base/documents/${id}`);
};

export const refreshDocumentStatus = async (
  id: number
): Promise<KnowledgeBaseDocumentResponseDTO> => {
  const res = await apiClient.post<KnowledgeBaseDocumentResponseDTO>(
    `${BASE}/knowledge-base/documents/${id}/refresh-status`
  );
  return res.data;
};

export const downloadDocument = async (
  id: number
): Promise<{ blob: Blob; filename: string; contentType: string }> => {
  const res = await apiClient.get<Blob>(`${BASE}/knowledge-base/documents/${id}/download`, {
    responseType: 'blob',
  });
  const headers = res.headers as Record<string, unknown>;
  const cd =
    typeof headers['content-disposition'] === 'string'
      ? (headers['content-disposition'] as string)
      : '';
  const contentType =
    typeof headers['content-type'] === 'string'
      ? (headers['content-type'] as string)
      : 'application/octet-stream';
  return {
    blob: res.data,
    filename: parseContentDispositionFilename(cd) ?? `documento-${id}`,
    contentType,
  };
};

export const triggerReindex = async (): Promise<IndexingJobStatusResponseDTO> => {
  const res = await apiClient.post<IndexingJobStatusResponseDTO>(`${BASE}/knowledge-base/reindex`);
  return res.data;
};

export const getIndexingJobStatus = async (
  jobId: string
): Promise<IndexingJobStatusResponseDTO> => {
  const res = await apiClient.get<IndexingJobStatusResponseDTO>(
    `${BASE}/knowledge-base/indexing-jobs/${encodeURIComponent(jobId)}`
  );
  return res.data;
};

export const listVersions = async (
  query: VersionsQuery = {}
): Promise<PageResponse<AiAgentConfigurationVersionResponseDTO>> => {
  const res = await apiClient.get<PageResponse<AiAgentConfigurationVersionResponseDTO>>(
    `${BASE}/versions`,
    { params: { page: query.page, size: query.size } }
  );
  return res.data;
};

export const rollbackVersion = async (
  versionNumber: number
): Promise<AiAgentConfigurationVersionResponseDTO> => {
  const res = await apiClient.post<AiAgentConfigurationVersionResponseDTO>(
    `${BASE}/versions/${versionNumber}/rollback`
  );
  return res.data;
};

export const listAuditEvents = async (
  query: AuditEventsQuery = {}
): Promise<PageResponse<AiAdminAuditEventResponseDTO>> => {
  const res = await apiClient.get<PageResponse<AiAdminAuditEventResponseDTO>>(
    `${BASE}/audit-events`,
    {
      params: {
        type: query.type,
        from: query.from,
        to: query.to,
        page: query.page,
        size: query.size,
      },
    }
  );
  return res.data;
};

const parseContentDispositionFilename = (cd: string): string | null => {
  if (!cd) return null;
  // RFC 5987: filename*=UTF-8''<percent-encoded>
  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }
  // Fallback: filename="..." o filename=...
  const plainMatch = /filename\s*=\s*"?([^";]+)"?/i.exec(cd);
  if (plainMatch) {
    return plainMatch[1].trim();
  }
  return null;
};
