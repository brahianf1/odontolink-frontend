import type { ApiError } from '../../../../services/api/apiClient';

/**
 * Stable error codes returned by the Site Appearance feature. The backend
 * uses `errorCode` only for semantic / business-rule errors (422 / 409).
 * DTO-validation errors (400) come without errorCode but with a populated
 * `details: string[]` array.
 */
export type AppearanceErrorCode =
  | 'INVALID_THEME_TOKENS'
  | 'VERSION_CONFLICT'
  | 'THEME_IN_USE';

const errorCodeMessages: Record<AppearanceErrorCode, string> = {
  INVALID_THEME_TOKENS:
    'El CSS pegado tiene tokens inválidos o faltantes. Revisá los detalles.',
  VERSION_CONFLICT:
    'Otro admin ya actualizó la configuración. Recargá la página y volvé a intentar.',
  THEME_IN_USE:
    'No se puede eliminar un theme que está aplicado institucionalmente. Aplicá otro primero.',
};

const isKnownAppearanceCode = (code: unknown): code is AppearanceErrorCode =>
  code === 'INVALID_THEME_TOKENS' ||
  code === 'VERSION_CONFLICT' ||
  code === 'THEME_IN_USE';

interface ApiErrorWithCode extends ApiError {
  errorCode?: string;
}

const readErrorCode = (err: ApiError): string | undefined => {
  const direct = (err as ApiErrorWithCode).errorCode;
  if (typeof direct === 'string') return direct;
  const data = err.data as { errorCode?: unknown } | undefined;
  return typeof data?.errorCode === 'string' ? data.errorCode : undefined;
};

export interface AppearanceErrorSummary {
  /** Stable error code if known, otherwise undefined. */
  code: AppearanceErrorCode | undefined;
  /** Status code (HTTP). */
  status: number | undefined;
  /** User-facing message. */
  message: string;
  /** Field-level or structured details to render in a list. */
  details: string[];
  /** Backend trace id (if returned), useful for support requests. */
  traceId?: string;
}

/**
 * Normalize an ApiError into something the UI layer can consume without
 * digging into nested fields. Renders friendly Spanish messages keyed by
 * the backend's stable `errorCode`. Falls back to the raw `message`.
 */
export const summarizeAppearanceError = (err: ApiError): AppearanceErrorSummary => {
  const rawCode = readErrorCode(err);
  const code = isKnownAppearanceCode(rawCode) ? rawCode : undefined;
  const message = code ? errorCodeMessages[code] : err.message;
  return {
    code,
    status: err.status,
    message,
    details: err.details ?? [],
    traceId: err.traceId,
  };
};

/**
 * For DTO-validation (400) errors, the backend sends details as a string
 * array of the form `"name: 'name' debe tener entre 3 y 120 caracteres"`.
 * Split into a map keyed by field path for inline rendering.
 */
export const detailsToFieldMap = (details: string[]): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const entry of details) {
    const colonIdx = entry.indexOf(':');
    if (colonIdx === -1) continue;
    const field = entry.slice(0, colonIdx).trim();
    const message = entry.slice(colonIdx + 1).trim();
    if (field && !result[field]) result[field] = message;
  }
  return result;
};
