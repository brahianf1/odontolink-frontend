// Appointment Types based on OpenAPI specification

export interface AppointmentRequestDTO {
  offeredTreatmentId: number;
  appointmentTime: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AppointmentResponseDTO {
  id: number;
  appointmentTime: string;
  motive?: string;
  status: AppointmentStatus;
  durationInMinutes: number;
  treatmentId: number;
  treatmentName: string;
  patientId: number;
  patientName: string;
  practitionerId: number;
  practitionerName: string;
  attentionId?: number;
}
