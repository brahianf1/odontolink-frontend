import type {
  OfferedTreatmentResponseDTO,
  OfferedTreatmentStatus,
} from '../../../types/practitioner.types';

/**
 * Display-layer status of an offer, used by `OfferStatusChip` and card
 * treatments. Six visible sub-states derived from the backend's lifecycle
 * (`status`) plus the derived flags `expired`, `quotaExhausted`, and the
 * offerStartDate window. These are NOT the same as filter buckets.
 */
export type OfferDisplayStatus =
  | 'ACTIVE'
  | 'SCHEDULED'
  | 'QUOTA_FULL'
  | 'PAUSED'
  | 'EXPIRED'
  | 'INACTIVE';

/**
 * Filter buckets — mutually exclusive and 1:1 with the backend's `?status=`
 * param (plus ALL). One offer belongs to exactly one bucket.
 */
export type OfferBucket = 'ACTIVE' | 'PAUSED' | 'INACTIVE' | 'EXPIRED';

export interface OfferDisplayInfo {
  status: OfferDisplayStatus;
  label: string;
  tone: 'success' | 'info' | 'secondary' | 'neutral';
  description: string;
}

const DISPLAY_INFO: Record<OfferDisplayStatus, Omit<OfferDisplayInfo, 'status'>> = {
  ACTIVE: {
    label: 'Activa',
    tone: 'success',
    description: 'Visible para los pacientes y aceptando reservas.',
  },
  SCHEDULED: {
    label: 'Programada',
    tone: 'secondary',
    description: 'El período aún no comienza. Será reservable a partir de la fecha de inicio.',
  },
  QUOTA_FULL: {
    label: 'Cupo completo',
    tone: 'info',
    description: 'Alcanzaste el cupo máximo. Aumenta el cupo o espera a que terminen atenciones en curso.',
  },
  EXPIRED: {
    label: 'Vencida',
    tone: 'neutral',
    description: 'La fecha de fin ya pasó. Renueva el período para volver al catálogo.',
  },
  PAUSED: {
    label: 'Pausada',
    tone: 'secondary',
    description: 'Oculta del catálogo. Los turnos ya agendados y casos en curso continúan normalmente.',
  },
  INACTIVE: {
    label: 'Archivada',
    tone: 'neutral',
    description: 'No visible para los pacientes. Tu historial clínico se conserva.',
  },
};

const parseISODateOnly = (s: string): Date | null => {
  if (!s) return null;
  const parts = s.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Pick the dominant display status for a card chip. Priority matches the
 * backend's bucketing for the archival/lifecycle layer (INACTIVE > PAUSED >
 * EXPIRED), then differentiates ACTIVE into sub-states (QUOTA_FULL,
 * SCHEDULED, plain ACTIVE) since the backend lumps them into one bucket.
 */
export const deriveDisplayStatus = (
  offer: OfferedTreatmentResponseDTO,
  now: Date = new Date()
): OfferDisplayStatus => {
  if (offer.status === 'INACTIVE') return 'INACTIVE';
  if (offer.status === 'PAUSED') return 'PAUSED';
  if (offer.expired) return 'EXPIRED';
  if (offer.quotaExhausted) return 'QUOTA_FULL';

  if (offer.offerStartDate) {
    const start = parseISODateOnly(offer.offerStartDate);
    if (start && start.getTime() > toDateOnly(now).getTime()) return 'SCHEDULED';
  }

  return 'ACTIVE';
};

/**
 * The filter bucket an offer falls into — mutually exclusive, matches the
 * backend `?status=` filter. One offer = exactly one bucket.
 */
export const deriveBucket = (offer: OfferedTreatmentResponseDTO): OfferBucket => {
  if (offer.status === 'INACTIVE') return 'INACTIVE';
  if (offer.status === 'PAUSED') return 'PAUSED';
  if (offer.expired) return 'EXPIRED';
  return 'ACTIVE';
};

export const displayInfo = (status: OfferDisplayStatus): OfferDisplayInfo => ({
  status,
  ...DISPLAY_INFO[status],
});

export const isEditableStatus = (lifecycle: OfferedTreatmentStatus): boolean =>
  lifecycle === 'ACTIVE';
