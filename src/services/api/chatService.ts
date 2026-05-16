import apiClient from './apiClient';
import type {
  ChatSessionResponseDTO,
  ChatMessageResponseDTO,
  ChatMessagesPollResponseDTO,
  PagedChatMessagesResponseDTO,
  SendMessageRequestDTO,
  MarkMessagesAsReadResponseDTO,
  BlockChatSessionRequestDTO,
  UnreadCountResponseDTO,
  StartChatSessionRequestDTO,
} from '../../features/chat/types/chat.types';

const CHAT_BASE = '/api/chat';

const chatService = {
  getMyChatSessions: async (
    since?: string
  ): Promise<ChatSessionResponseDTO[]> => {
    const response = await apiClient.get<ChatSessionResponseDTO[]>(
      `${CHAT_BASE}/sessions`,
      { params: since ? { since } : undefined }
    );
    return response.data;
  },

  startChatSession: async (
    payload: StartChatSessionRequestDTO
  ): Promise<ChatSessionResponseDTO> => {
    const response = await apiClient.post<ChatSessionResponseDTO>(
      `${CHAT_BASE}/sessions`,
      payload
    );
    return response.data;
  },

  getMessagesPage: async (
    sessionId: number,
    page: number,
    size = 50
  ): Promise<PagedChatMessagesResponseDTO> => {
    const response = await apiClient.get<PagedChatMessagesResponseDTO>(
      `${CHAT_BASE}/sessions/${sessionId}/messages`,
      { params: { page, size } }
    );
    return response.data;
  },

  pollMessages: async (
    sessionId: number,
    since: string
  ): Promise<ChatMessagesPollResponseDTO> => {
    const response = await apiClient.get<ChatMessagesPollResponseDTO>(
      `${CHAT_BASE}/sessions/${sessionId}/messages`,
      { params: { since } }
    );
    return response.data;
  },

  sendMessage: async (
    sessionId: number,
    payload: SendMessageRequestDTO
  ): Promise<ChatMessageResponseDTO> => {
    const response = await apiClient.post<ChatMessageResponseDTO>(
      `${CHAT_BASE}/sessions/${sessionId}/messages`,
      payload
    );
    return response.data;
  },

  markMessagesAsRead: async (
    sessionId: number
  ): Promise<MarkMessagesAsReadResponseDTO> => {
    const response = await apiClient.post<MarkMessagesAsReadResponseDTO>(
      `${CHAT_BASE}/sessions/${sessionId}/messages/read`
    );
    return response.data;
  },

  blockChatSession: async (
    sessionId: number,
    payload: BlockChatSessionRequestDTO
  ): Promise<ChatSessionResponseDTO> => {
    const response = await apiClient.post<ChatSessionResponseDTO>(
      `${CHAT_BASE}/sessions/${sessionId}/block`,
      payload
    );
    return response.data;
  },

  unblockChatSession: async (
    sessionId: number
  ): Promise<ChatSessionResponseDTO> => {
    const response = await apiClient.post<ChatSessionResponseDTO>(
      `${CHAT_BASE}/sessions/${sessionId}/unblock`
    );
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponseDTO> => {
    const response = await apiClient.get<UnreadCountResponseDTO>(
      `${CHAT_BASE}/unread-count`
    );
    return response.data;
  },
};

export default chatService;
