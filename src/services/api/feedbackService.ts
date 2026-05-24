import apiClient from './apiClient';
import type {
  FeedbackResponseDTO,
  CreateFeedbackRequestDTO,
  FeedbackCriterionDTO,
  FeedbackDirection,
} from '../../types/feedback.types';

export const getFeedbackCriteria = async (
  direction?: FeedbackDirection
): Promise<FeedbackCriterionDTO[]> => {
  const response = await apiClient.get<FeedbackCriterionDTO[]>(
    '/api/feedback/criteria',
    { params: direction ? { direction } : undefined }
  );
  return response.data;
};

export const createFeedback = async (
  data: CreateFeedbackRequestDTO
): Promise<FeedbackResponseDTO> => {
  const response = await apiClient.post<FeedbackResponseDTO>('/api/feedback', data);
  return response.data;
};

export const getFeedbackForAttention = async (
  attentionId: number
): Promise<FeedbackResponseDTO[]> => {
  const response = await apiClient.get<FeedbackResponseDTO[]>(
    `/api/feedback/attention/${attentionId}`
  );
  return response.data;
};

export const getFeedbackForPractitioner = async (
  practitionerId: number
): Promise<FeedbackResponseDTO[]> => {
  const response = await apiClient.get<FeedbackResponseDTO[]>(
    `/api/supervisor/feedback/practitioner/${practitionerId}`
  );
  return response.data;
};
