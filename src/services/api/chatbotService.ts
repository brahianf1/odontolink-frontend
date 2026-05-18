import apiClient from './apiClient';
import type {
  ChatbotMessageRequestDTO,
  ChatbotMessageResponseDTO,
  ChatbotPublicInfoResponseDTO,
} from '../../types/chatbot.types';

const BASE = '/api/chatbot';

// /messages can be slower than the default apiClient timeout: provider cold
// starts on DigitalOcean and the lazy resolution of agentInvocationUrl can
// push the first call past 10s. Backend says 1-5s typical, allow up to 60s.
const SEND_MESSAGE_TIMEOUT_MS = 60_000;

export const getInfo = async (): Promise<ChatbotPublicInfoResponseDTO> => {
  const res = await apiClient.get<ChatbotPublicInfoResponseDTO>(`${BASE}/info`);
  return res.data;
};

export const sendMessage = async (
  payload: ChatbotMessageRequestDTO
): Promise<ChatbotMessageResponseDTO> => {
  const res = await apiClient.post<ChatbotMessageResponseDTO>(`${BASE}/messages`, payload, {
    timeout: SEND_MESSAGE_TIMEOUT_MS,
  });
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
