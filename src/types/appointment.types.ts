// Appointment DTOs - canonical types aligned with the backend OpenAPI spec.

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AppointmentRequestDTO {
  offeredTreatmentId: number;
  appointmentTime: string;
}

export interface AppointmentResponseDTO {
  id: number;
  appointmentTime: string;
  motive?: string;
  status: AppointmentStatus;
  durationInMinutes: number;
  cancellationReason?: string;
  treatmentId: number;
  treatmentName: string;
  patientId: number;
  patientName: string;
  patientProfilePictureUrl?: string | null;
  practitionerId: number;
  practitionerName: string;
  practitionerProfilePictureUrl?: string | null;
  attentionId?: number;
}

export interface CancelAppointmentByPatientRequestDTO {
  reason?: string;
}
