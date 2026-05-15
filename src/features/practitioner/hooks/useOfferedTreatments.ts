import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addTreatmentToCatalog,
  getAllTreatments,
  getMyOfferedTreatments,
  pauseOfferedTreatment,
  reactivateOfferedTreatment,
  removeFromCatalog,
  resumeOfferedTreatment,
  updateOfferedTreatment,
} from '../../../services/api/practitionerService';
import type {
  AddOfferedTreatmentRequestDTO,
  OfferedTreatmentDeletionResponseDTO,
  OfferedTreatmentResponseDTO,
  TreatmentResponseDTO,
  UpdateOfferedTreatmentRequestDTO,
} from '../../../types/practitioner.types';
import { mapPractitionerError } from '../utils/apiErrors';

interface FeedbackState {
  error: string | null;
  success: string | null;
  info: string | null;
}

const EMPTY_FEEDBACK: FeedbackState = { error: null, success: null, info: null };

export interface ReactivateOutcome {
  ok: boolean;
  expired?: boolean;
}

interface UseOfferedTreatmentsResult {
  offers: OfferedTreatmentResponseDTO[];
  catalog: TreatmentResponseDTO[];
  loading: boolean;
  mutatingId: number | null;
  feedback: FeedbackState;
  reload: () => Promise<void>;
  create: (data: AddOfferedTreatmentRequestDTO) => Promise<boolean>;
  update: (id: number, data: UpdateOfferedTreatmentRequestDTO) => Promise<boolean>;
  remove: (id: number) => Promise<OfferedTreatmentDeletionResponseDTO | null>;
  pause: (id: number) => Promise<boolean>;
  resume: (id: number) => Promise<boolean>;
  reactivate: (id: number) => Promise<ReactivateOutcome>;
  clearFeedback: () => void;
}

/**
 * Owns the practitioner's offered-treatments catalog plus the master
 * treatment list (needed by the wizard). Every mutation:
 *  - sets `mutatingId` while it's in flight (so the affected row can show
 *    spinner / disabled state per-row instead of locking the whole page)
 *  - surfaces feedback as success/info/error so the page can pick the right
 *    Snackbar tone
 *  - replaces the entity in place with the server response when possible,
 *    keeping the optimistic-feel responsiveness without divergence.
 *
 * We fetch the catalog with `?status=ALL` once; bucketing happens locally
 * via `deriveBucket`. The buckets are pure functions of the response, so
 * client-side filtering stays consistent with the server's filter param.
 */
