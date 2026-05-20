import type { AttentionResponseDTO } from '../../../types/attention.types';

export type AttentionTerminationBlocker =
  | 'NOT_IN_PROGRESS'
  | 'FUTURE_SCHEDULED'
  | 'PAST_UNMARKED'
  | null;

export interface AttentionTerminationCheck {
  canTerminate: boolean;
  blocker: AttentionTerminationBlocker;
  futureScheduledCount: number;
  pastUnmarkedCount: number;
}

/**
 * Same predicate the backend uses for both POST /finalize and POST /cancel
 * on an attention. Terminating a clinical case requires the practitioner to
 * have left no SCHEDULED appointments dangling — neither future (must be
 * cancelled first) nor past (must be marked completed or no-show). Used to
 * preemptively disable the buttons with a precise tooltip so the user
 * doesn't see a 422.
 */
export const checkAttentionTermination = (
  attention: AttentionResponseDTO,
  now: Date = new Date()
): AttentionTerminationCheck => {
  if (attention.status !== 'IN_PROGRESS') {
    return {
      canTerminate: false,
      blocker: 'NOT_IN_PROGRESS',
      futureScheduledCount: 0,
      pastUnmarkedCount: 0,
    };
  }

  const nowTs = now.getTime();
  let future = 0;
  let past = 0;

  for (const appt of attention.appointments ?? []) {
    if (appt.status !== 'SCHEDULED') continue;
    const ts = new Date(appt.appointmentTime).getTime();
    if (ts >= nowTs) future += 1;
    else past += 1;
  }

  if (future > 0) {
    return {
      canTerminate: false,
      blocker: 'FUTURE_SCHEDULED',
      futureScheduledCount: future,
      pastUnmarkedCount: past,
    };
  }

  if (past > 0) {
    return {
      canTerminate: false,
      blocker: 'PAST_UNMARKED',
      futureScheduledCount: future,
      pastUnmarkedCount: past,
    };
  }

  return {
    canTerminate: true,
    blocker: null,
    futureScheduledCount: 0,
    pastUnmarkedCount: 0,
  };
};

export const terminationBlockerMessage = (check: AttentionTerminationCheck): string | null => {
  switch (check.blocker) {
    case 'FUTURE_SCHEDULED':
      return check.futureScheduledCount === 1
        ? 'Cancela el turno pendiente antes de continuar'
        : `Cancela los ${check.futureScheduledCount} turnos pendientes antes de continuar`;
    case 'PAST_UNMARKED':
      return check.pastUnmarkedCount === 1
        ? 'Marca el turno pasado como completado o ausente antes de continuar'
        : `Marca los ${check.pastUnmarkedCount} turnos pasados como completados o ausentes antes de continuar`;
    default:
      return null;
  }
};
