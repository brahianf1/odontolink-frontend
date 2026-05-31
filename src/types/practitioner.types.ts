export interface AvailabilitySlotDTO {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // Format: "HH:mm:ss"
  endTime: string; // Format: "HH:mm:ss"
}

export interface TreatmentResponseDTO {
  id: number;
  name: string;
  description: string;
  area: string;
}

export type OfferedTreatmentStatus = 'ACTIVE' | 'PAUSED' | 'INACTIVE';

export interface OfferedTreatmentResponseDTO {
  id: number;
  practitionerId: number;
  practitionerName: string;
  practitionerProfilePictureUrl?: string | null;
  treatment: TreatmentResponseDTO;
  requirements?: string;
  durationInMinutes: number;
  availabilitySlots: AvailabilitySlotDTO[];
  offerStartDate?: string;
  offerEndDate?: string;
  maxCompletedAttentions?: number;
  currentCompletedAttentions?: number;
  currentActiveAttentions?: number;
  currentCancelledAttentions?: number;
  status: OfferedTreatmentStatus;
  expired: boolean;
  quotaExhausted: boolean;
}

export interface AddOfferedTreatmentRequestDTO {
  treatmentId: number;
  requirements?: string;
  durationInMinutes: number;
  availabilitySlots: AvailabilitySlotDTO[];
  offerStartDate: string;
  offerEndDate: string;
  maxCompletedAttentions: number;
}

export interface UpdateOfferedTreatmentRequestDTO {
  requirements?: string;
  durationInMinutes?: number;
  availabilitySlots: AvailabilitySlotDTO[];
  offerStartDate?: string;
  offerEndDate?: string;
  maxCompletedAttentions?: number;
}

export interface CreateTreatmentRequestDTO {
  name: string;
  description?: string;
  area?: string;
}

export type OfferedTreatmentDeletionOutcome = 'SOFT_DELETED' | 'HARD_DELETED';

export interface OfferedTreatmentDeletionResponseDTO {
  outcome: OfferedTreatmentDeletionOutcome;
  message?: string;
}

export interface CancelAppointmentByPractitionerRequestDTO {
  reason: string;
}

export interface CancelAttentionRequestDTO {
  reason: string;
}

/** Buckets the backend exposes via ?status= on GET /api/practitioner/offered-treatments. */
export type OfferedTreatmentStatusFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'PAUSED'
  | 'INACTIVE'
  | 'EXPIRED';
