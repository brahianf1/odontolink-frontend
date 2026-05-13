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

export interface OfferedTreatmentResponseDTO {
  id: number;
  practitionerId: number;
  practitionerName: string;
  treatment: TreatmentResponseDTO;
  requirements?: string;
  durationInMinutes: number;
  availabilitySlots: AvailabilitySlotDTO[];
  offerStartDate?: string; // Format: "YYYY-MM-DD"
  offerEndDate?: string; // Format: "YYYY-MM-DD"
  maxCompletedAttentions?: number;
  completedAttentions?: number;
  attendedPatientsCount?: number;
}

export interface AddOfferedTreatmentRequestDTO {
  treatmentId: number;
  requirements?: string;
  durationInMinutes: number;
  availabilitySlots: AvailabilitySlotDTO[];
  offerStartDate: string; // Format: "YYYY-MM-DD"
  offerEndDate: string; // Format: "YYYY-MM-DD"
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
