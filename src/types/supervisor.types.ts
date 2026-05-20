// Supervisor (Docente) DTOs aligned with the backend OpenAPI spec.

import type { PageResponse } from './common.types';
import type { FeedbackResponseDTO } from './feedback.types';

export interface UserBasicDTO {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
}

export interface PractitionerDTO {
  id: number;
  studentId: string;
  studyYear: number;
  user: UserBasicDTO;
}

export interface BatchLinkPractitionersRequestDTO {
  practitionerIds: number[];
}

export type FeedbackDirection =
  | 'PATIENT_TO_PRACTITIONER'
  | 'PRACTITIONER_TO_PATIENT';

export interface FeedbackDashboardQuery {
  practitionerId?: number;
  patientId?: number;
  treatmentId?: number;
  startDate?: string;
  endDate?: string;
  direction?: FeedbackDirection;
  page?: number;
  size?: number;
  sortBy?:
    | 'createdAt'
    | 'rating'
    | 'practitionerId'
    | 'patientId'
    | 'treatmentId'
    | 'id';
  sortDirection?: 'ASC' | 'DESC';
}

export interface FeedbackDashboardResponseDTO {
  feedbacks: PageResponse<FeedbackResponseDTO>;
  averageRatingPatientToPractitioner: number;
  totalPatientToPractitioner: number;
  averageRatingPractitionerToPatient: number;
  totalPractitionerToPatient: number;
}
