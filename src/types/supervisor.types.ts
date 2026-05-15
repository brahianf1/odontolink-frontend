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

export interface FeedbackDashboardQuery {
  practitionerId?: number;
  patientId?: number;
  treatmentId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface FeedbackDashboardResponseDTO {
  feedbacks: PageResponse<FeedbackResponseDTO>;
  averageRating: number;
  totalFeedbacksCount: number;
}
