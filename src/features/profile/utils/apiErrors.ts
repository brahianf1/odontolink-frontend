import type { ApiError } from '../../../services/api/apiClient';

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'message' in error;

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isApiError(error) && typeof error.message === 'string' && error.message.length > 0) {
    return error.message;
  }
  return fallback;
};

export const isStatusCode = (error: unknown, status: number): boolean =>
  isApiError(error) && error.status === status;

export const isErrorDiscriminator = (error: unknown, discriminator: string): boolean =>
  isApiError(error) && error.error === discriminator;

export const getRetryAfterSeconds = (error: unknown): number | undefined => {
  if (!isApiError(error)) return undefined;
  return error.retryAfter;
};

export const formatRetryMessage = (
  retryAfter: number | undefined,
  fallback: string
): string => {
  if (!retryAfter || retryAfter <= 0) return fallback;
  if (retryAfter < 60) {
    return `Demasiados intentos. Esperá ${retryAfter} segundos antes de volver a probar.`;
  }
  const minutes = Math.ceil(retryAfter / 60);
  return `Demasiados intentos. Esperá ${minutes} minuto${minutes === 1 ? '' : 's'} antes de volver a probar.`;
};

export const getValidationDetails = (error: unknown): string[] | undefined => {
  if (!isApiError(error)) return undefined;
  return error.details;
};

export const extractFieldErrors = (
  details: string[] | undefined
): Record<string, string> => {
  if (!details) return {};
  const result: Record<string, string> = {};
  for (const entry of details) {
    const idx = entry.indexOf(':');
    if (idx <= 0) continue;
    const field = entry.slice(0, idx).trim();
    const message = entry.slice(idx + 1).trim();
    if (field && message) result[field] = message;
  }
  return result;
};
