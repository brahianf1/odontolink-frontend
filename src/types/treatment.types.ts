// Treatment Types based on OpenAPI specification

export interface TreatmentResponseDTO {
  id: number;
  name: string;
  description?: string;
  area?: string;
}

export interface OfferedTreatmentResponseDTO {
  id: number;
  practitionerId: number;
  practitionerName: string;
  treatment: TreatmentResponseDTO;
  requirements?: string;
  durationInMinutes: number;
  availabilitySlots: AvailabilitySlotDTO[];
}

export interface AvailabilitySlotDTO {
  dayOfWeek: string;
  startTime: LocalTime;
  endTime: LocalTime;
}

export interface LocalTime {
  hour: number;
  minute: number;
  second?: number;
  nano?: number;
}

export interface CreateTreatmentRequestDTO {
  name: string;
  description?: string;
  area?: string;
}

export interface AddOfferedTreatmentRequestDTO {
  treatmentId: number;
  requirements?: string;
  durationInMinutes: number;
  availabilitySlots: AvailabilitySlotDTO[];
}

export interface UpdateOfferedTreatmentRequestDTO {
  requirements?: string;
  durationInMinutes?: number;
  availabilitySlots: AvailabilitySlotDTO[];
}
