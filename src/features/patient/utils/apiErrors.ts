interface ApiErrorShape {
  status?: number;
  message?: string;
  data?: { message?: string; errorCode?: string } | unknown;
}

const isApiError = (err: unknown): err is ApiErrorShape =>
  typeof err === 'object' && err !== null && ('status' in err || 'message' in err);

const extractBackendMessage = (err: ApiErrorShape): string | undefined => {
  const data = err.data as { message?: string } | undefined;
  return data?.message || err.message;
};

const extractErrorCode = (err: ApiErrorShape): string | undefined => {
  const data = err.data as { errorCode?: string } | undefined;
  return data?.errorCode;
};

const FRIENDLY_422_MESSAGES: Record<string, string> = {
  DOUBLE_BOOKING:
    'Ese horario acaba de reservarse. Por favor elige otro horario disponible.',
  ANTI_HOARDING:
    'Ya tienes una atención activa para este tratamiento. No puedes reservar otra hasta finalizar la actual.',
  TREATMENT_INACTIVE:
    'Este tratamiento ya no está disponible para reservas.',
  AVAILABILITY_BLOCKED:
    'La disponibilidad del practicante para este tratamiento está temporalmente bloqueada.',
  OUTSIDE_OFFER_WINDOW:
    'La fecha seleccionada está fuera del período de oferta de este tratamiento.',
};

export interface MappedError {
  message: string;
  isBusinessRule: boolean;
}

export const mapBusinessError = (err: unknown, fallback: string): MappedError => {
  if (!isApiError(err)) {
    return { message: fallback, isBusinessRule: false };
  }

  if (err.status === 422) {
    const code = extractErrorCode(err);
    if (code && FRIENDLY_422_MESSAGES[code]) {
      return { message: FRIENDLY_422_MESSAGES[code], isBusinessRule: true };
    }
    const backend = extractBackendMessage(err);
    return {
      message: backend || 'No se puede completar la operación por una regla de negocio.',
      isBusinessRule: true,
    };
  }

  if (err.status === 401 || err.status === 403) {
    return { message: 'No tienes permiso para realizar esta acción.', isBusinessRule: false };
  }

  if (err.status === 404) {
    return { message: 'El recurso solicitado no existe o ya no está disponible.', isBusinessRule: false };
  }

  const backend = extractBackendMessage(err);
  return { message: backend || fallback, isBusinessRule: false };
};
