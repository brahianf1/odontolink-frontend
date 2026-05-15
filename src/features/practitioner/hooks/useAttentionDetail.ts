import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addProgressNote,
  cancelAttention,
  finalizeAttention,
  getAttentionById,
  getProgressNotes,
} from '../../../services/api/practitionerService';
import type {
  AttentionResponseDTO,
  ProgressNoteRequestDTO,
  ProgressNoteResponseDTO,
} from '../../../types/attention.types';
import { mapPractitionerError } from '../utils/apiErrors';

interface FeedbackState {
  error: string | null;
  success: string | null;
}

const EMPTY: FeedbackState = { error: null, success: null };

interface UseAttentionDetailResult {
  attention: AttentionResponseDTO | null;
  notes: ProgressNoteResponseDTO[];
  loading: boolean;
  mutating: boolean;
  feedback: FeedbackState;
  reload: () => Promise<void>;
  addNote: (content: string) => Promise<boolean>;
  finalize: () => Promise<boolean>;
  cancel: (reason: string) => Promise<boolean>;
  clearFeedback: () => void;
}

/**
 * Detail view for a single clinical case: loads the attention plus its
 * progress notes, and exposes the two write operations practitioners need
 * — adding a note and finalizing the case. Finalization surfaces the 422
 * business-rule error (pending appointments) through `feedback.error`.
 */
export function useAttentionDetail(attentionId: number | null): UseAttentionDetailResult {
  const [attention, setAttention] = useState<AttentionResponseDTO | null>(null);
  const [notes, setNotes] = useState<ProgressNoteResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(EMPTY);

  const reload = useCallback(async () => {
    if (attentionId == null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFeedback((f) => ({ ...f, error: null }));
    try {
      const [att, n] = await Promise.all([
        getAttentionById(attentionId),
        getProgressNotes(attentionId),
      ]);
      setAttention(att);
      setNotes(n);
    } catch (err) {
      const mapped = mapPractitionerError(err, 'No se pudo cargar la atención.');
      setFeedback({ error: mapped.message, success: null });
    } finally {
      setLoading(false);
    }
  }, [attentionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addNote = useCallback(
    async (content: string): Promise<boolean> => {
      if (attentionId == null) return false;
      const trimmed = content.trim();
      if (trimmed.length < 10 || trimmed.length > 5000) {
        setFeedback({
          error: 'La nota debe tener entre 10 y 5000 caracteres.',
          success: null,
        });
        return false;
      }
      setMutating(true);
      setFeedback(EMPTY);
      try {
        const payload: ProgressNoteRequestDTO = { content: trimmed };
        const updatedAttention = await addProgressNote(attentionId, payload);
        setAttention(updatedAttention);
        const refreshed = await getProgressNotes(attentionId);
        setNotes(refreshed);
        setFeedback({ error: null, success: 'Nota de evolución agregada.' });
        return true;
      } catch (err) {
        const mapped = mapPractitionerError(err, 'No se pudo agregar la nota.');
        setFeedback({ error: mapped.message, success: null });
        return false;
      } finally {
        setMutating(false);
      }
    },
    [attentionId]
  );

  const finalize = useCallback(async (): Promise<boolean> => {
    if (attentionId == null) return false;
    setMutating(true);
    setFeedback(EMPTY);
    try {
      const updated = await finalizeAttention(attentionId);
      setAttention(updated);
      setFeedback({ error: null, success: 'Atención finalizada.' });
      return true;
    } catch (err) {
      const mapped = mapPractitionerError(err, 'No se pudo finalizar la atención.');
      setFeedback({ error: mapped.message, success: null });
      return false;
    } finally {
      setMutating(false);
    }
  }, [attentionId]);

  const cancel = useCallback(
    async (reason: string): Promise<boolean> => {
      if (attentionId == null) return false;
      const trimmed = reason.trim();
      if (trimmed.length < 5 || trimmed.length > 1000) {
        setFeedback({ error: 'El motivo debe tener entre 5 y 1000 caracteres.', success: null });
        return false;
      }
      setMutating(true);
      setFeedback(EMPTY);
      try {
        const updated = await cancelAttention(attentionId, { reason: trimmed });
        setAttention(updated);
        setFeedback({ error: null, success: 'Caso clínico cancelado.' });
        return true;
      } catch (err) {
        const mapped = mapPractitionerError(err, 'No se pudo cancelar el caso.');
        setFeedback({ error: mapped.message, success: null });
        return false;
      } finally {
        setMutating(false);
      }
    },
    [attentionId]
  );

  const clearFeedback = useCallback(() => setFeedback(EMPTY), []);

  return useMemo(
    () => ({
      attention,
      notes,
      loading,
      mutating,
      feedback,
      reload,
      addNote,
      finalize,
      cancel,
      clearFeedback,
    }),
    [attention, notes, loading, mutating, feedback, reload, addNote, finalize, cancel, clearFeedback]
  );
}
