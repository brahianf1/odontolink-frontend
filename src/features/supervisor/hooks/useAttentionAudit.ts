import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPractitionerAttentionDetail,
  getPractitionerAttentionProgressNotes,
  finalizeAttentionAsSupervisor,
} from '../../../services/api/supervisorService';
import type {
  AttentionResponseDTO,
  ProgressNoteResponseDTO,
} from '../../../types/attention.types';

interface UseAttentionAuditState {
  attention: AttentionResponseDTO | null;
  progressNotes: ProgressNoteResponseDTO[];
  loading: boolean;
  finalizing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  finalize: () => Promise<AttentionResponseDTO>;
}

export const useAttentionAudit = (
  practitionerId: number | null,
  attentionId: number | null
): UseAttentionAuditState => {
  const [attention, setAttention] = useState<AttentionResponseDTO | null>(null);
  const [progressNotes, setProgressNotes] = useState<ProgressNoteResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (
      practitionerId === null ||
      attentionId === null ||
      Number.isNaN(practitionerId) ||
      Number.isNaN(attentionId)
    ) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detail, notes] = await Promise.all([
        getPractitionerAttentionDetail(practitionerId, attentionId),
        getPractitionerAttentionProgressNotes(practitionerId, attentionId),
      ]);
      if (isMounted.current) {
        setAttention(detail);
        setProgressNotes(notes);
      }
    } catch (err) {
      if (isMounted.current) {
        const message =
          (err as { message?: string })?.message ||
          'No se pudo cargar el detalle de la atención.';
        setError(message);
        setAttention(null);
        setProgressNotes([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [practitionerId, attentionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const finalize = useCallback(async (): Promise<AttentionResponseDTO> => {
    if (practitionerId === null || attentionId === null) {
      throw new Error('Identificadores inválidos.');
    }
    setFinalizing(true);
    try {
      const updated = await finalizeAttentionAsSupervisor(practitionerId, attentionId);
      if (isMounted.current) setAttention(updated);
      return updated;
    } finally {
      if (isMounted.current) setFinalizing(false);
    }
  }, [practitionerId, attentionId]);

  return {
    attention,
    progressNotes,
    loading,
    finalizing,
    error,
    refresh: load,
    finalize,
  };
};
