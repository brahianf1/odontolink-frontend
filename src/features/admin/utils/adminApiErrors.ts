interface ApiErrorShape {
  status?: number;
  message?: string;
  data?: unknown;
}

interface ErrorDataShape {
  message?: string;
  errorCode?: string;
  details?: string | string[] | Record<string, string>;
}

const isApiError = (err: unknown): err is ApiErrorShape =>
  typeof err === 'object' && err !== null && ('status' in err || 'message' in err);

const asErrorData = (data: unknown): ErrorDataShape | undefined =>
  typeof data === 'object' && data !== null ? (data as ErrorDataShape) : undefined;

export interface MappedAdminError {
  message: string;
  status?: number;
  isBusinessRule: boolean;
  /**
   * True cuando el backend devuelve el mensaje del último admin activo —
   * la UI lo usa para extender la duración del snackbar (mensaje accionable).
   */
  isLastAdminGuard?: boolean;
}

const LAST_ADMIN_FRAGMENT = 'único administrador activo';
const SELF_DEACTIVATION_FRAGMENT = 'propia cuenta de administrador';

export const mapAdminError = (
  err: unknown,
  fallback: string
): MappedAdminError => {
  if (!isApiError(err)) {
    return { message: fallback, isBusinessRule: false };
  }

  const data = asErrorData(err.data);
  const backendMessage = data?.message ?? err.message;

  if (err.status === 422) {
    const message =
      backendMessage ??
      'No se puede completar la operación por una regla de negocio.';
    return {
      message,
      status: 422,
      isBusinessRule: true,
      isLastAdminGuard:
        message.includes(LAST_ADMIN_FRAGMENT) ||
        message.includes(SELF_DEACTIVATION_FRAGMENT),
    };
  }

  if (err.status === 404) {
    return {
      message: backendMessage ?? 'El usuario solicitado no existe.',
      status: 404,
      isBusinessRule: false,
    };
  }

  if (err.status === 401 || err.status === 403) {
    return {
      message: 'No tienes permiso para realizar esta acción.',
      status: err.status,
      isBusinessRule: false,
    };
  }

  return {
    message: backendMessage ?? fallback,
    status: err.status,
    isBusinessRule: false,
  };
};
