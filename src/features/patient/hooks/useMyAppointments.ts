import { useCallback, useEffect, useState } from 'react';
import patientService from '../../../services/api/patientService';
import type { AppointmentResponseDTO } from '../../../types/appointment.types';
import { mapBusinessError } from '../utils/apiErrors';
import { usePatientFeedback } from '../context/PatientFeedbackProvider';

interface UseMyAppointmentsResult {
  appointments: AppointmentResponseDTO[];
  loading: boolean;
  cancellingId: number | null;
  error: string | null;
  reload: () => Promise<void>;
  cancel: (id: number, reason?: string) => Promise<boolean>;
}

export function useMyAppointments(): UseMyAppointmentsResult {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { notifySuccess, notifyError } = usePatientFeedback();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getMyUpcomingAppointments();
      setAppointments(data);
    } catch (err) {
      const { message } = mapBusinessError(err, 'No pudimos cargar tus turnos.');
      setError(message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const cancel = useCallback(
    async (id: number, reason?: string): Promise<boolean> => {
      setCancellingId(id);
      try {
        await patientService.cancelAppointment(id, { reason: reason?.trim() || undefined });
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        notifySuccess('Turno cancelado correctamente.');
        return true;
      } catch (err) {
        const { message } = mapBusinessError(err, 'No pudimos cancelar el turno.');
        notifyError(message);
        return false;
      } finally {
        setCancellingId(null);
      }
    },
    [notifyError, notifySuccess]
  );

  return { appointments, loading, cancellingId, error, reload, cancel };
}
