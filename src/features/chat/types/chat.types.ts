export type ChatViewerRole = 'PATIENT' | 'PRACTITIONER';

export interface ChatSessionResponseDTO {
  id: number;
  patientId: number;
  patientName: string;
  practitionerId: number;
  practitionerName: string;
  createdAt: string;
  unreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  blocked: boolean;
  blockedByUserId?: number | null;
  blockedByRole?: string | null;
  blockedAt?: string | null;
  blockReason?: string | null;
}

export interface ChatMessageResponseDTO {
  id: number;
  chatSessionId: number;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: string;
  readAt: string | null;
}

export interface SendMessageRequestDTO {
  content: string;
}

export interface MarkMessagesAsReadResponseDTO {
  chatSessionId: number;
  messagesMarked: number;
  readAt: string;
}

export interface BlockChatSessionRequestDTO {
  reason?: string;
}

export interface ChatReadReceiptDTO {
  messageId: number;
  readAt: string;
}

export interface ChatMessagesPollResponseDTO {
  messages: ChatMessageResponseDTO[];
  readReceipts: ChatReadReceiptDTO[];
  serverTime: string;
}

export interface PagedChatMessagesResponseDTO {
  messages: ChatMessageResponseDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  serverTime: string;
}

export interface UnreadCountResponseDTO {
  total: number;
}

export interface StartChatSessionRequestDTO {
  patientId?: number;
  practitionerId?: number;
}

export type OptimisticMessageStatus = 'sending' | 'sent' | 'failed';

export interface OptimisticMessage extends ChatMessageResponseDTO {
  status: OptimisticMessageStatus;
}
