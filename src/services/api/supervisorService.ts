import apiClient from './apiClient';
import type {
  PractitionerDTO,
  BatchLinkPractitionersRequestDTO,
  FeedbackDashboardResponseDTO,
  FeedbackDashboardQuery,
} from '../../types/supervisor.types';
import type {
  AttentionResponseDTO,
  ProgressNoteResponseDTO,
} from '../../types/attention.types';
import type {
  TopByCriterionResponseDTO,
  PractitionersRankingResponseDTO,
} from '../../types/feedback.types';

const SUPERVISORS_BASE = '/api/supervisors';

export const searchPractitioners = async (query?: string): Promise<PractitionerDTO[]> => {
  const response = await apiClient.get<PractitionerDTO[]>(
    `${SUPERVISORS_BASE}/practitioners/search`,
    { params: { query: query?.trim() ? query.trim() : undefined } }
  );
  return response.data;
};

export const getMyPractitioners = async (): Promise<PractitionerDTO[]> => {
  const response = await apiClient.get<PractitionerDTO[]>(
    `${SUPERVISORS_BASE}/my-practitioners`
  );
  return response.data;
};

export const linkPractitioner = async (practitionerId: number): Promise<void> => {
  await apiClient.post(`${SUPERVISORS_BASE}/my-practitioners/${practitionerId}`);
};

export const unlinkPractitioner = async (practitionerId: number): Promise<void> => {
  await apiClient.delete(`${SUPERVISORS_BASE}/my-practitioners/${practitionerId}`);
};

export const linkMultiplePractitioners = async (
  data: BatchLinkPractitionersRequestDTO
): Promise<void> => {
  await apiClient.post(`${SUPERVISORS_BASE}/my-practitioners/batch`, data);
};

export const listPractitionerAttentions = async (
  practitionerId: number
): Promise<AttentionResponseDTO[]> => {
  const response = await apiClient.get<AttentionResponseDTO[]>(
    `${SUPERVISORS_BASE}/my-practitioners/${practitionerId}/attentions`
  );
  return response.data;
};

export const getPractitionerAttentionDetail = async (
  practitionerId: number,
  attentionId: number
): Promise<AttentionResponseDTO> => {
  const response = await apiClient.get<AttentionResponseDTO>(
    `${SUPERVISORS_BASE}/my-practitioners/${practitionerId}/attentions/${attentionId}`
  );
  return response.data;
};

export const getPractitionerAttentionProgressNotes = async (
  practitionerId: number,
  attentionId: number
): Promise<ProgressNoteResponseDTO[]> => {
  const response = await apiClient.get<ProgressNoteResponseDTO[]>(
    `${SUPERVISORS_BASE}/my-practitioners/${practitionerId}/attentions/${attentionId}/progress-notes`
  );
  return response.data;
};

export const finalizeAttentionAsSupervisor = async (
  practitionerId: number,
  attentionId: number
): Promise<AttentionResponseDTO> => {
  const response = await apiClient.post<AttentionResponseDTO>(
    `${SUPERVISORS_BASE}/my-practitioners/${practitionerId}/attentions/${attentionId}/finalize`
  );
  return response.data;
};

export const getFeedbackDashboard = async (
  query: FeedbackDashboardQuery = {}
): Promise<FeedbackDashboardResponseDTO> => {
  const response = await apiClient.get<FeedbackDashboardResponseDTO>(
    `${SUPERVISORS_BASE}/feedbacks/dashboard`,
    {
      params: {
        practitionerId: query.practitionerId,
        patientId: query.patientId,
        treatmentId: query.treatmentId,
        startDate: query.startDate || undefined,
        endDate: query.endDate || undefined,
        direction: query.direction || undefined,
        page: query.page,
        size: query.size,
        sortBy: query.sortBy || undefined,
        sortDirection: query.sortDirection || undefined,
      },
    }
  );
  return response.data;
};

export const getTopByCriterion = async (params: {
  criterionCode: string;
  topN?: number;
  startDate?: string;
  endDate?: string;
  treatmentId?: number;
}): Promise<TopByCriterionResponseDTO> => {
  const response = await apiClient.get<TopByCriterionResponseDTO>(
    `${SUPERVISORS_BASE}/feedbacks/charts/top-by-criterion`,
    { params }
  );
  return response.data;
};

export const getPractitionersRanking = async (params?: {
  topN?: number;
  startDate?: string;
  endDate?: string;
  treatmentId?: number;
}): Promise<PractitionersRankingResponseDTO> => {
  const response = await apiClient.get<PractitionersRankingResponseDTO>(
    `${SUPERVISORS_BASE}/feedbacks/charts/practitioners-ranking`,
    { params }
  );
  return response.data;
};
