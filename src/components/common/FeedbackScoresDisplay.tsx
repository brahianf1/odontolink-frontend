import { useState } from 'react';
import { Box, Popover, Rating, Stack, Typography, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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
      <>
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Rating value={avg} readOnly precision={0.1} size={size} />
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {avg.toFixed(1)}
          </Typography>
        </Box>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          slotProps={{
            paper: {
              sx: {
                p: 2,
                minWidth: 260,
                backgroundColor: theme.palette.surfaces.containerHighest,
                border: `1px solid ${theme.palette.outlineVariant}`,
              },
            },
          }}
        >
          <Typography variant="labelMedium" fontWeight={700} sx={{ mb: 1.5, display: 'block' }}>
            Desglose por criterio
          </Typography>
          <Stack spacing={1.25}>
            {scores.map((s) => {
              const pct = (s.score / 5) * 100;
              return (
                <Box key={s.criterionCode}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.25 }}>
                    <Typography variant="bodySmall" sx={{ flex: 1, minWidth: 0 }}>
                      {s.criterionDisplayName}
                    </Typography>
                    <Typography variant="labelMedium" fontWeight={700} sx={{ ml: 1 }}>
                      {s.score}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 6,
                      width: '100%',
                      backgroundColor: theme.palette.surfaces.containerHigh,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 300ms ease',
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Popover>
      </>
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
