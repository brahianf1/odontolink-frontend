import { Card, CardContent, Box, Typography, Skeleton, Stack } from '@mui/material';
import type { ReactNode } from 'react';

interface FeedbackMetricCardProps {
  title: string;
  value: ReactNode;
  caption?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export default function FeedbackMetricCard({
  title,
  value,
  caption,
  icon,
  loading = false,
}: FeedbackMetricCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          {icon && <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>}
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
        {loading ? (
          <Skeleton variant="text" width="60%" height={48} />
        ) : (
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {value}
          </Typography>
        )}
        {caption && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
