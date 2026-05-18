import type { ApiError } from '../../../../services/api/apiClient';
import type { AiAgentErrorCode, ParsedRequirement } from '../../../../types/aiAgent.types';
import { parseRequirements } from './missingRequirements';

export interface AiAgentMappedError {
  message: string;
  code?: AiAgentErrorCode;
  status?: number;
  isProviderDown?: boolean;
  isProviderBadConfig?: boolean;
  isConfigInvalid?: boolean;
  isNotConfigured?: boolean;
  isNotPublished?: boolean;
  missingRequirements?: ParsedRequirement[];
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

const extractDetails = (err: ApiError): string[] | undefined => {
  if (Array.isArray(err.details)) return err.details;
  const data = err.data as { details?: unknown } | undefined;
  if (data && Array.isArray(data.details)) {
    return (data.details as unknown[]).filter((v): v is string => typeof v === 'string');
  }
  return undefined;
};

const FRIENDLY: Record<AiAgentErrorCode, string> = {
  AI_PROVIDER_UNAVAILABLE:
    'El proveedor de IA no está disponible en este momento. Intentalo nuevamente en unos minutos.',
  AI_PROVIDER_BAD_REQUEST:
    'La configuración enviada al proveedor de IA es inválida. Revisá los parámetros del modelo.',
  AI_AGENT_CONFIG_INVALID:
    'No se puede publicar el agente: faltan requisitos para completar la configuración.',
  AI_AGENT_NOT_CONFIGURED:
    'El agente todavía no fue configurado. Completá la configuración inicial para continuar.',
  AI_AGENT_NOT_PUBLISHED:
    'Solo se puede revertir un agente que esté publicado. La configuración ya está en estado borrador.',
  AI_KB_DOCUMENT_NOT_FOUND:
    'El documento solicitado ya no existe o fue eliminado.',
  AI_KB_FILE_EMPTY: 'El archivo está vacío. Subí un archivo con contenido.',
  AI_KB_FILE_TOO_LARGE: 'El archivo supera el tamaño máximo permitido (10 MB).',
  AI_KB_UNSUPPORTED_TYPE: 'El tipo de archivo no está soportado.',
  AI_KB_INDEXING_FAILED: 'La indexación del documento falló. Intentá nuevamente.',
  AI_AGENT_INVOCATION_URL_UNAVAILABLE:
    'No se pudo resolver la URL del agente. Probá limpiar la caché de la URL o verificá la configuración del deployment.',
};

export const mapAiAgentError = (
  err: unknown,
  fallback: string
): AiAgentMappedError => {
  if (!isApiErrorShape(err)) {
    return { message: fallback };
  }

  const code = extractErrorCode(err) as AiAgentErrorCode | undefined;
  const friendly = code ? FRIENDLY[code] : undefined;
  const backendMessage =
    typeof err.message === 'string' && err.message.length > 0 ? err.message : undefined;

  const base: AiAgentMappedError = {
    message: friendly || backendMessage || fallback,
    code,
    status: err.status,
  };

  if (code === 'AI_PROVIDER_UNAVAILABLE') base.isProviderDown = true;
  if (code === 'AI_PROVIDER_BAD_REQUEST') base.isProviderBadConfig = true;
  if (code === 'AI_AGENT_NOT_CONFIGURED') base.isNotConfigured = true;
  if (code === 'AI_AGENT_NOT_PUBLISHED') base.isNotPublished = true;

  if (code === 'AI_AGENT_CONFIG_INVALID') {
    base.isConfigInvalid = true;
    const details = extractDetails(err);
    base.missingRequirements = parseRequirements(details);
  }

  return base;
};

export const mapKbUploadError = (err: unknown, fallback: string): AiAgentMappedError => {
  const mapped = mapAiAgentError(err, fallback);
  if (
    mapped.code === 'AI_KB_FILE_TOO_LARGE' ||
    mapped.code === 'AI_KB_UNSUPPORTED_TYPE' ||
    mapped.code === 'AI_KB_FILE_EMPTY' ||
    mapped.code === 'AI_KB_INDEXING_FAILED'
  ) {
    return mapped;
  }
  return mapped;
};
