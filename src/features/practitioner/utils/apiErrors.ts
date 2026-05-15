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

const flattenDetails = (details: ErrorDataShape['details']): string | undefined => {
  if (!details) return undefined;
  if (typeof details === 'string') return details;
  if (Array.isArray(details)) return details.join(' · ');
  return Object.entries(details)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
};

const FRIENDLY_422: Record<string, string> = {
  PENDING_APPOINTMENTS:
    'No puedes finalizar la atención: tienes turnos pendientes (programados). Cancélalos o márcalos como completados/ausentes antes de finalizar.',
  ATTENTION_HAS_PENDING_APPOINTMENTS:
    'No puedes finalizar la atención: tienes turnos pendientes (programados). Cancélalos o márcalos como completados/ausentes antes de finalizar.',
  AVAILABILITY_CONFLICT:
    'Los horarios indicados colisionan con otra oferta tuya. Ajusta el día o la franja horaria.',
  OFFER_HAS_ACTIVE_ATTENTIONS:
    'Esta oferta tiene atenciones activas y no puede eliminarse: se desactivó (soft delete).',
  ACTIVE_APPOINTMENTS_FOUND:
    'No se puede modificar la oferta mientras tenga turnos activos. Cancélalos primero.',
  OFFER_WINDOW_INVALID:
    'El período de la oferta no es válido. La fecha de fin debe ser posterior al inicio.',
  TREATMENT_ALREADY_OFFERED:
    'Ya tienes una oferta activa para este tratamiento.',
};

export interface MappedError {
  message: string;
  status?: number;
  isBusinessRule: boolean;
  errorCode?: string;
}

export const mapPractitionerError = (
  err: unknown,
  fallback: string
): MappedError => {
  if (!isApiError(err)) {
    return { message: fallback, isBusinessRule: false };
  }

  const data = asErrorData(err.data);
  const backendMessage = data?.message ?? err.message;
  const code = data?.errorCode;
  const detailString = flattenDetails(data?.details);

  if (err.status === 422) {
    if (code && FRIENDLY_422[code]) {
      return { message: FRIENDLY_422[code], status: 422, isBusinessRule: true, errorCode: code };
    }
    return {
      message: backendMessage ?? detailString ?? 'No se puede completar la operación por una regla de negocio.',
      status: 422,
      isBusinessRule: true,
      errorCode: code,
    };
  }

  if (err.status === 400) {
    return {
      message: detailString ?? backendMessage ?? 'Datos inválidos en la solicitud.',
      status: 400,
      isBusinessRule: false,
      errorCode: code,
    };
  }

  if (err.status === 401 || err.status === 403) {
    return { message: 'No tienes permiso para realizar esta acción.', status: err.status, isBusinessRule: false };
  }

  if (err.status === 404) {
    return { message: 'El recurso solicitado no existe o ya no está disponible.', status: 404, isBusinessRule: false };
  }

  return { message: backendMessage ?? fallback, status: err.status, isBusinessRule: false, errorCode: code };
};
