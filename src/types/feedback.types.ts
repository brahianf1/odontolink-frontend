export type FeedbackDirection =
  | 'PATIENT_TO_PRACTITIONER'
  | 'PRACTITIONER_TO_PATIENT';

export interface FeedbackCriterionDTO {
  code: string;
  displayName: string;
  description: string | null;
  displayOrder: number;
}

export interface FeedbackScoreDTO {
  criterionCode: string;
  criterionDisplayName: string;
  score: number;
}

export interface CreateFeedbackScoreDTO {
  criterionCode: string;
  score: number;
}

export interface FeedbackResponseDTO {
  id: number;
  scores: FeedbackScoreDTO[];
  comment?: string;
  createdAt: string;
  submittedById: number;
  submittedByName: string;
  submittedByRole: string;
  submittedByProfilePictureUrl?: string | null;
  attentionId: number;
  treatmentName: string;
  patientName: string;
  patientProfilePictureUrl?: string | null;
  practitionerName: string;
  practitionerProfilePictureUrl?: string | null;
}

export interface CreateFeedbackRequestDTO {
  attentionId: number;
  scores: CreateFeedbackScoreDTO[];
  comment?: string;
}

export interface CriterionRef {
  code: string;
  displayName: string;
}

export interface TopByCriterionEntryDTO {
  practitionerId: number;
  practitionerName: string;
  average: number;
  feedbackCount: number;
  rankPosition: number;
}

export interface TopByCriterionResponseDTO {
  criterion: CriterionRef;
  minSamplesThreshold: number;
  entries: TopByCriterionEntryDTO[];
}

export interface PractitionersRankingEntryDTO {
  practitionerId: number;
  practitionerName: string;
  combinedAverage: number;
  perCriterionAverages: Record<string, number>;
  feedbackCount: number;
  rankPosition: number;
}

export interface PractitionersRankingResponseDTO {
  criteriaUsed: CriterionRef[];
  minSamplesThreshold: number;
  entries: PractitionersRankingEntryDTO[];
}