export function useOfferedTreatments(): UseOfferedTreatmentsResult {
  const [offers, setOffers] = useState<OfferedTreatmentResponseDTO[]>([]);
  const [catalog, setCatalog] = useState<TreatmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(EMPTY_FEEDBACK);

  const reload = useCallback(async () => {
    setLoading(true);
    setFeedback((f) => ({ ...f, error: null }));
    try {
      const [offersData, catalogData] = await Promise.all([
        getMyOfferedTreatments('ALL'),
        getAllTreatments(),
      ]);
      setOffers(offersData);
      setCatalog(catalogData);
    } catch (err) {
      const mapped = mapPractitionerError(err, 'No se pudo cargar tu catálogo.');
      setFeedback({ error: mapped.message, success: null, info: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const replaceOffer = useCallback((updated: OfferedTreatmentResponseDTO) => {
    setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  const create = useCallback(
    async (data: AddOfferedTreatmentRequestDTO): Promise<boolean> => {
      setMutatingId(-1);
      setFeedback(EMPTY_FEEDBACK);
      try {
        const created = await addTreatmentToCatalog(data);
        setOffers((prev) => [...prev, created]);
        setFeedback({ error: null, info: null, success: 'Oferta publicada en tu catálogo.' });
        return true;
      } catch (err) {
        const mapped = mapPractitionerError(err, 'No se pudo crear la oferta.');
        setFeedback({ error: mapped.message, success: null, info: null });
        return false;
      } finally {
        setMutatingId(null);
      }
    },
    []
  );

  const update = useCallback(
    async (id: number, data: UpdateOfferedTreatmentRequestDTO): Promise<boolean> => {
      setMutatingId(id);
      setFeedback(EMPTY_FEEDBACK);
      try {
        const updated = await updateOfferedTreatment(id, data);
        replaceOffer(updated);
        setFeedback({ error: null, info: null, success: 'Oferta actualizada.' });
        return true;
      } catch (err) {
        const mapped = mapPractitionerError(err, 'No se pudo actualizar la oferta.');
        setFeedback({ error: mapped.message, success: null, info: null });
        return false;
      } finally {
        setMutatingId(null);
      }
    },
    [replaceOffer]
  );

  const remove = useCallback(
    async (id: number): Promise<OfferedTreatmentDeletionResponseDTO | null> => {
      setMutatingId(id);
      setFeedback(EMPTY_FEEDBACK);
      try {
        const result = await removeFromCatalog(id);
        const message = result.message ?? 'Operación completada.';
        if (result.outcome === 'HARD_DELETED') {
          setOffers((prev) => prev.filter((o) => o.id !== id));
          setFeedback({ error: null, info: null, success: message });
        } else {
          // SOFT_DELETED: backend kept the row with status=INACTIVE. Reflect
          // that locally so the chip flips without waiting for a refetch.
          setOffers((prev) =>
            prev.map((o) =>
              o.id === id ? { ...o, status: 'INACTIVE' as const, expired: false } : o
            )
          );
          setFeedback({ error: null, success: null, info: message });
        }
        return result;
      } catch (err) {
        const mapped = mapPractitionerError(err, 'No se pudo eliminar la oferta.');
        setFeedback({ error: mapped.message, success: null, info: null });
        return null;
      } finally {
        setMutatingId(null);
      }
    },
    []
  );

  const runTransition = useCallback(
    async (
      id: number,
      action: () => Promise<OfferedTreatmentResponseDTO>,
      successMessage: string,
      errorMessage: string
    ): Promise<boolean> => {
      setMutatingId(id);
      setFeedback(EMPTY_FEEDBACK);
      try {
        const updated = await action();
        replaceOffer(updated);
        setFeedback({ error: null, info: null, success: successMessage });
        return true;
      } catch (err) {
        const mapped = mapPractitionerError(err, errorMessage);
        setFeedback({ error: mapped.message, success: null, info: null });
        return false;
      } finally {
        setMutatingId(null);
      }
    },
    [replaceOffer]
  );

  const pause = useCallback(
    (id: number) =>
      runTransition(
        id,
        () => pauseOfferedTreatment(id),
        'Oferta pausada. Dejó de aparecer en el catálogo público.',
        'No se pudo pausar la oferta.'
      ),
    [runTransition]
  );

  const resume = useCallback(
    (id: number) =>
      runTransition(
        id,
        () => resumeOfferedTreatment(id),
        'Oferta reanudada.',
        'No se pudo reanudar la oferta.'
      ),
    [runTransition]
  );

  const reactivate = useCallback(
    async (id: number): Promise<ReactivateOutcome> => {
      setMutatingId(id);
      setFeedback(EMPTY_FEEDBACK);
      try {
        const updated = await reactivateOfferedTreatment(id);
        replaceOffer(updated);
        if (updated.expired) {
          // Reactivation succeeded but the window is already past. UX
          // expects the page to nudge the practitioner to renew dates.
          setFeedback({
            error: null,
            success: null,
            info: 'Oferta reactivada. Sus fechas están vencidas — renová el período para volver al catálogo público.',
          });
        } else {
          setFeedback({
            error: null,
            info: null,
            success: 'Oferta reactivada y visible para los pacientes.',
          });
        }
        return { ok: true, expired: updated.expired };
      } catch (err) {
        const mapped = mapPractitionerError(err, 'No se pudo reactivar la oferta.');
        setFeedback({ error: mapped.message, success: null, info: null });
        return { ok: false };
      } finally {
        setMutatingId(null);
      }
    },
    [replaceOffer]
  );

  const clearFeedback = useCallback(() => setFeedback(EMPTY_FEEDBACK), []);

  return useMemo(
    () => ({
      offers,
      catalog,
      loading,
      mutatingId,
      feedback,
      reload,
      create,
      update,
      remove,
      pause,
      resume,
      reactivate,
      clearFeedback,
    }),
    [offers, catalog, loading, mutatingId, feedback, reload, create, update, remove, pause, resume, reactivate, clearFeedback]
  );
}
