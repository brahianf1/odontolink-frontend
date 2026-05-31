export type {
  AppointmentResponseDTO,
  AppointmentRequestDTO,
  AppointmentStatus,
} from './appointment.types';

import type { AppointmentResponseDTO } from './appointment.types';

export type AttentionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface AttentionResponseDTO {
  id: number;
  status: AttentionStatus;
  startDate: string;
  patientId: number;
  patientName: string;
  patientProfilePictureUrl?: string | null;
  practitionerId: number;
  practitionerName: string;
  practitionerProfilePictureUrl?: string | null;
  treatmentId: number;
  treatmentName: string;
  appointments: AppointmentResponseDTO[];
}

export interface ProgressNoteResponseDTO {
  id: number;
  note: string;
  createdAt: string;
  authorId: number;
  authorName: string;
  authorRole: string;
  authorProfilePictureUrl?: string | null;
  attentionId: number;
}

export interface ProgressNoteRequestDTO {
  content: string;
}
