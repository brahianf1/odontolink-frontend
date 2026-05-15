import { useCallback, useEffect, useState } from 'react';
import patientService from '../../../services/api/patientService';
import { mapBusinessError } from '../utils/apiErrors';

interface UseAvailableSlotsResult {
  slots: string[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAvailableSlots(
  offeredTreatmentId: number | null,
  date: string | null
): UseAvailableSlotsResult {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!offeredTreatmentId || !date) {
      setSlots([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getAvailableSlots(offeredTreatmentId, date);
      setSlots(data);
    } catch (err) {
      const { message } = mapBusinessError(err, 'No pudimos cargar los horarios disponibles.');
      setError(message);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [offeredTreatmentId, date]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { slots, loading, error, reload };
}
