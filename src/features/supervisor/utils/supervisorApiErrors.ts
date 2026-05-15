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
  PENDING_APPOINTMENTS:
    'No se puede finalizar la atención: aún hay turnos pendientes o programados. Cancélalos o márcalos como completados primero.',
  ALREADY_FINALIZED:
    'Esta atención ya fue finalizada previamente.',
  ATTENTION_CANCELLED:
    'No se puede finalizar una atención que fue cancelada.',
  PRACTITIONER_NOT_LINKED:
    'Este practicante no está bajo tu supervisión. Vincúlalo desde "Mis Practicantes" antes de auditar sus atenciones.',
  PRACTITIONER_ALREADY_LINKED:
    'Este practicante ya está vinculado a tu supervisión.',
  SUPERVISOR_LIMIT_REACHED:
    'Has alcanzado el límite máximo de practicantes a cargo.',
  INVALID_DATE_RANGE:
    'El rango de fechas seleccionado no es válido. La fecha de inicio debe ser anterior a la fecha de fin.',
};

export interface MappedError {
  message: string;
  isBusinessRule: boolean;
}

export const mapSupervisorError = (err: unknown, fallback: string): MappedError => {
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
    return {
      message: 'El recurso solicitado no existe o ya no está disponible.',
      isBusinessRule: false,
    };
  }

  const backend = extractBackendMessage(err);
  return { message: backend || fallback, isBusinessRule: false };
};
