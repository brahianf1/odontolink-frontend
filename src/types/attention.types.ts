export interface AttentionResponseDTO {
  id: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string; // Format: "YYYY-MM-DD"
  patientId: number;
  patientName: string;
  practitionerId: number;
  practitionerName: string;
  treatmentId: number;
  treatmentName: string;
  appointments: AppointmentResponseDTO[];
}

export interface AppointmentResponseDTO {
  id: number;
  appointmentTime: string; // ISO 8601 format
  motive?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  durationInMinutes: number;
  treatmentId: number;
  treatmentName: string;
  patientId: number;
  patientName: string;
  practitionerId: number;
  practitionerName: string;
  attentionId?: number;
}

export interface AppointmentRequestDTO {
  offeredTreatmentId: number;
  appointmentTime: string; // ISO 8601 format
}

export interface ProgressNoteResponseDTO {
  id: number;
  note: string;
  createdAt: string; // ISO 8601 format
  authorId: number;
  authorName: string;
  authorRole: string;
  attentionId: number;
}

export interface ProgressNoteRequestDTO {
  content: string; // Min 10, Max 5000 characters
}
