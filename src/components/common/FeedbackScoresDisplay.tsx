import { Box, Rating, Stack, Tooltip, Typography } from '@mui/material';
import type { FeedbackScoreDTO } from '../../types/feedback.types';
import { averageScore } from '../../utils/feedbackScores';

interface FeedbackScoresDisplayProps {
  scores: FeedbackScoreDTO[];
  variant?: 'compact' | 'expanded';
  size?: 'small' | 'medium' | 'large';
}

export default function FeedbackScoresDisplay({
  scores,
  variant = 'compact',
  size = 'small',
}: FeedbackScoresDisplayProps) {
  if (!scores || scores.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin calificación
      </Typography>
    );
  }

  if (variant === 'compact') {
    const avg = averageScore(scores);
    return (
      <Tooltip
        title={scores.map((s) => `${s.criterionDisplayName}: ${s.score}/5`).join(' · ')}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Rating value={avg} readOnly precision={0.1} size={size} />
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {avg.toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({scores.length})
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Stack spacing={1.5}>
      {scores.map((s) => (
        <Box
          key={s.criterionCode}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" fontWeight={500} sx={{ minWidth: 0, flex: 1 }}>
            {s.criterionDisplayName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Rating value={s.score} readOnly size={size} />
            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 24, textAlign: 'right' }}>
              {s.score}/5
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
