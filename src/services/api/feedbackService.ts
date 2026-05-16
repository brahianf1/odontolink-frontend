import apiClient from './apiClient';
import type {
  FeedbackResponseDTO,
  CreateFeedbackRequestDTO,
} from '../../types/feedback.types';

// ============= Feedback =============
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

// Endpoint para supervisores - obtener feedback de un practicante específico
export const getFeedbackForPractitioner = async (
  practitionerId: number
): Promise<FeedbackResponseDTO[]> => {
  const response = await apiClient.get<FeedbackResponseDTO[]>(
    `/api/supervisor/feedback/practitioner/${practitionerId}`
  );
  return response.data;
};
