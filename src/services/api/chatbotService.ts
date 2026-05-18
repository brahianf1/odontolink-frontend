import apiClient from './apiClient';
import type {
  ChatbotMessageRequestDTO,
  ChatbotMessageResponseDTO,
  ChatbotPublicInfoResponseDTO,
} from '../../types/chatbot.types';

const BASE = '/api/chatbot';

export const getInfo = async (): Promise<ChatbotPublicInfoResponseDTO> => {
  const res = await apiClient.get<ChatbotPublicInfoResponseDTO>(`${BASE}/info`);
  return res.data;
};

export const sendMessage = async (
  payload: ChatbotMessageRequestDTO
): Promise<ChatbotMessageResponseDTO> => {
  const res = await apiClient.post<ChatbotMessageResponseDTO>(`${BASE}/messages`, payload);
  return res.data;
};

export const closeSession = async (
  sessionId: string,
  anonymousToken?: string
): Promise<void> => {
  await apiClient.delete(`${BASE}/sessions/${encodeURIComponent(sessionId)}`, {
    params: anonymousToken ? { anonymousToken } : undefined,
    validateStatus: (status) => status === 200 || status === 204,
  });
};
