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
