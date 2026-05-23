import {
  Alert,
  Box,
  Rating,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import type { FeedbackCriterionDTO } from '../../types/feedback.types';

interface FeedbackSurveyFormProps {
  criteria: FeedbackCriterionDTO[];
  criteriaLoading: boolean;
  criteriaError: string | null;
  scores: Record<string, number>;
  onScoreChange: (code: string, score: number) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  disabled?: boolean;
}

export default function FeedbackSurveyForm({
  criteria,
  criteriaLoading,
  criteriaError,
  scores,
  onScoreChange,
  comment,
  onCommentChange,
  disabled = false,
}: FeedbackSurveyFormProps) {
  if (criteriaLoading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rectangular" width={140} height={28} />
          </Box>
        ))}
        <Skeleton variant="rectangular" height={100} />
      </Stack>
    );
  }

  if (criteriaError) {
    return <Alert severity="error">{criteriaError}</Alert>;
  }

  if (criteria.length === 0) {
    return (
      <Alert severity="info">
        La encuesta de evaluación no está disponible en este momento.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        {criteria.map((criterion) => (
          <Box
            key={criterion.code}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {criterion.displayName}
              </Typography>
              {criterion.description && (
                <Tooltip title={criterion.description} arrow>
                  <HelpIcon fontSize="small" color="action" sx={{ cursor: 'help' }} />
                </Tooltip>
              )}
            </Box>
            <Rating
              value={scores[criterion.code] ?? 0}
              onChange={(_, v) => {
                if (v !== null) onScoreChange(criterion.code, v);
              }}
              size="large"
              disabled={disabled}
              sx={{ '& .MuiRating-icon': { fontSize: '2rem' } }}
            />
          </Box>
        ))}
      </Stack>

      <Box>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Comentarios (opcional)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Escribe un comentario adicional…"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          inputProps={{ maxLength: 1000 }}
          helperText={`${comment.length}/1000 caracteres`}
          disabled={disabled}
        />
      </Box>
    </Stack>
  );
}
