import apiClient from './apiClient';
import type {
  FeedbackResponseDTO,
  CreateFeedbackRequestDTO,
  ChatSessionResponseDTO,
  ChatMessageResponseDTO,
  SendMessageRequestDTO,
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

// ============= Chat =============
export const getMyChatSessions = async (): Promise<ChatSessionResponseDTO[]> => {
  const response = await apiClient.get<ChatSessionResponseDTO[]>('/api/chat/sessions');
  return response.data;
};

export const getMessages = async (
  sessionId: number,
  since?: string
): Promise<ChatMessageResponseDTO[]> => {
  const params = since ? { since } : undefined;
  const response = await apiClient.get<ChatMessageResponseDTO[]>(
    `/api/chat/sessions/${sessionId}/messages`,
    { params }
  );
  return response.data;
};

export const sendMessage = async (
  sessionId: number,
  data: SendMessageRequestDTO
): Promise<ChatMessageResponseDTO> => {
  const response = await apiClient.post<ChatMessageResponseDTO>(
    `/api/chat/sessions/${sessionId}/messages`,
    data
  );
  return response.data;
};
