export interface FeedbackResponseDTO {
  id: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO 8601 format
  submittedById: number;
  submittedByName: string;
  submittedByRole: string;
  attentionId: number;
  treatmentName: string;
  patientName: string;
  practitionerName: string;
}

export interface CreateFeedbackRequestDTO {
  attentionId: number;
  rating: number; // 1-5
  comment?: string; // Max 1000 characters
}

export interface ChatSessionResponseDTO {
  id: number;
  patientId: number;
  patientName: string;
  practitionerId: number;
  practitionerName: string;
  createdAt: string; // ISO 8601 format
}

export interface ChatMessageResponseDTO {
  id: number;
  chatSessionId: number;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: string; // ISO 8601 format
}

export interface SendMessageRequestDTO {
  content: string; // Max 2000 characters
}
