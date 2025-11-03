// Appointment Types based on OpenAPI specification

export interface AppointmentRequestDTO {
  offeredTreatmentId: number;
  appointmentTime: string;
}

export interface AppointmentResponseDTO {
  id: number;
  appointmentTime: string;
  motive?: string;
  status: string;
  durationInMinutes: number;
  treatmentId: number;
  treatmentName: string;
  patientId: number;
  patientName: string;
  practitionerId: number;
  practitionerName: string;
  attentionId?: number;
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
