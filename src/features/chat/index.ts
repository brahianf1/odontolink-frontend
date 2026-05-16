export { default as ChatLayout } from './components/ChatLayout';

export type {
  ChatSessionResponseDTO,
  ChatMessageResponseDTO,
  SendMessageRequestDTO,
  MarkMessagesAsReadResponseDTO,
  BlockChatSessionRequestDTO,
  ChatViewerRole,
  OptimisticMessage,
  ChatMessagesPollResponseDTO,
  PagedChatMessagesResponseDTO,
  UnreadCountResponseDTO,
} from './types/chat.types';

export { mapChatError, type ChatErrorCode } from './utils/chatApiErrors';
export {
  validateChatMessage,
  validateBlockReason,
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_BLOCK_REASON_MAX_LENGTH,
} from './utils/chatValidation';
