import { useCallback, useEffect, useState } from 'react';
import patientService from '../../../services/api/patientService';
import type { AttentionResponseDTO } from '../../../types/attention.types';
import type { FeedbackResponseDTO } from '../../../types/feedback.types';
import { mapBusinessError } from '../utils/apiErrors';

interface UseMyAttentionsResult {
  attentions: AttentionResponseDTO[];
  feedbackByAttentionId: Record<number, FeedbackResponseDTO | null>;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useMyAttentions(): UseMyAttentionsResult {
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [feedbackByAttentionId, setFeedbackByAttentionId] = useState<
    Record<number, FeedbackResponseDTO | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getMyAttentions();
      setAttentions(data);

      const completed = data.filter((att) => att.status === 'COMPLETED');
      const results = await Promise.all(
        completed.map(async (attention) => {
          try {
            const list = await patientService.getFeedbackForAttention(attention.id);
            // The endpoint returns feedback in both directions for the same
            // attention (patient -> practitioner and practitioner -> patient).
            // We only want the one the patient submitted; otherwise the UI
            // mistakes the practitioner's rating for the patient's own and
            // hides the "Calificar" CTA.
            const isPatientRole = (role?: string | null) => {
              if (!role) return false;
              const r = String(role).toUpperCase();
              return r.includes('PATIENT') || r.includes('PAT');
            };

            const own = list?.find((f) => isPatientRole(f.submittedByRole)) ?? null;
            return [attention.id, own] as const;
          } catch {
            return [attention.id, null] as const;
          }
        })
      );
      setFeedbackByAttentionId(Object.fromEntries(results));
    } catch (err) {
      const { message } = mapBusinessError(err, 'No pudimos cargar tus atenciones.');
      setError(message);
      setAttentions([]);
      setFeedbackByAttentionId({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { attentions, feedbackByAttentionId, loading, error, reload };
}
