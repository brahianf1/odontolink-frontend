import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelAppointment,
  getMyUpcomingAppointments,
  markAppointmentAsCompleted,
  markAppointmentAsNoShow,
} from '../../../services/api/practitionerService';
import type { AppointmentResponseDTO } from '../../../types/attention.types';

type ApiError = { message?: string };

interface FeedbackState {
  error: string | null;
  success: string | null;
}

interface UseAppointmentsResult {
  appointments: AppointmentResponseDTO[];
  loading: boolean;
  mutatingId: number | null;
  feedback: FeedbackState;
  reload: () => Promise<void>;
  complete: (id: number) => Promise<void>;
  markNoShow: (id: number) => Promise<void>;
  cancel: (id: number, reason: string) => Promise<void>;
  clearFeedback: () => void;
}

/**
 * Single source of truth for the practitioner's upcoming appointments.
 *
 * Concerns owned by this hook:
 *  - fetching (initial load + manual `reload`)
 *  - mutations (complete / no-show / cancel) with per-row `mutatingId`
 *  - optimistic update: the mutated row is replaced locally with the server response
 *  - user-facing feedback messages (success / error)
 *
 * Concerns deliberately NOT owned here:
 *  - mapping to schedule-x events (kept pure in scheduleMappers.ts)
 *  - which view is active (UI-only, lives in the page)
 */
export function useAppointments(): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({ error: null, success: null });

  const reload = useCallback(async () => {
    setLoading(true);
    setFeedback((f) => ({ ...f, error: null }));
    try {
      const data = await getMyUpcomingAppointments();
      setAppointments(data);
    } catch (err) {
      const message = (err as ApiError).message ?? 'Error al cargar los turnos';
      setFeedback({ error: message, success: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  /**
   * Wraps a mutation:
   *  - flips `mutatingId`
   *  - on success: replaces the row in-place with the server response and shows a toast
   *  - on failure: surfaces the error message
   */
  const runMutation = useCallback(
    async (
      id: number,
      action: () => Promise<AppointmentResponseDTO>,
      successMessage: string,
      errorMessage: string
    ) => {
      setMutatingId(id);
      setFeedback({ error: null, success: null });
      try {
        const updated = await action();
        setAppointments((prev) =>
          prev.map((appt) => (appt.id === updated.id ? updated : appt))
        );
        setFeedback({ error: null, success: successMessage });
      } catch (err) {
        const message = (err as ApiError).message ?? errorMessage;
        setFeedback({ error: message, success: null });
      } finally {
        setMutatingId(null);
      }
    },
    []
  );

  const complete = useCallback(
    (id: number) =>
      runMutation(
        id,
        () => markAppointmentAsCompleted(id),
        'Turno marcado como completado',
        'No se pudo completar el turno'
      ),
    [runMutation]
  );

  const markNoShow = useCallback(
    (id: number) =>
      runMutation(
        id,
        () => markAppointmentAsNoShow(id),
        'Turno marcado como inasistencia',
        'No se pudo marcar la inasistencia'
      ),
    [runMutation]
  );

  const cancel = useCallback(
    (id: number, reason: string) =>
      runMutation(
        id,
        () => cancelAppointment(id, { reason }),
        'Turno cancelado',
        'No se pudo cancelar el turno'
      ),
    [runMutation]
  );

  const clearFeedback = useCallback(
    () => setFeedback({ error: null, success: null }),
    []
  );

  return useMemo(
    () => ({
      appointments,
      loading,
      mutatingId,
      feedback,
      reload,
      complete,
      markNoShow,
      cancel,
      clearFeedback,
    }),
    [appointments, loading, mutatingId, feedback, reload, complete, markNoShow, cancel, clearFeedback]
  );
}
