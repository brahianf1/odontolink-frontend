// Supervisor (Docente) DTOs aligned with the backend OpenAPI spec.

import type { PageResponse } from './common.types';
import type { FeedbackResponseDTO, FeedbackDirection } from './feedback.types';

export type { FeedbackDirection };

export interface UserBasicDTO {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  profilePictureUrl?: string | null;
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
