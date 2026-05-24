import type { FeedbackScoreDTO } from '../types/feedback.types';

export function averageScore(scores: FeedbackScoreDTO[]): number {
  if (!scores || scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}

export function findScore(
  scores: FeedbackScoreDTO[],
  criterionCode: string
): number | undefined {
  return scores.find((s) => s.criterionCode === criterionCode)?.score;
}
